<template>
  <view class="page-detail">
    <view v-if="article" class="article-content">
      <text class="article-title">{{ article.title }}</text>
      <view class="article-meta">
        <text class="meta-category">{{ categoryLabel }}</text>
        <text class="meta-time">{{ formatTime(article.create_time) }}</text>
      </view>
      <rich-text class="article-body" :nodes="article.content" />
    </view>

    <view v-else-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部咨询按钮 -->
    <view class="bottom-bar">
      <button class="consult-btn" @click="goForm">免费咨询</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const db = uniCloud.database()

const article = ref(null)
const loading = ref(true)

const categoryMap = {
  double_eyelid: '双眼皮',
  skin_care: '皮肤管理'
}

const categoryLabel = computed(() => {
  return categoryMap[article.value?.category] || '科普'
})

onLoad((options) => {
  if (options.id) {
    loadArticle(options.id)
  }
})

async function loadArticle(id) {
  loading.value = true
  try {
    const res = await db.collection('articles').doc(id).get()
    if (res.result.data && res.result.data.length > 0) {
      article.value = res.result.data[0]
      uni.setNavigationBarTitle({ title: article.value.title })
    }
  } catch (e) {
    console.error('loadArticle failed:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}
</script>

<style scoped>
.page-detail {
  padding-bottom: 130rpx;
}
.article-content {
  background-color: #fff;
  padding: 30rpx;
}
.article-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
}
.article-meta {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 30rpx;
  gap: 20rpx;
}
.meta-category {
  font-size: 22rpx;
  color: #E91E63;
  background-color: #FCE4EC;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
}
.meta-time {
  font-size: 24rpx;
  color: #999;
}
.article-body {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
}
.loading {
  text-align: center;
  padding: 60rpx;
  color: #999;
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.consult-btn {
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
