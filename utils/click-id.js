/**
 * click_id 多渠道获取工具
 * 优先级：URL Scheme/Intent 参数 > Universal Link > 剪切板
 */

const CLIPBOARD_PATTERN = /^##LIANGREN_(.+?)_(.+?)##$/

/**
 * 从启动参数中解析 click_id 和 client_id
 * @param {Object} launchOptions - uni-app 启动参数
 * @returns {{ clickId: string|null, clientId: string|null, source: string|null }}
 */
export function parseFromLaunchOptions(launchOptions) {
  const query = launchOptions?.query || {}

  if (query.click_id && query.client_id) {
    return {
      clickId: query.click_id,
      clientId: query.client_id,
      source: 'url_scheme'
    }
  }

  // #ifdef APP-PLUS
  const args = plus.runtime.arguments
  if (args) {
    try {
      const url = new URL(args)
      const clickId = url.searchParams.get('click_id')
      const clientId = url.searchParams.get('client_id')
      if (clickId && clientId) {
        return { clickId, clientId, source: 'url_scheme' }
      }
    } catch (e) {
      // args 不是有效 URL，尝试直接解析
      const match = args.match(/click_id=([^&]+)/)
      const clientMatch = args.match(/client_id=([^&]+)/)
      if (match && clientMatch) {
        return {
          clickId: match[1],
          clientId: clientMatch[1],
          source: 'url_scheme'
        }
      }
    }
  }
  // #endif

  return { clickId: null, clientId: null, source: null }
}

/**
 * 从剪切板获取 click_id（兜底方案）
 * 格式：##LIANGREN_clickId_clientId##
 * @returns {Promise<{ clickId: string|null, clientId: string|null, source: string|null }>}
 */
export function parseFromClipboard() {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    uni.getClipboardData({
      success(res) {
        const content = (res.data || '').trim()
        const match = content.match(CLIPBOARD_PATTERN)
        if (match) {
          // 读取后立即清除剪切板
          uni.setClipboardData({ data: '', showToast: false })
          resolve({
            clickId: match[1],
            clientId: match[2],
            source: 'clipboard'
          })
        } else {
          resolve({ clickId: null, clientId: null, source: null })
        }
      },
      fail() {
        resolve({ clickId: null, clientId: null, source: null })
      }
    })
    // #endif

    // #ifndef APP-PLUS
    resolve({ clickId: null, clientId: null, source: null })
    // #endif
  })
}

/**
 * 保存 click_id 到本地缓存
 */
export function saveClickId({ clickId, clientId, source }) {
  if (!clickId) return
  uni.setStorageSync('click_id', clickId)
  uni.setStorageSync('client_id', clientId)
  uni.setStorageSync('click_id_source', source)
  uni.setStorageSync('click_time', Date.now())
}

/**
 * 获取本地缓存的 click_id
 */
export function getLocalClickId() {
  return {
    clickId: uni.getStorageSync('click_id') || null,
    clientId: uni.getStorageSync('client_id') || null,
    source: uni.getStorageSync('click_id_source') || null,
    clickTime: uni.getStorageSync('click_time') || null
  }
}

/**
 * 同步 click_id 到云端用户记录
 */
export async function syncClickIdToCloud({ clickId, clientId, source }) {
  if (!clickId) return
  try {
    const db = uniCloud.database()
    const uid = uniCloud.getCurrentUserInfo().uid
    if (!uid) return
    await db.collection('uni-id-users').doc(uid).update({
      click_id: clickId,
      client_id: clientId,
      click_id_source: source,
      last_click_time: Date.now()
    })
  } catch (e) {
    console.error('syncClickIdToCloud failed:', e)
  }
}
