<template>
  <view class="page-result">
    <view class="result-card">
      <view class="icon-success">✓</view>
      <text class="result-title">提交成功</text>
      <text class="result-desc">感谢您的留言，我们将尽快整理相关科普资料与您联系</text>
      <text class="result-tip">本平台不提供诊疗服务，具体建议以合作医疗机构面诊为准</text>
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
  padding: 0 40rpx;
  text-align: center;
}
.result-tip {
  font-size: 22rpx;
  color: #bbb;
  margin-top: 20rpx;
  padding: 0 40rpx;
  text-align: center;
  line-height: 1.7;
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
