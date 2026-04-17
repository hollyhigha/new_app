<template>
  <view class="page-guide">
    <swiper class="guide-swiper" :current="current" @change="onSwiperChange">
      <!-- 第1屏 -->
      <swiper-item>
        <view class="guide-slide">
          <view class="guide-icon-wrap">
            <text class="guide-icon">&#x1F4DA;</text>
          </view>
          <text class="guide-title">专业医美科普</text>
          <text class="guide-desc">汇聚权威医美知识，涵盖双眼皮、皮肤管理、鼻部整形等7大品类，帮你全面了解医美项目</text>
        </view>
      </swiper-item>

      <!-- 第2屏 -->
      <swiper-item>
        <view class="guide-slide">
          <view class="guide-icon-wrap">
            <text class="guide-icon">&#x1F468;&#x200D;&#x2695;&#xFE0F;</text>
          </view>
          <text class="guide-title">专家在线解答</text>
          <text class="guide-desc">有任何疑问，都可以免费咨询，专业医师团队为你提供一对一个性化建议</text>
        </view>
      </swiper-item>

      <!-- 第3屏 -->
      <swiper-item>
        <view class="guide-slide">
          <view class="guide-icon-wrap">
            <text class="guide-icon">&#x1F512;</text>
          </view>
          <text class="guide-title">隐私安全保障</text>
          <text class="guide-desc">你的个人信息受到严格保护，未经授权不会分享给任何第三方，安心使用每一项服务</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 指示器 -->
    <view class="indicator-row">
      <view v-for="i in 3" :key="i" :class="['dot', current === i - 1 && 'active']" />
    </view>

    <!-- 按钮 -->
    <view class="btn-area">
      <button v-if="current < 2" class="guide-btn skip" @click="enter">跳过</button>
      <button v-if="current < 2" class="guide-btn next" @click="current++">下一步</button>
      <button v-if="current === 2" class="guide-btn start" @click="enter">开始使用</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const current = ref(0)

function onSwiperChange(e) {
  current.value = e.detail.current
}

function enter() {
  uni.setStorageSync('guide_shown', true)
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page-guide {
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.guide-swiper {
  flex: 1;
  height: 70vh;
}
.guide-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  height: 100%;
}
.guide-icon-wrap {
  width: 200rpx;
  height: 200rpx;
  background-color: #FCE4EC;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}
.guide-icon {
  font-size: 100rpx;
}
.guide-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}
.guide-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.8;
  padding: 0 20rpx;
}

/* Indicator */
.indicator-row {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  padding: 20rpx 0;
}
.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background-color: #ddd;
}
.dot.active {
  width: 40rpx;
  background-color: #E91E63;
}

/* Buttons */
.btn-area {
  display: flex;
  gap: 20rpx;
  padding: 30rpx 60rpx 80rpx;
}
.guide-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
}
.guide-btn.skip {
  background-color: #F5F5F5;
  color: #999;
}
.guide-btn.next {
  background-color: #E91E63;
  color: #fff;
}
.guide-btn.start {
  background-color: #E91E63;
  color: #fff;
}
</style>
