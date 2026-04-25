<template>
  <uni-popup ref="popupRef" type="center" :is-mask-click="false">
    <view class="privacy-popup">
      <view class="privacy-title">隐私保护提示</view>
      <view class="privacy-content">
        <text>
          欢迎使用靓人科普！我们非常重视您的隐私保护。在使用我们的服务前，请您仔细阅读
        </text>
        <text class="privacy-link" @click="openPrivacy">《隐私政策》</text>
        <text>和</text>
        <text class="privacy-link" @click="openAgreement">《用户协议》</text>
        <text>
          。如您同意，请点击"同意并继续"开始使用我们的服务。
        </text>
      </view>
      <view class="privacy-buttons">
        <button class="btn-disagree" @click="handleDisagree">不同意</button>
        <button class="btn-agree" @click="handleAgree">同意并继续</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['agree', 'disagree'])
const popupRef = ref(null)

function open() {
  popupRef.value?.open()
}

function close() {
  popupRef.value?.close()
}

function handleAgree() {
  uni.setStorageSync('privacy_agreed', true)
  uni.setStorageSync('privacy_agreed_time', Date.now())
  close()
  emit('agree')
}

function handleDisagree() {
  emit('disagree')
}

function openPrivacy() {
  close()
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/webview/index?type=privacy',
      events: {
        returnToPrivacyPopup: () => open()
      },
      success(res) {
        res.eventChannel.emit('fromPrivacyPopup', { fromPopup: true })
      }
    })
  }, 150)
}

function openAgreement() {
  close()
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/webview/index?type=agreement',
      events: {
        returnToPrivacyPopup: () => open()
      },
      success(res) {
        res.eventChannel.emit('fromPrivacyPopup', { fromPopup: true })
      }
    })
  }, 150)
}

defineExpose({ open, close })
</script>

<style scoped>
.privacy-popup {
  width: 580rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}
.privacy-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  color: #333;
}
.privacy-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 40rpx;
}
.privacy-link {
  color: #E91E63;
}
.privacy-buttons {
  display: flex;
  gap: 20rpx;
}
/* 合规：两个按钮视觉权重需相近，不得弱化"不同意"按钮 */
.btn-disagree {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
  background-color: #fff;
  color: #333;
  border: 2rpx solid #ddd;
}
.btn-agree {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
  background-color: #E91E63;
  color: #fff;
}
</style>
