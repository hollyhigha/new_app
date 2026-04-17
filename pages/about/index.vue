<template>
  <view class="page-about">
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFill" />
      <text class="app-name">靓人科普</text>
      <text class="app-version">版本 1.0.0</text>
    </view>

    <view class="desc-section">
      <text class="desc-text">
        靓人科普是一款专注于医学美容科普知识的平台，致力于为用户提供专业、客观、科学的医美知识内容，帮助每一位爱美人士做出明智的选择。
      </text>
    </view>

    <view class="info-section">
      <view class="info-item">
        <text class="info-label">服务内容</text>
        <text class="info-value">医美科普知识、项目解读、机构咨询</text>
      </view>
      <view class="info-item">
        <text class="info-label">联系邮箱</text>
        <text class="info-value">contact@liangren.com</text>
      </view>
      <view class="info-item">
        <text class="info-label">客服电话</text>
        <text class="info-value">400-888-0000</text>
      </view>
    </view>

    <view class="links-section">
      <view class="link-item" @click="openWebview('privacy')">
        <text class="link-text">隐私政策</text>
        <text class="link-arrow">›</text>
      </view>
      <view class="link-item" @click="openWebview('agreement')">
        <text class="link-text">用户协议</text>
        <text class="link-arrow">›</text>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">Copyright 2025 靓人科普</text>
      <text class="footer-text">用科学守护你的美丽</text>
    </view>
  </view>
</template>

<script setup>
function openWebview(type) {
  uni.navigateTo({ url: `/pages/webview/index?type=${type}` })
}
</script>

<style scoped>
.page-about {
  background-color: #F5F5F5;
  min-height: 100vh;
}
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  background-color: #fff;
}
.logo {
  width: 140rpx;
  height: 140rpx;
  border-radius: 28rpx;
}
.app-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 20rpx;
}
.app-version {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.desc-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}
.desc-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}
.info-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 10rpx 30rpx;
}
.info-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.info-item:last-child { border-bottom: none; }
.info-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}
.info-value {
  font-size: 28rpx;
  color: #333;
}
.links-section {
  background-color: #fff;
  margin-top: 20rpx;
}
.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.link-item:last-child { border-bottom: none; }
.link-text { font-size: 28rpx; color: #333; }
.link-arrow { font-size: 32rpx; color: #ccc; }
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}
.footer-text {
  font-size: 22rpx;
  color: #ccc;
  margin-bottom: 8rpx;
}
</style>
