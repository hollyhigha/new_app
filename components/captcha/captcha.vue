<template>
  <uni-popup ref="popupRef" type="center" :is-mask-click="false">
    <view class="captcha-container">
      <view class="captcha-header">
        <text class="captcha-title">安全验证</text>
        <text class="captcha-close" @click="close">✕</text>
      </view>
      <view class="captcha-body">
        <view class="slider-track" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <view class="slider-bg" :style="{ width: sliderLeft + 'rpx' }" />
          <view class="slider-thumb" :style="{ left: sliderLeft + 'rpx' }">
            <text class="thumb-icon">→</text>
          </view>
          <text v-if="sliderLeft === 0" class="slider-hint">滑动验证</text>
        </view>
        <text v-if="verified" class="verify-success">验证通过</text>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['success', 'fail'])
const popupRef = ref(null)
const sliderLeft = ref(0)
const verified = ref(false)
const startX = ref(0)
const trackWidth = 480

function open() {
  verified.value = false
  sliderLeft.value = 0
  popupRef.value?.open()
}

function close() {
  popupRef.value?.close()
}

function onTouchStart(e) {
  if (verified.value) return
  startX.value = e.touches[0].clientX
}

function onTouchMove(e) {
  if (verified.value) return
  const diff = (e.touches[0].clientX - startX.value) * 2
  sliderLeft.value = Math.max(0, Math.min(trackWidth - 80, diff))
}

function onTouchEnd() {
  if (verified.value) return
  if (sliderLeft.value >= trackWidth - 120) {
    verified.value = true
    sliderLeft.value = trackWidth - 80
    setTimeout(() => {
      close()
      emit('success')
    }, 500)
  } else {
    sliderLeft.value = 0
    emit('fail')
  }
}

defineExpose({ open, close })
</script>

<style scoped>
.captcha-container {
  width: 580rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.captcha-title {
  font-size: 30rpx;
  font-weight: bold;
}
.captcha-close {
  font-size: 32rpx;
  color: #999;
}
.captcha-body {
  padding: 40rpx 30rpx;
}
.slider-track {
  position: relative;
  height: 80rpx;
  background-color: #f0f0f0;
  border-radius: 40rpx;
  overflow: hidden;
}
.slider-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #E8F5E9;
  border-radius: 40rpx;
}
.slider-thumb {
  position: absolute;
  top: 0;
  width: 80rpx;
  height: 80rpx;
  background-color: #fff;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-icon {
  font-size: 32rpx;
  color: #E91E63;
}
.slider-hint {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 80rpx;
  font-size: 26rpx;
  color: #999;
}
.verify-success {
  text-align: center;
  color: #4CAF50;
  font-size: 26rpx;
  margin-top: 16rpx;
}
</style>
