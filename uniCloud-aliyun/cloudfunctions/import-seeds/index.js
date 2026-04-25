'use strict'

/**
 * 种子数据导入云函数
 *
 * 用途：首次部署时把 mock-data 转化而来的种子数据灌入数据库；
 * 以及后续种子数据有变更时进行幂等更新（按 seed_id 去重）。
 *
 * 触发方式：
 *   在 uniCloud 控制台手动调用，或 HBuilderX 右键云函数"上传并运行"。
 *
 * 安全：
 *   本函数仅在内部运维场景调用，务必配合 SEED_IMPORT_SECRET 环境变量防止外部误触。
 *
 * 入参：
 *   { secret: string, collections?: Array<'articles'|'qa'|'tips'> }
 */

const seedData = require('./seed-data.js')

const db = uniCloud.database()

const COLLECTION_CONFIG = {
  articles: {
    collection: 'articles',
    uniqueField: 'seed_id',
    items: seedData.articles
  },
  qa: {
    collection: 'qa',
    uniqueField: 'seed_id',
    items: seedData.qa
  },
  tips: {
    collection: 'tips',
    uniqueField: 'seed_id',
    items: seedData.tips
  }
}

exports.main = async (event) => {
  const SECRET = process.env.SEED_IMPORT_SECRET
  if (!SECRET) {
    return { code: 500, msg: 'SEED_IMPORT_SECRET not configured' }
  }
  if (!event.secret || event.secret !== SECRET) {
    return { code: 401, msg: 'invalid secret' }
  }

  const targetKeys = Array.isArray(event.collections) && event.collections.length
    ? event.collections
    : Object.keys(COLLECTION_CONFIG)

  const summary = {}

  for (const key of targetKeys) {
    const cfg = COLLECTION_CONFIG[key]
    if (!cfg) continue

    const collection = db.collection(cfg.collection)
    let created = 0
    let updated = 0
    let skipped = 0

    for (const item of cfg.items) {
      const seedId = item[cfg.uniqueField]
      if (!seedId) {
        skipped++
        continue
      }
      const existing = await collection.where({ [cfg.uniqueField]: seedId }).limit(1).get()
      if (existing.result.data.length > 0) {
        const existDoc = existing.result.data[0]
        const updatePayload = { ...item }
        delete updatePayload.create_time
        updatePayload.update_time = Date.now()
        await collection.doc(existDoc._id).update(updatePayload)
        updated++
      } else {
        await collection.add({
          ...item,
          create_time: item.create_time || Date.now(),
          update_time: Date.now()
        })
        created++
      }
    }

    summary[key] = { total: cfg.items.length, created, updated, skipped }
  }

  return {
    code: 0,
    msg: 'ok',
    summary
  }
}
