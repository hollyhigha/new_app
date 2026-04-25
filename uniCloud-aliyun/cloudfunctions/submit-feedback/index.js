'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const feedbackCollection = db.collection('feedbacks')

const VALID_TYPES = ['suggest', 'error', 'problem', 'other']
const VALID_PLATFORMS = ['ios', 'android', 'h5', 'mp-weixin', 'other']

exports.main = async (event, context) => {
  let userId = ''
  try {
    const uniID = require('uni-id')
    const payload = await uniID.checkToken(event.uniIdToken)
    if (!payload.code) {
      userId = payload.uid
    }
  } catch (e) {
    // 未登录，可匿名反馈
  }

  const {
    type = 'other',
    content = '',
    contact = '',
    platform = 'other',
    app_version = ''
  } = event

  const trimmedContent = String(content).trim()
  if (!VALID_TYPES.includes(type)) {
    return { code: 400, msg: '反馈类型无效' }
  }
  if (!trimmedContent || trimmedContent.length < 10) {
    return { code: 400, msg: '反馈内容至少 10 个字' }
  }
  if (trimmedContent.length > 500) {
    return { code: 400, msg: '反馈内容不得超过 500 字' }
  }
  const trimmedContact = String(contact).trim().slice(0, 100)
  const safePlatform = VALID_PLATFORMS.includes(platform) ? platform : 'other'

  const clientIP = context.CLIENTIP || ''
  const now = Date.now()

  if (clientIP) {
    const oneHourAgo = now - 60 * 60 * 1000
    const ipCount = await feedbackCollection
      .where({ submit_ip: clientIP, create_time: dbCmd.gte(oneHourAgo) })
      .count()
    if (ipCount.result.total >= 10) {
      return { code: 429, msg: '操作过于频繁，请稍后再试' }
    }
  }

  await feedbackCollection.add({
    user_id: userId || '',
    type,
    content: trimmedContent,
    contact: trimmedContact,
    platform: safePlatform,
    app_version: String(app_version || '').slice(0, 32),
    submit_ip: clientIP,
    status: 0,
    reply: '',
    create_time: now,
    update_time: now
  })

  return { code: 0, msg: '提交成功' }
}
