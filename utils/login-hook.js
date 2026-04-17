/**
 * 登录成功后的回调处理
 * 用于触发巨量引擎"注册"事件回传
 */

export async function onLoginSuccess(e) {
  // 如果是新注册用户，触发转化回传
  if (e && e.isNewUser) {
    const clickId = uni.getStorageSync('click_id')
    const clientId = uni.getStorageSync('client_id')
    if (clickId) {
      try {
        await uniCloud.callFunction({
          name: 'report-conversion',
          data: {
            event_type: 'register',
            click_id: clickId,
            client_id: clientId || ''
          }
        })
        console.log('register conversion reported successfully')
      } catch (err) {
        console.error('report register conversion failed:', err)
      }
    }
  }
}
