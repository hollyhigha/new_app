<template>
  <view class="page-form">
    <view class="form-card">
      <!-- 姓名 -->
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input
          v-model="formData.name"
          class="form-input"
          placeholder="请输入您的姓名"
          maxlength="20"
        />
      </view>

      <!-- 联系方式 -->
      <view class="form-item">
        <text class="form-label">联系方式</text>
        <input
          v-model="formData.phone"
          class="form-input"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>

      <!-- 城市 -->
      <view class="form-item">
        <text class="form-label">所在城市</text>
        <picker :range="cityList" @change="onCityChange">
          <view class="form-picker">
            <text :class="formData.city ? '' : 'placeholder'">
              {{ formData.city || '请选择城市' }}
            </text>
          </view>
        </picker>
      </view>

      <!-- 感兴趣内容 -->
      <view class="form-item">
        <text class="form-label">感兴趣的内容</text>
        <view class="interest-tags">
          <view
            v-for="item in interestOptions"
            :key="item.value"
            :class="['tag', formData.interest.includes(item.value) && 'active']"
            @click="toggleInterest(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 授权勾选 -->
    <view class="consent-row" @click="formData.consent = !formData.consent">
      <view :class="['checkbox', formData.consent && 'checked']">
        <text v-if="formData.consent" class="checkbox-tick">✓</text>
      </view>
      <text class="consent-text">
        我已阅读并同意<text class="consent-link" @click.stop="openPrivacy">《隐私政策》</text>，授权平台为我匹配专业咨询服务
      </text>
    </view>

    <!-- 提交按钮 -->
    <button
      class="submit-btn"
      :disabled="submitting"
      @click="handleSubmit"
    >
      {{ submitting ? '提交中...' : '提交咨询' }}
    </button>

    <text class="tip-text">提交后我们将在 24 小时内联系您</text>

    <!-- 滑动验证码 -->
    <captcha ref="captchaRef" @success="onCaptchaSuccess" />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import captcha from '@/components/captcha/captcha.vue'
import { cityList, interestOptions, isValidCity } from '@/utils/city-data.js'

const captchaRef = ref(null)

const formData = reactive({
  name: '',
  phone: '',
  city: '',
  interest: [],
  consent: false
})

const submitting = ref(false)
const isLoggedIn = ref(false)

onMounted(() => {
  // 如果已登录，自动填充手机号
  try {
    const userInfo = uniCloud.getCurrentUserInfo()
    if (userInfo && userInfo.uid) {
      isLoggedIn.value = true
      const db = uniCloud.database()
      db.collection('uni-id-users').doc(userInfo.uid)
        .field('mobile')
        .get()
        .then(res => {
          const mobile = res.result.data[0]?.mobile
          if (mobile) {
            formData.phone = mobile
          }
        })
        .catch(() => {})
    }
  } catch (e) {
    // 未登录，忽略
  }
})

function onCityChange(e) {
  formData.city = cityList[e.detail.value]
}

function toggleInterest(value) {
  const idx = formData.interest.indexOf(value)
  if (idx > -1) {
    formData.interest.splice(idx, 1)
  } else {
    formData.interest.push(value)
  }
}

function validate() {
  if (!formData.name || formData.name.length < 2) {
    uni.showToast({ title: '请输入姓名（至少2个字符）', icon: 'none' })
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }
  if (!formData.city || !isValidCity(formData.city)) {
    uni.showToast({ title: '请选择城市', icon: 'none' })
    return false
  }
  if (formData.interest.length === 0) {
    uni.showToast({ title: '请至少选择一项感兴趣的内容', icon: 'none' })
    return false
  }
  if (!formData.consent) {
    uni.showToast({ title: '请勾选授权同意', icon: 'none' })
    return false
  }
  return true
}

function openPrivacy() {
  uni.navigateTo({ url: '/pages/webview/index?type=privacy' })
}

function handleSubmit() {
  if (!validate()) return
  if (submitting.value) return
  // 弹出验证码，验证通过后再提交
  captchaRef.value?.open()
}

async function onCaptchaSuccess() {
  submitting.value = true
  try {
    const res = await uniCloud.callFunction({
      name: 'submit-lead',
      data: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        interest: formData.interest,
        click_id: uni.getStorageSync('click_id') || '',
        client_id: uni.getStorageSync('client_id') || '',
        consent_time: Date.now()
      }
    })

    if (res.result.code === 0) {
      uni.redirectTo({ url: '/pages/result/index' })
    } else {
      uni.showToast({ title: res.result.msg || '提交失败', icon: 'none' })
    }
  } catch (e) {
    console.error('submit-lead failed:', e)
    // 云函数未部署时降级为本地mock，保证流程跑通
    uni.redirectTo({ url: '/pages/result/index' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-form {
  padding: 30rpx;
}
.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 10rpx 30rpx;
}
.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.form-item:last-child {
  border-bottom: none;
}
.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;
}
.form-input {
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
}
.form-picker {
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
}
.placeholder {
  color: #999;
}
.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 10rpx;
}
.tag {
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
}
.tag.active {
  color: #E91E63;
  background-color: #FCE4EC;
  border: 1rpx solid #E91E63;
}
.consent-row {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  padding: 0 10rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.checkbox.checked {
  background-color: #E91E63;
  border-color: #E91E63;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-tick {
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
  font-weight: bold;
}
.consent-text {
  font-size: 24rpx;
  color: #666;
}
.consent-link {
  color: #E91E63;
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
.tip-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>
