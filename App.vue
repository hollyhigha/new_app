<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import {
  parseFromLaunchOptions,
  saveClickId,
  syncClickIdToCloud,
  reportAppInstall
} from './utils/click-id.js'
import { onLoginSuccess } from './utils/login-hook.js'

// iOS App Store 链接（提交 App Store 后填入真实 appid）
// 示例：itms-apps://itunes.apple.com/cn/app/id1234567890
const APP_STORE_URL = ''

onLaunch(async (options) => {
  console.log('App Launch', options)

  uni.$on('uni-id-pages-login-success', (e) => {
    onLoginSuccess(e || {})
  })

  const privacyAgreed = uni.getStorageSync('privacy_agreed')
  if (!privacyAgreed) {
    return
  }

  await handleClickId(options)

  checkAppUpdate()
})

onShow((options) => {
  console.log('App Show', options)
})

async function handleClickId(options) {
  const result = parseFromLaunchOptions(options)
  if (result.clickId) {
    saveClickId(result)
    syncClickIdToCloud(result)
    reportAppInstall({ clickId: result.clickId, clientId: result.clientId })
  }
}

function checkAppUpdate() {
  // #ifdef APP-PLUS
  const systemInfo = uni.getSystemInfoSync()
  const platform = systemInfo.osName
  uniCloud.callFunction({
    name: 'check-update',
    data: {
      platform,
      version_code: parseInt(systemInfo.appVersionCode || '0')
    }
  }).then(res => {
    const data = res.result
    if (!data || !data.needUpdate) return

    const isIOS = platform === 'ios'
    const isForce = data.updateType === 'force'
    const content = data.releaseNote || (isForce ? '发现新版本，请更新后使用' : '发现新版本，是否更新？')

    uni.showModal({
      title: '版本更新',
      content,
      showCancel: !isForce,
      confirmText: '前往更新',
      cancelText: isForce ? '' : '稍后',
      success(modalRes) {
        if (!modalRes.confirm) return
        if (isIOS) {
          // iOS 引导跳转 App Store，禁止下载 ipa 自升级（违反 Apple 3.3.2 / 4.7）
          if (APP_STORE_URL) {
            plus.runtime.openURL(APP_STORE_URL)
          } else {
            uni.showToast({ title: '请前往 App Store 搜索"靓人科普"更新', icon: 'none' })
          }
        } else {
          // Android：优先跳应用市场，其次走下载流程
          openAndroidMarketOrDownload(data.downloadUrl)
        }
      }
    })
  }).catch(err => {
    console.error('check-update failed:', err)
  })
  // #endif
}

// #ifdef APP-PLUS
function openAndroidMarketOrDownload(downloadUrl) {
  try {
    const pkg = plus.runtime.appid
    plus.runtime.openURL('market://details?id=' + pkg, (err) => {
      if (err && downloadUrl) {
        downloadAndInstall(downloadUrl)
      }
    })
  } catch (e) {
    if (downloadUrl) downloadAndInstall(downloadUrl)
  }
}

function downloadAndInstall(url) {
  uni.showLoading({ title: '下载中...' })
  uni.downloadFile({
    url,
    success(res) {
      uni.hideLoading()
      if (res.statusCode === 200) {
        plus.runtime.install(res.tempFilePath, { force: false }, () => {
          plus.runtime.restart()
        }, (err) => {
          uni.showToast({ title: '安装失败', icon: 'none' })
          console.error('install failed:', err)
        })
      }
    },
    fail() {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
}
// #endif
</script>

<style>
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: #333333;
}
</style>
