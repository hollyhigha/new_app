<template>
  <view class="page-settings">
    <view class="menu-group">
      <view class="menu-item">
        <text class="menu-text">清除缓存</text>
        <text class="menu-value">{{ cacheSize }}</text>
      </view>
      <view class="menu-item" @click="clearCache">
        <text class="menu-text action">立即清除</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="openWebview('privacy')">
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="openWebview('agreement')">
        <text class="menu-text">用户协议</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="handleLogout">
        <text class="menu-text logout">退出登录</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="handleDeleteAccount">
        <text class="menu-text danger">注销账号</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const cacheSize = ref('0 KB')

function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '将清除浏览记录和本地缓存数据',
    success(res) {
      if (res.confirm) {
        uni.removeStorageSync('browse_history')
        cacheSize.value = '0 KB'
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    }
  })
}

function openWebview(type) {
  uni.navigateTo({ url: `/pages/webview/index?type=${type}` })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        uni.removeStorageSync('uni_id_token')
        uni.removeStorageSync('uni_id_token_expired')
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  })
}

function handleDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被删除且无法恢复，确定要注销吗？',
    confirmColor: '#E91E63',
    success(res) {
      if (res.confirm) {
        uni.showToast({ title: '请联系客服注销', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
.page-settings {
  background-color: #F5F5F5;
  min-height: 100vh;
  padding-top: 20rpx;
}
.menu-group {
  background-color: #fff;
  margin-bottom: 20rpx;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.menu-item:last-child { border-bottom: none; }
.menu-text { font-size: 30rpx; color: #333; }
.menu-text.action { color: #E91E63; }
.menu-text.logout { color: #333; text-align: center; width: 100%; }
.menu-text.danger { color: #E91E63; text-align: center; width: 100%; }
.menu-value { font-size: 26rpx; color: #999; }
.menu-arrow { font-size: 32rpx; color: #ccc; }
</style>
