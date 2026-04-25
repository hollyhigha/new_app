/**
 * 内容数据访问层
 *
 * 调用策略：
 *   1. 优先通过 uniCloud.callFunction 调用 get-content 云函数读取数据库
 *   2. 若云函数不存在、网络异常、空数据，则回落到 utils/mock-data.js 作为兜底
 *      （兜底仅用于开发期 / 云函数未部署期 / 极端网络故障，首版上架请确保数据库有数据）
 *
 * 所有返回数据都已对齐统一的字段名，业务层无需关心数据来源。
 */

import {
  articleList as localArticles,
  qaList as localQa,
  tipsList as localTips,
  getArticleById as localGetArticleById,
  getRelatedArticles as localRelatedArticles,
  searchArticles as localSearchArticles
} from '@/utils/mock-data.js'

const CLOUD_TIMEOUT_MS = 6000

async function callGetContent(data) {
  try {
    const p = uniCloud.callFunction({ name: 'get-content', data })
    const res = await Promise.race([
      p,
      new Promise((_, reject) => setTimeout(() => reject(new Error('cloud-timeout')), CLOUD_TIMEOUT_MS))
    ])
    if (res && res.result && res.result.code === 0) {
      return res.result.data
    }
    return null
  } catch (e) {
    console.warn('[content-api] cloud failed, fallback to local:', e.message)
    return null
  }
}

export async function listArticles({ category = 'all', keyword = '', page = 1, pageSize = 20 } = {}) {
  const cloud = await callGetContent({ action: 'list-articles', category, keyword, page, pageSize })
  if (cloud) return cloud

  let items = localArticles.slice()
  if (category && category !== 'all') items = items.filter((a) => a.category === category)
  if (keyword) items = items.filter((a) => (a.title || '').includes(keyword))
  const total = items.length
  items = items.slice((page - 1) * pageSize, page * pageSize)
  return { items, total, page, pageSize }
}

export async function getArticle({ id, seedId } = {}) {
  const cloud = await callGetContent({ action: 'get-article', id, seed_id: seedId })
  if (cloud && cloud.item) return cloud.item
  const target = seedId || id
  return localGetArticleById(target) || null
}

export async function getRelatedArticles({ category, excludeId, limit = 5 } = {}) {
  const cloud = await callGetContent({
    action: 'related-articles',
    category,
    exclude_id: excludeId,
    limit
  })
  if (cloud && cloud.items) return cloud.items
  return localRelatedArticles(excludeId, category).slice(0, limit)
}

export async function getHotArticles({ limit = 6 } = {}) {
  const cloud = await callGetContent({ action: 'hot-articles', limit })
  if (cloud && cloud.items && cloud.items.length) return cloud.items
  // 本地兜底：按 create_time 倒序
  return localArticles.slice().sort((a, b) => (b.create_time || 0) - (a.create_time || 0)).slice(0, limit)
}

export async function listQa({ page = 1, pageSize = 20 } = {}) {
  const cloud = await callGetContent({ action: 'list-qa', page, pageSize })
  if (cloud) return cloud
  return { items: localQa.slice((page - 1) * pageSize, page * pageSize), page, pageSize }
}

export async function listTips({ page = 1, pageSize = 20 } = {}) {
  const cloud = await callGetContent({ action: 'list-tips', page, pageSize })
  if (cloud) return cloud
  return { items: localTips.slice((page - 1) * pageSize, page * pageSize), page, pageSize }
}

export async function searchArticles(keyword) {
  const cloud = await callGetContent({
    action: 'list-articles',
    keyword,
    page: 1,
    pageSize: 50
  })
  if (cloud) return cloud.items
  return localSearchArticles(keyword)
}
