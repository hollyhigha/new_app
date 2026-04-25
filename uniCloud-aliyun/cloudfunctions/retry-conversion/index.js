'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const logsCollection = db.collection('conversion-logs')

const OE_API_URL = 'https://analytics.oceanengine.com/api/v2/conversion'
const OE_ACCESS_TOKEN = process.env.OE_ACCESS_TOKEN || ''

// 重试节奏与 report-conversion 保持一致
// 1min / 5min / 15min / 30min / 2h
const RETRY_INTERVALS = [60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000]
const MAX_RETRY = RETRY_INTERVALS.length
const REPORT_TTL = 7 * 24 * 60 * 60 * 1000

const INTERNAL_WEBHOOK = process.env.INTERNAL_WEBHOOK_URL || ''

exports.main = async () => {
  const now = Date.now()
  const sevenDaysAgo = now - REPORT_TTL

  const res = await logsCollection
    .where({
      success: false,
      retry_count: dbCmd.lt(MAX_RETRY),
      next_retry_time: dbCmd.lte(now),
      create_time: dbCmd.gte(sevenDaysAgo)
    })
    .limit(50)
    .get()

  const records = res.result.data || []
  console.log(`retry-conversion: found ${records.length} records to retry`)

  let successCount = 0
  let failCount = 0

  for (const record of records) {
    try {
      const requestBody = record.request_body || {
        event_type: record.event_type === 'register' ? 0 : 6,
        context: { ad: { callback: record.click_id } },
        timestamp: Math.floor(Date.now() / 1000)
      }

      const apiRes = await uniCloud.httpclient.request(OE_API_URL, {
        method: 'POST',
        data: requestBody,
        contentType: 'json',
        dataType: 'json',
        timeout: 10000,
        headers: { 'Access-Token': OE_ACCESS_TOKEN }
      })

      const success = apiRes.status === 200 && apiRes.data?.code === 0
      const newRetryCount = record.retry_count + 1

      const updateData = {
        success,
        retry_count: newRetryCount,
        response_code: apiRes.status,
        response_body: apiRes.data || {}
      }

      if (!success && newRetryCount < MAX_RETRY) {
        const idx = Math.min(newRetryCount, RETRY_INTERVALS.length - 1)
        updateData.next_retry_time = now + RETRY_INTERVALS[idx]
      } else {
        updateData.next_retry_time = null
      }

      await logsCollection.doc(record._id).update(updateData)

      if (success) {
        successCount++
      } else {
        failCount++
        if (newRetryCount >= MAX_RETRY && INTERNAL_WEBHOOK) {
          await notifyFailure(record)
        }
      }
    } catch (e) {
      console.error(`retry failed for ${record._id}:`, e)
      failCount++
    }
  }

  return {
    total: records.length,
    success: successCount,
    fail: failCount
  }
}

async function notifyFailure(record) {
  const msg = {
    msgtype: 'markdown',
    markdown: {
      content: [
        '**转化回传失败告警**',
        `> click_id: ${record.click_id}`,
        `> event_type: ${record.event_type}`,
        `> 重试次数: ${record.retry_count + 1}/${MAX_RETRY}`,
        `> 最后响应: ${JSON.stringify(record.response_body || {}).slice(0, 200)}`,
        `> 请在 uniCloud 控制台检查并手动处理`
      ].join('\n')
    }
  }
  try {
    await uniCloud.httpclient.request(INTERNAL_WEBHOOK, {
      method: 'POST',
      data: msg,
      contentType: 'json',
      timeout: 5000
    })
  } catch (e) {
    console.error('notifyFailure webhook failed:', e)
  }
}
