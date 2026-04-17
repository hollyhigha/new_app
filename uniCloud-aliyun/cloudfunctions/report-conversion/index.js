'use strict'

const db = uniCloud.database()
const logsCollection = db.collection('conversion-logs')

// 巨量引擎转化回传 API
// TODO: 在 uniCloud 云函数环境变量中配置 OE_ACCESS_TOKEN
// 获取方式：巨量引擎后台 → 工具 → 转化追踪 → 获取 Access Token
const OE_API_URL = 'https://analytics.oceanengine.com/api/v2/conversion'
const OE_ACCESS_TOKEN = process.env.OE_ACCESS_TOKEN || 'PLACEHOLDER_ACCESS_TOKEN'

const RETRY_INTERVALS = [60000, 300000, 1800000] // 1分钟、5分钟、30分钟

// 巨量引擎事件类型映射
// 完整列表见：https://ad.oceanengine.com/openapi/doc/index.html?id=1680
const EVENT_TYPE_MAP = {
  register: 2,       // 注册
  form_submit: 6,    // 表单提交（获客）
  app_install: 4     // 激活（App 首次安装打开）
}

exports.main = async (event) => {
  const { event_type, click_id, client_id, user_id } = event

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

  // 校验 Access Token 是否已配置
  if (!OE_ACCESS_TOKEN || OE_ACCESS_TOKEN === 'PLACEHOLDER_ACCESS_TOKEN') {
    console.warn('OE_ACCESS_TOKEN not configured, skipping report')
    return { code: 0, msg: 'skipped: token not configured' }
  }

  const oeEventType = EVENT_TYPE_MAP[event_type]
  if (oeEventType === undefined) {
    return { code: 400, msg: `unknown event_type: ${event_type}` }
  }

  const requestBody = {
    event_type: oeEventType,
    context: {
      ad: {
        callback: click_id
      }
    },
    timestamp: Math.floor(Date.now() / 1000)
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
    // 巨量引擎回传成功：HTTP 200 且 code === 0
    success = responseCode === 200 && responseBody.code === 0
    if (!success) {
      console.error('OE API returned error:', JSON.stringify(responseBody))
    }
  } catch (e) {
    console.error('report-conversion request failed:', e)
    responseBody = { error: e.message }
  }

  const now = Date.now()
  const logData = {
    user_id: user_id || '',
    click_id,
    client_id: client_id || '',
    event_type,
    oe_event_type: oeEventType,
    request_body: requestBody,
    response_code: responseCode,
    response_body: responseBody,
    success,
    retry_count: 0,
    next_retry_time: success ? null : now + RETRY_INTERVALS[0],
    create_time: now
  }

  await logsCollection.add(logData)

  return {
    code: success ? 0 : -1,
    msg: success ? 'ok' : 'report failed, will retry'
  }
}
