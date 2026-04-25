/**
 * 登录成功后的回调处理
 *
 * 注意：只有真正的"新注册"用户才应回传"注册"事件给巨量引擎，
 * 重复回传会被广告平台风控为作弊。
 *
 * uni-id-pages 登录成功事件会传递参数；若无法判断，退而通过本地
 * 持久化 flag 判断是否曾经回传过。
 */

export async function onLoginSuccess(e = {}) {
  // 仅首次新注册用户触发
  const isNewUser = !!e.isNewUser
  if (!isNewUser) return

  const reported = uni.getStorageSync('register_conversion_reported')
  if (reported) return

  const clickId = uni.getStorageSync('click_id')
  const clientId = uni.getStorageSync('client_id')
  if (!clickId) return

  try {
    // #ifdef APP-PLUS
    const info = uni.getSystemInfoSync()
    const appType = (info.osName || info.platform || '').toLowerCase() === 'ios' ? 0 : 1
    // #endif
    await uniCloud.callFunction({
      name: 'report-conversion',
      data: {
        event_type: 'register',
        click_id: clickId,
        client_id: clientId || '',
        // #ifdef APP-PLUS
        app_type: appType
        // #endif
      }
    })
    uni.setStorageSync('register_conversion_reported', '1')
    console.log('register conversion reported successfully')
  } catch (err) {
    console.error('report register conversion failed:', err)
  }
}
