<script setup>
import { ref } from 'vue'
import { onLaunch, onShow } from '@dcloudio/uni-app'
import {
  parseFromLaunchOptions,
  parseFromClipboard,
  saveClickId,
  syncClickIdToCloud
} from './utils/click-id.js'

const privacyPopupRef = ref(null)

onLaunch(async (options) => {
  console.log('App Launch', options)

  // 1. 检查隐私政策是否已同意
  const privacyAgreed = uni.getStorageSync('privacy_agreed')
  if (!privacyAgreed) {
    // 等待页面加载后显示弹窗（在首页中触发）
    uni.setStorageSync('need_privacy_popup', true)
    return
  }

  // 2. 获取 click_id（隐私同意后才执行）
  await handleClickId(options)

  // 3. 检查 App 更新
  checkAppUpdate()
})

onShow((options) => {
  console.log('App Show', options)
})

async function handleClickId(options) {
  // 优先从启动参数获取
  let result = parseFromLaunchOptions(options)

  // 兜底：从剪切板获取
  if (!result.clickId) {
    result = await parseFromClipboard()
  }

  // 保存到本地
  if (result.clickId) {
    saveClickId(result)
    // 异步同步到云端（不阻塞主流程）
    syncClickIdToCloud(result)
  }
}

function checkAppUpdate() {
  // #ifdef APP-PLUS
  const systemInfo = uni.getSystemInfoSync()
  uniCloud.callFunction({
    name: 'check-update',
    data: {
      platform: systemInfo.osName,
      version_code: parseInt(systemInfo.appVersionCode || '0')
    }
  }).then(res => {
    const data = res.result
    if (!data || !data.needUpdate) return

    if (data.updateType === 'force') {
      uni.showModal({
        title: '版本更新',
        content: data.releaseNote || '发现新版本，请立即更新',
        showCancel: false,
        confirmText: '立即更新',
        success() {
          downloadAndInstall(data.downloadUrl)
        }
      })
    } else {
      uni.showModal({
        title: '版本更新',
        content: data.releaseNote || '发现新版本，是否更新？',
        confirmText: '更新',
        cancelText: '跳过',
        success(modalRes) {
          if (modalRes.confirm) {
            downloadAndInstall(data.downloadUrl)
          }
        }
      })
    }
  }).catch(err => {
    console.error('check-update failed:', err)
  })
  // #endif
}

function downloadAndInstall(url) {
  // #ifdef APP-PLUS
  uni.showLoading({ title: '下载中...' })
  uni.downloadFile({
    url,
    success(res) {
      uni.hideLoading()
      if (res.statusCode === 200) {
        plus.runtime.install(res.tempFilePath, { force: true }, () => {
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
  // #endif
}
</script>

<style>
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: #333333;
}
</style>
