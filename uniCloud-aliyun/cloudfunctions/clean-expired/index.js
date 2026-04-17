'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async () => {
  const now = Date.now()

  const conversionTTL = 180 * 24 * 60 * 60 * 1000
  const conversionRes = await db.collection('conversion-logs')
    .where({
      create_time: dbCmd.lt(now - conversionTTL)
    })
    .limit(500)
    .remove()

  console.log(`cleaned conversion-logs: ${conversionRes.result.deleted} records`)

  const smsTTL = 30 * 24 * 60 * 60 * 1000
  const smsRes = await db.collection('sms-logs')
    .where({
      create_time: dbCmd.lt(now - smsTTL)
    })
    .limit(500)
    .remove()

  console.log(`cleaned sms-logs: ${smsRes.result.deleted} records`)

  return {
    conversionCleaned: conversionRes.result.deleted,
    smsCleaned: smsRes.result.deleted
  }
}
