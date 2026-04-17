'use strict'

const db = uniCloud.database()
const logsCollection = db.collection('conversion-logs')

const OE_API_URL = 'https://analytics.oceanengine.com/api/v2/conversion'
const OE_ACCESS_TOKEN = process.env.OE_ACCESS_TOKEN || ''

const RETRY_INTERVALS = [60000, 300000, 1800000]

exports.main = async (event) => {
  const { event_type, click_id, client_id, user_id } = event

  if (!click_id || !event_type) {
    return { code: 400, msg: 'missing click_id or event_type' }
  }

  const existLog = await logsCollection
    .where({ click_id, event_type, success: true })
    .limit(1)
    .get()

  if (existLog.result.data.length > 0) {
    return { code: 0, msg: 'already reported' }
  }

  const eventTypeMap = {
    register: 0,
    form_submit: 6
  }

  const requestBody = {
    event_type: eventTypeMap[event_type] || 0,
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
    success = responseCode === 200 && responseBody.code === 0
  } catch (e) {
    console.error('report-conversion request failed:', e)
    responseBody = { error: e.message }
  }

  const now = Date.now()
  const logData = {
    user_id: user_id || '',
    click_id,
    event_type,
    request_body: requestBody,
    response_code: responseCode,
    response_body: responseBody,
    success,
    retry_count: 0,
    next_retry_time: success ? null : now + RETRY_INTERVALS[0],
    create_time: now
  }

  await logsCollection.add(logData)

  return { code: success ? 0 : -1, msg: success ? 'ok' : 'report failed, will retry' }
}
