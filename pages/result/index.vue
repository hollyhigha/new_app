<template>
  <view class="page-result">
    <view class="result-card">
      <view class="icon-success">✓</view>
      <text class="result-title">提交成功</text>
      <text class="result-desc">感谢您的咨询，我们将在 24 小时内联系您</text>
    </view>
    <button class="back-btn" @click="goHome">返回首页</button>
  </view>
</template>

<script setup>
function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}
.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon-success {
  width: 120rpx;
  height: 120rpx;
  line-height: 120rpx;
  text-align: center;
  font-size: 60rpx;
  color: #fff;
  background-color: #4CAF50;
  border-radius: 60rpx;
}
.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 40rpx;
}
.result-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 16rpx;
}
.back-btn {
  margin-top: 80rpx;
  width: 400rpx;
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
}
</style>
