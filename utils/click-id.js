/**
 * click_id 获取工具
 *
 * 归因来源：
 *   1. URL Scheme / 启动参数 (query.click_id / plus.runtime.arguments)
 *   2. Universal Link（通过启动参数一并传入）
 *
 * 合规说明：
 *   - 为遵循个人信息最小化原则及避免 iOS/Android 剪贴板系统提示，
 *     本应用不再从剪贴板读取归因参数。
 *   - 所有归因参数仅在用户同意《隐私政策》后才会读取和上传。
 */

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
 * click_id 有效期 24 小时，超期视为无效（巨量引擎要求）
 */
export function getLocalClickId() {
  const clickTime = uni.getStorageSync('click_time') || 0
  const EXPIRES = 24 * 60 * 60 * 1000
  if (clickTime && Date.now() - clickTime > EXPIRES) {
    uni.removeStorageSync('click_id')
    uni.removeStorageSync('client_id')
    uni.removeStorageSync('click_id_source')
    uni.removeStorageSync('click_time')
    return { clickId: null, clientId: null, source: null, clickTime: null }
  }
  return {
    clickId: uni.getStorageSync('click_id') || null,
    clientId: uni.getStorageSync('client_id') || null,
    source: uni.getStorageSync('click_id_source') || null,
    clickTime: clickTime || null
  }
}

/**
 * 同步 click_id 到云端用户记录（仅在用户登录后调用）
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

/**
 * 回传 App 激活事件到巨量引擎
 * 调用时机：用户同意隐私协议后（首次启动）
 */
export async function reportAppInstall({ clickId, clientId }) {
  if (!clickId) return
  const reported = uni.getStorageSync('app_install_reported')
  if (reported) return
  try {
    // #ifdef APP-PLUS
    const systemInfo = uni.getSystemInfoSync()
    const appType = systemInfo.osName === 'ios' ? 0 : 1
    // #endif
    await uniCloud.callFunction({
      name: 'report-conversion',
      data: {
        event_type: 'app_install',
        click_id: clickId,
        client_id: clientId || '',
        // #ifdef APP-PLUS
        app_type: appType
        // #endif
      }
    })
    uni.setStorageSync('app_install_reported', '1')
  } catch (e) {
    console.error('reportAppInstall failed:', e)
  }
}

/**
 * 回传表单提交事件到巨量引擎（前端兜底，服务端已自动触发）
 */
export async function reportFormSubmit({ clickId, clientId }) {
  if (!clickId) return
  try {
    await uniCloud.callFunction({
      name: 'report-conversion',
      data: {
        event_type: 'form_submit',
        click_id: clickId,
        client_id: clientId || ''
      }
    })
  } catch (e) {
    console.error('reportFormSubmit failed:', e)
  }
}
