<template>
  <view class="page-feedback">
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">反馈类型</text>
        <view class="type-tags">
          <text
            v-for="t in types"
            :key="t.value"
            :class="['type-tag', feedbackType === t.value && 'active']"
            @click="feedbackType = t.value"
          >{{ t.label }}</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">详细描述</text>
        <textarea
          v-model="content"
          class="form-textarea"
          placeholder="请详细描述您的问题或建议（至少10个字）"
          maxlength="500"
        />
        <text class="char-count">{{ content.length }}/500</text>
      </view>

      <view class="form-item">
        <text class="form-label">联系方式（选填）</text>
        <input v-model="contact" class="form-input" placeholder="手机号或邮箱，方便我们回复您" />
      </view>
    </view>

    <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
      {{ submitting ? '提交中...' : '提交反馈' }}
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const types = [
  { label: '功能建议', value: 'suggest' },
  { label: '内容纠错', value: 'error' },
  { label: '使用问题', value: 'problem' },
  { label: '其他', value: 'other' }
]

const feedbackType = ref('suggest')
const content = ref('')
const contact = ref('')
const submitting = ref(false)

function getPlatform() {
  try {
    const info = uni.getSystemInfoSync()
    const name = (info.osName || info.platform || '').toLowerCase()
    if (name.includes('ios')) return 'ios'
    if (name.includes('android')) return 'android'
    // #ifdef MP-WEIXIN
    return 'mp-weixin'
    // #endif
    // #ifdef H5
    return 'h5'
    // #endif
    return 'other'
  } catch (e) {
    return 'other'
  }
}

async function handleSubmit() {
  if (submitting.value) return
  if (content.value.trim().length < 10) {
    uni.showToast({ title: '请至少输入10个字', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const info = uni.getSystemInfoSync()
    const res = await uniCloud.callFunction({
      name: 'submit-feedback',
      data: {
        type: feedbackType.value,
        content: content.value.trim(),
        contact: contact.value.trim(),
        platform: getPlatform(),
        app_version: info.appVersion || ''
      }
    })
    if (res.result && res.result.code === 0) {
      uni.showModal({
        title: '感谢反馈',
        content: '您的反馈已收到，我们会认真处理！',
        showCancel: false,
        success() {
          content.value = ''
          contact.value = ''
          uni.navigateBack()
        }
      })
    } else {
      uni.showToast({
        title: (res.result && res.result.msg) || '提交失败，请稍后重试',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error('submit-feedback failed:', e)
    uni.showToast({ title: '网络异常，提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-feedback {
  background-color: #F5F5F5;
  min-height: 100vh;
  padding: 20rpx 30rpx;
}
.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
}
.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.form-item:last-child { border-bottom: none; }
.form-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}
.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.type-tag {
  padding: 14rpx 28rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
}
.type-tag.active {
  color: #E91E63;
  background-color: #FCE4EC;
}
.form-textarea {
  width: 100%;
  height: 240rpx;
  font-size: 28rpx;
  color: #333;
  padding: 16rpx;
  background-color: #F9F9F9;
  border-radius: 12rpx;
  box-sizing: border-box;
}
.char-count {
  font-size: 22rpx;
  color: #ccc;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}
.form-input {
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #F9F9F9;
  border-radius: 12rpx;
  padding: 0 16rpx;
}
.submit-btn {
  margin-top: 40rpx;
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
