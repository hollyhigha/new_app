'use strict'

/**
 * 通用内容读取云函数（合并 get-articles / get-qa / get-tips）
 *
 * 入参：
 *   action:
 *     'list-articles'    列出文章（支持 category / keyword / page / pageSize）
 *     'get-article'      获取文章详情（id 或 seed_id）
 *     'related-articles' 获取相关文章（按分类）
 *     'list-qa'          列出问答
 *     'list-tips'        列出美丽贴士
 *     'hot-articles'     热门文章（取 sort_order desc）
 *
 * 返回：
 *   { code: 0, data: { items | item, total, page, pageSize } }
 */

const db = uniCloud.database()
const dbCmd = db.command
const $ = db.command.aggregate

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

exports.main = async (event) => {
  const { action } = event
  try {
    switch (action) {
      case 'list-articles':
        return await listArticles(event)
      case 'get-article':
        return await getArticle(event)
      case 'related-articles':
        return await relatedArticles(event)
      case 'list-qa':
        return await listQa(event)
      case 'list-tips':
        return await listTips(event)
      case 'hot-articles':
        return await hotArticles(event)
      default:
        return { code: 400, msg: `unknown action: ${action}` }
    }
  } catch (e) {
    console.error('get-content error:', e)
    return { code: 500, msg: e.message || 'internal error' }
  }
}

function normalizePage(event) {
  const page = Math.max(1, parseInt(event.page || 1))
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(event.pageSize || DEFAULT_PAGE_SIZE)))
  return { page, pageSize }
}

async function listArticles(event) {
  const { page, pageSize } = normalizePage(event)
  const { category = 'all', keyword = '' } = event

  const where = { status: 1 }
  if (category && category !== 'all') {
    where.category = category
  }
  if (keyword) {
    const kw = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    where.title = kw
  }

  const coll = db.collection('articles')
  const [listRes, countRes] = await Promise.all([
    coll
      .where(where)
      .field({
        title: true,
        summary: true,
        cover_image: true,
        category: true,
        author: true,
        read_count: true,
        like_count: true,
        create_time: true,
        seed_id: true
      })
      .orderBy('sort_order', 'desc')
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get(),
    coll.where(where).count()
  ])

  return {
    code: 0,
    data: {
      items: listRes.data,
      total: countRes.total,
      page,
      pageSize
    }
  }
}

async function getArticle(event) {
  const { id, seed_id } = event
  const coll = db.collection('articles')
  let res
  if (id) {
    res = await coll.doc(id).get()
  } else if (seed_id) {
    res = await coll.where({ seed_id, status: 1 }).limit(1).get()
  } else {
    return { code: 400, msg: 'missing id or seed_id' }
  }
  const item = Array.isArray(res.data) ? res.data[0] : res.data
  if (!item || item.status !== 1) {
    return { code: 404, msg: 'not found' }
  }
  // 阅读数 +1（best-effort，失败忽略）
  coll.doc(item._id).update({ read_count: dbCmd.inc(1) }).catch(() => {})
  return { code: 0, data: { item } }
}

async function relatedArticles(event) {
  const { category, exclude_id, limit = 5 } = event
  if (!category) return { code: 400, msg: 'missing category' }
  const where = { status: 1, category }
  if (exclude_id) where._id = dbCmd.neq(exclude_id)
  const res = await db.collection('articles')
    .where(where)
    .field({
      title: true, summary: true, cover_image: true, seed_id: true,
      read_count: true, like_count: true, author: true, category: true, create_time: true
    })
    .orderBy('sort_order', 'desc')
    .orderBy('create_time', 'desc')
    .limit(Math.min(20, parseInt(limit) || 5))
    .get()
  return { code: 0, data: { items: res.data } }
}

async function hotArticles(event) {
  const { limit = 6 } = event
  const res = await db.collection('articles')
    .where({ status: 1 })
    .field({
      title: true, summary: true, cover_image: true, seed_id: true,
      read_count: true, like_count: true, author: true, category: true, create_time: true
    })
    .orderBy('read_count', 'desc')
    .orderBy('sort_order', 'desc')
    .limit(Math.min(20, parseInt(limit) || 6))
    .get()
  return { code: 0, data: { items: res.data } }
}

async function listQa(event) {
  const { page, pageSize } = normalizePage(event)
  const res = await db.collection('qa')
    .where({ status: 1 })
    .orderBy('sort_order', 'asc')
    .orderBy('create_time', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  return { code: 0, data: { items: res.data, page, pageSize } }
}

async function listTips(event) {
  const { page, pageSize } = normalizePage(event)
  const res = await db.collection('tips')
    .where({ status: 1 })
    .orderBy('sort_order', 'asc')
    .orderBy('create_time', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  return { code: 0, data: { items: res.data, page, pageSize } }
}
