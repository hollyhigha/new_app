'use strict'

const db = uniCloud.database()
const logsCollection = db.collection('conversion-logs')

// 巨量引擎转化回传 API
// 需在 uniCloud 云函数环境变量中配置：
//   OE_ACCESS_TOKEN       - 巨量引擎后台获取的 Access Token
const OE_API_URL = 'https://analytics.oceanengine.com/api/v2/conversion'
const OE_ACCESS_TOKEN = process.env.OE_ACCESS_TOKEN || ''

// 重试时间间隔（首次失败后的重试节奏，毫秒）
// 1min / 5min / 15min / 30min / 2h
const RETRY_INTERVALS = [60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000]

// 巨量引擎事件类型映射
// 完整列表见：https://ad.oceanengine.com/openapi/doc/index.html?id=1680
const EVENT_TYPE_MAP = {
  register: 2,       // 注册
  form_submit: 6,    // 表单提交（获客）
  app_install: 4     // 激活（App 首次安装打开）
}

// app_type: 1=Android, 0=iOS；H5/小程序不回传
function normalizeAppType(appType) {
  if (appType === 0 || appType === 1) return appType
  return undefined
}

exports.main = async (event) => {
  const {
    event_type,
    click_id,
    client_id = '',
    user_id = '',
    app_type
  } = event

  if (!click_id || !event_type) {
    return { code: 400, msg: 'missing click_id or event_type' }
  }

  // 幂等：同一 click_id + event_type 已成功回传则跳过
  const existLog = await logsCollection
    .where({ click_id, event_type, success: true })
    .limit(1)
    .get()

  if (existLog.result.data.length > 0) {
    return { code: 0, msg: 'already reported' }
  }

  if (!OE_ACCESS_TOKEN) {
    console.warn('OE_ACCESS_TOKEN not configured, skipping report')
    return { code: 0, msg: 'skipped: token not configured' }
  }

  const oeEventType = EVENT_TYPE_MAP[event_type]
  if (oeEventType === undefined) {
    return { code: 400, msg: `unknown event_type: ${event_type}` }
  }

  const normalizedAppType = normalizeAppType(app_type)

  const requestBody = {
    event_type: oeEventType,
    context: {
      ad: {
        callback: click_id
      }
    },
    timestamp: Math.floor(Date.now() / 1000)
  }
  // 巨量引擎要求 App 端事件携带 app_type 字段
  if (normalizedAppType !== undefined) {
    requestBody.context.ad.app_type = normalizedAppType
  }

  let success = false
  let responseCode = 0
  let responseBody = {}

  try {
    const res = await uniCloud.httpclient.request(OE_API_URL, {
      method: 'POST',
      data: requestBody,
      contentType: 'json',
      dataType: 'json',
      timeout: 10000,
      headers: {
        'Access-Token': OE_ACCESS_TOKEN
      }
    })
    responseCode = res.status
    responseBody = res.data || {}
    success = responseCode === 200 && responseBody.code === 0
    if (!success) {
      console.error('OE API returned error:', JSON.stringify(responseBody))
    }
  } catch (e) {
    console.error('report-conversion request failed:', e)
    responseBody = { error: e.message }
  }

  const now = Date.now()
  await logsCollection.add({
    user_id,
    click_id,
    client_id,
    event_type,
    oe_event_type: oeEventType,
    app_type: normalizedAppType === undefined ? null : normalizedAppType,
    request_body: requestBody,
    response_code: responseCode,
    response_body: responseBody,
    success,
    retry_count: 0,
    next_retry_time: success ? null : now + RETRY_INTERVALS[0],
    create_time: now
  })

  return {
    code: success ? 0 : -1,
    msg: success ? 'ok' : 'report failed, will retry'
  }
}
