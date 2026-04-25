<template>
  <view class="page-mine">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-info-row" @click="goLogin">
        <image class="user-avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-text">
          <text class="user-name">{{ userInfo.nickname || '点击登录' }}</text>
          <text class="user-desc" v-if="userInfo.phone">{{ maskPhone(userInfo.phone) }}</text>
          <text class="user-desc" v-else>登录后享受更多服务</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-row">
      <view class="stat-item" @click="goPage('/pages/favorites/index')">
        <text class="stat-num">{{ stats.favorites }}</text>
        <text class="stat-label">收藏</text>
      </view>
      <view class="stat-item" @click="goPage('/pages/history/index')">
        <text class="stat-num">{{ stats.history }}</text>
        <text class="stat-label">浏览</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.likes }}</text>
        <text class="stat-label">点赞</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <text class="menu-section-title">我的服务</text>
      <view class="menu-item" @click="goPage('/pages/favorites/index')">
        <view class="menu-left">
          <text class="menu-icon-text">&#x2B50;</text>
          <text class="menu-text">我的收藏</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/history/index')">
        <view class="menu-left">
          <text class="menu-icon-text">&#x1F4D6;</text>
          <text class="menu-text">浏览记录</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-section">
      <text class="menu-section-title">更多</text>
      <view class="menu-item" @click="goPage('/pages/feedback/index')">
        <view class="menu-left">
          <text class="menu-icon-text">&#x1F4AC;</text>
          <text class="menu-text">意见反馈</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/settings/index')">
        <view class="menu-left">
          <text class="menu-icon-text">&#x2699;</text>
          <text class="menu-text">设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/about/index')">
        <view class="menu-left">
          <text class="menu-icon-text">&#x2139;</text>
          <text class="menu-text">关于我们</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 悬浮咨询按钮 -->
    <float-consult />
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import floatConsult from '@/components/float-consult/float-consult.vue'

const userInfo = reactive({
  nickname: '',
  phone: '',
  avatar: ''
})

const stats = reactive({
  favorites: 0,
  history: 0,
  likes: 0
})

onShow(() => {
  loadStats()
})

function loadStats() {
  const favorites = uni.getStorageSync('my_favorites') || []
  const history = uni.getStorageSync('browse_history') || []
  const likes = uni.getStorageSync('my_likes') || []
  stats.favorites = favorites.length
  stats.history = history.length
  stats.likes = likes.length
}

function maskPhone(phone) {
  if (!phone || phone.length < 11) return phone
  return phone.substring(0, 3) + '****' + phone.substring(7)
}

function goLogin() {
  if (!userInfo.phone) {
    uni.navigateTo({ url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd' })
  }
}

function goPage(url) {
  uni.navigateTo({ url })
}
</script>

<style scoped>
.page-mine {
  background-color: #F5F5F5;
  min-height: 100vh;
}
.user-header {
  background: linear-gradient(135deg, #E91E63, #FF5252);
  padding: 60rpx 30rpx 40rpx;
}
.user-info-row {
  display: flex;
  align-items: center;
}
.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid rgba(255,255,255,0.5);
  margin-right: 24rpx;
}
.user-text { flex: 1; }
.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}
.user-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 8rpx;
  display: block;
}
.stats-row {
  display: flex;
  background-color: #fff;
  margin: -20rpx 30rpx 0;
  border-radius: 16rpx;
  padding: 30rpx 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
.menu-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 0 30rpx;
  border-radius: 16rpx;
  margin-left: 30rpx;
  margin-right: 30rpx;
}
.menu-section-title {
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 0 10rpx;
  display: block;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.menu-item:last-child { border-bottom: none; }
.menu-left {
  display: flex;
  align-items: center;
}
.menu-icon-text {
  font-size: 36rpx;
  margin-right: 16rpx;
}
.menu-text {
  font-size: 30rpx;
  color: #333;
}
.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
