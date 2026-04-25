<template>
  <view class="float-consult" @click="goForm">
    <text class="float-icon">&#x1F4AC;</text>
    <text class="float-text">在线留言</text>
  </view>
</template>

<script setup>
function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}
</script>

<style scoped>
.float-consult {
  position: fixed;
  bottom: 140rpx;
  right: 30rpx;
  display: flex;
  align-items: center;
  background-color: #E91E63;
  border-radius: 60rpx;
  padding: 18rpx 36rpx;
  box-shadow: 0 6rpx 20rpx rgba(233, 30, 99, 0.4);
  z-index: 100;
}
.float-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}
.float-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
