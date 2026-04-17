<template>
  <view class="page-favorites">
    <view v-if="list.length === 0" class="empty">
      <text class="empty-icon">&#x2B50;</text>
      <text class="empty-text">暂无收藏内容</text>
      <text class="empty-hint">浏览文章时点击收藏按钮即可添加</text>
    </view>
    <view v-for="article in list" :key="article._id" class="article-item" @click="goDetail(article._id)">
      <view class="article-info">
        <text class="article-title">{{ article.title }}</text>
        <text class="article-summary">{{ article.summary }}</text>
      </view>
      <image v-if="article.cover_image" class="article-cover" :src="article.cover_image" mode="aspectFill" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getArticleById } from '@/utils/mock-data.js'

const list = ref([])

onShow(() => {
  const ids = uni.getStorageSync('my_favorites') || []
  list.value = ids.map(id => getArticleById(id)).filter(Boolean)
})

function goDetail(id) {
  uni.navigateTo({ url: `/pages/article/detail?id=${id}` })
}
</script>

<style scoped>
.page-favorites {
  background-color: #F5F5F5;
  min-height: 100vh;
  padding: 20rpx 30rpx;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 0;
}
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 30rpx; color: #999; }
.empty-hint { font-size: 24rpx; color: #ccc; margin-top: 10rpx; }
.article-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.article-info { flex: 1; padding-right: 20rpx; }
.article-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.article-summary {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.article-cover {
  width: 180rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
</style>
