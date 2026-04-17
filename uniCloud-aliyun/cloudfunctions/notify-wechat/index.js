'use strict'

const db = uniCloud.database()
const clientsCollection = db.collection('clients')

const INTERNAL_WEBHOOK = process.env.INTERNAL_WEBHOOK_URL || ''

exports.main = async (event) => {
  const {
    lead_id, name, phone, city, interest, client_id, client_name, create_time
  } = event

  const interestMap = {
    double_eyelid: '双眼皮',
    skin_care: '皮肤管理',
    nose: '鼻部整形',
    face: '面部轮廓',
    dental: '口腔美容',
    body: '形体塑造',
    anti_aging: '抗衰老'
  }
  const interestText = (interest || []).map(i => interestMap[i] || i).join('、')
  const timeStr = formatTime(create_time || Date.now())
  const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''

  if (client_id) {
    const clientRes = await clientsCollection
      .where({ client_id, status: 1 })
      .limit(1)
      .get()

    if (clientRes.result.data.length > 0) {
      const client = clientRes.result.data[0]
      if (client.webhook_url) {
        const clientMsg = {
          msgtype: 'markdown',
          markdown: {
            content: [
              `**新线索 — ${client_name || client.client_name}**`,
              `> 姓名：${name}`,
              `> 电话：${maskedPhone}`,
              `> 城市：${city}`,
              `> 感兴趣：${interestText}`,
              `> 时间：${timeStr}`
            ].join('\n')
          }
        }
        await sendWebhook(client.webhook_url, clientMsg)
      }
    }
  }

  if (INTERNAL_WEBHOOK) {
    const internalMsg = {
      msgtype: 'markdown',
      markdown: {
        content: [
          `**新线索 — ${client_name || '未知客户'}**`,
          `> 线索ID：${lead_id}`,
          `> 姓名：${name}`,
          `> 电话：${phone}`,
          `> 城市：${city}`,
          `> 感兴趣：${interestText}`,
          `> 客户：${client_name || client_id || '未归属'}`,
          `> 时间：${timeStr}`
        ].join('\n')
      }
    }
    await sendWebhook(INTERNAL_WEBHOOK, internalMsg)
  }

  return { code: 0, msg: 'ok' }
}

async function sendWebhook(url, data) {
  try {
    const res = await uniCloud.httpclient.request(url, {
      method: 'POST',
      data,
      contentType: 'json',
      dataType: 'json',
      timeout: 5000
    })
    if (res.data?.errcode !== 0) {
      console.error('webhook failed:', res.data)
      await new Promise(r => setTimeout(r, 5000))
      await uniCloud.httpclient.request(url, {
        method: 'POST',
        data,
        contentType: 'json',
        dataType: 'json',
        timeout: 5000
      })
    }
  } catch (e) {
    console.error('sendWebhook error:', e)
  }
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
