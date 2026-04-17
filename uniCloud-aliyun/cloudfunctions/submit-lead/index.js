'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const leadsCollection = db.collection('leads')
const clientsCollection = db.collection('clients')

exports.main = async (event, context) => {
  // 1. Token 校验（必须登录态）
  // uniCloud 阿里云版通过 uniIdToken 验证用户身份
  const uniID = require('uni-id')
  const payload = await uniID.checkToken(event.uniIdToken)
  if (payload.code) {
    return { code: 401, msg: '请先登录' }
  }
  const userId = payload.uid

  const { name, phone, city, interest, click_id, client_id, consent_time } = event

  // 2. 参数校验（不信任前端，先 trim 再校验）
  const trimmedName = (name || '').trim()
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 20) {
    return { code: 400, msg: '姓名需 2-20 个字符' }
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { code: 400, msg: '手机号格式不正确' }
  }
  if (!city) {
    return { code: 400, msg: '请选择城市' }
  }
  if (!Array.isArray(interest) || interest.length === 0) {
    return { code: 400, msg: '请至少选择一项感兴趣的内容' }
  }
  const validInterest = ['double_eyelid', 'skin_care']
  if (!interest.every(i => validInterest.includes(i))) {
    return { code: 400, msg: '感兴趣内容参数无效' }
  }
  if (!consent_time) {
    return { code: 400, msg: '请同意授权' }
  }

  // 3. 频率限制
  const clientIP = context.CLIENTIP || ''
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const oneHourAgo = now - 60 * 60 * 1000

  // 3a. 同一 user_id 24 小时内最多 3 次
  const userCount = await leadsCollection
    .where({ user_id: userId, create_time: dbCmd.gte(oneDayAgo) })
    .count()
  if (userCount.result.total >= 3) {
    return { code: 429, msg: '提交过于频繁，请明天再试' }
  }

  // 3b. 同一 phone 全局最多 5 条有效线索
  const phoneCount = await leadsCollection
    .where({ phone, status: dbCmd.neq(3) })
    .count()
  if (phoneCount.result.total >= 5) {
    return { code: 429, msg: '该手机号已达提交上限' }
  }

  // 3c. 同一 IP 1 小时内最多 10 次
  if (clientIP) {
    const ipCount = await leadsCollection
      .where({ submit_ip: clientIP, create_time: dbCmd.gte(oneHourAgo) })
      .count()
    if (ipCount.result.total >= 10) {
      return { code: 429, msg: '操作过于频繁，请稍后再试' }
    }
  }

  // 4. 查询客户信息（冗余存储客户名称）
  let clientName = ''
  if (client_id) {
    const clientRes = await clientsCollection
      .where({ client_id, status: 1 })
      .limit(1)
      .get()
    if (clientRes.result.data.length > 0) {
      clientName = clientRes.result.data[0].client_name
    }
  }

  // 5. 写入 leads 表
  const leadData = {
    user_id: userId,
    user_mobile: '',
    name: trimmedName,
    phone: phone.trim(),
    city,
    interest,
    click_id: click_id || '',
    client_id: client_id || '',
    client_name: clientName,
    status: 0,
    source: 'oceanengine',
    submit_ip: clientIP,
    consent_time,
    consent_version: 'v1.0',
    follow_note: '',
    create_time: now,
    update_time: now
  }

  const addRes = await leadsCollection.add(leadData)

  // 6. 异步触发企微通知（不阻塞主流程）
  uniCloud.callFunction({
    name: 'notify-wechat',
    data: {
      lead_id: addRes.result.id,
      ...leadData
    }
  }).catch(err => {
    console.error('notify-wechat failed:', err)
  })

  // 7. 异步触发巨量引擎回传（不阻塞主流程）
  if (click_id) {
    uniCloud.callFunction({
      name: 'report-conversion',
      data: {
        event_type: 'form_submit',
        click_id,
        client_id: client_id || '',
        user_id: userId
      }
    }).catch(err => {
      console.error('report-conversion failed:', err)
    })
  }

  return { code: 0, msg: '提交成功' }
}
