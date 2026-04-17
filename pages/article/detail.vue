<template>
  <view class="page-detail">
    <view v-if="article" class="article-content">
      <text class="article-title">{{ article.title }}</text>
      <view class="article-meta">
        <text class="meta-category">{{ categoryLabel }}</text>
        <text class="meta-author">{{ article.author }}</text>
        <text class="meta-read">{{ formatCount(article.read_count) }}阅读</text>
      </view>
      <rich-text class="article-body" :nodes="article.content" />

      <!-- 相关推荐 -->
      <view v-if="relatedList.length > 0" class="related-section">
        <text class="related-title">相关推荐</text>
        <view v-for="item in relatedList" :key="item._id" class="related-item" @click="goDetail(item._id)">
          <text class="related-item-title">{{ item.title }}</text>
          <text class="related-item-read">{{ formatCount(item.read_count) }}阅读</text>
        </view>
      </view>
    </view>

    <view v-else class="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-group">
        <view class="action-item" @click="toggleLike">
          <text :class="['action-icon', isLiked && 'liked']">{{ isLiked ? '&#x2764;' : '&#x2661;' }}</text>
          <text class="action-text">{{ isLiked ? '已赞' : '点赞' }}</text>
        </view>
        <view class="action-item" @click="toggleFavorite">
          <text :class="['action-icon', isFavorited && 'favorited']">{{ isFavorited ? '&#x2605;' : '&#x2606;' }}</text>
          <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-item" @click="handleShare">
          <text class="action-icon">&#x21AA;</text>
          <text class="action-text">分享</text>
        </view>
      </view>
      <button class="consult-btn" @click="goForm">免费咨询</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getArticleById, getRelatedArticles, formatCount } from '@/utils/mock-data.js'

const article = ref(null)
const articleId = ref('')
const isLiked = ref(false)
const isFavorited = ref(false)
const relatedList = ref([])

const categoryMap = {
  double_eyelid: '双眼皮',
  skin_care: '皮肤管理',
  nose: '鼻部整形',
  face: '面部轮廓',
  dental: '口腔美容',
  body: '形体塑造',
  anti_aging: '抗衰老'
}

const categoryLabel = computed(() => {
  return categoryMap[article.value?.category] || '科普'
})

onLoad((options) => {
  if (options.id) {
    articleId.value = options.id
    loadArticle(options.id)
  }
})

function loadArticle(id) {
  const data = getArticleById(id)
  if (data) {
    article.value = data
    uni.setNavigationBarTitle({ title: data.title })

    // Load related articles
    relatedList.value = getRelatedArticles(id, data.category, 3)

    // Check like/favorite state
    const likes = uni.getStorageSync('my_likes') || []
    isLiked.value = likes.includes(id)
    const favorites = uni.getStorageSync('my_favorites') || []
    isFavorited.value = favorites.includes(id)

    // Add to browse history
    addToHistory(id)
  }
}

function addToHistory(id) {
  let history = uni.getStorageSync('browse_history') || []
  history = history.filter(h => h !== id)
  history.unshift(id)
  if (history.length > 50) history = history.slice(0, 50)
  uni.setStorageSync('browse_history', history)
}

function toggleLike() {
  let likes = uni.getStorageSync('my_likes') || []
  if (isLiked.value) {
    likes = likes.filter(id => id !== articleId.value)
  } else {
    likes.unshift(articleId.value)
  }
  uni.setStorageSync('my_likes', likes)
  isLiked.value = !isLiked.value
  uni.showToast({ title: isLiked.value ? '已点赞' : '已取消', icon: 'none', duration: 800 })
}

function toggleFavorite() {
  let favorites = uni.getStorageSync('my_favorites') || []
  if (isFavorited.value) {
    favorites = favorites.filter(id => id !== articleId.value)
  } else {
    favorites.unshift(articleId.value)
  }
  uni.setStorageSync('my_favorites', favorites)
  isFavorited.value = !isFavorited.value
  uni.showToast({ title: isFavorited.value ? '已收藏' : '已取消收藏', icon: 'none', duration: 800 })
}

function handleShare() {
  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: article.value?.title,
    summary: article.value?.summary,
    success: () => {},
    fail: () => {
      uni.showToast({ title: '分享功能需要安装微信', icon: 'none' })
    }
  })
  // #endif
  // #ifndef APP-PLUS
  uni.showToast({ title: '长按可分享给好友', icon: 'none' })
  // #endif
}

function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}

function goDetail(id) {
  uni.redirectTo({ url: `/pages/article/detail?id=${id}` })
}
</script>

<style scoped>
.page-detail {
  padding-bottom: 160rpx;
  background-color: #fff;
}
.article-content {
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
.meta-author, .meta-read {
  font-size: 24rpx;
  color: #999;
}
.article-body {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
}

/* Related */
.related-section {
  margin-top: 50rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}
.related-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}
.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.related-item:last-child { border-bottom: none; }
.related-item-title {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-right: 20rpx;
}
.related-item-read {
  font-size: 22rpx;
  color: #ccc;
  flex-shrink: 0;
}

.loading {
  text-align: center;
  padding: 60rpx;
  color: #999;
}

/* Bottom bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.action-group {
  display: flex;
  gap: 24rpx;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.action-icon {
  font-size: 40rpx;
  color: #999;
}
.action-icon.liked { color: #E91E63; }
.action-icon.favorited { color: #FFC107; }
.action-text {
  font-size: 20rpx;
  color: #999;
  margin-top: 2rpx;
}
.consult-btn {
  flex: 1;
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 76rpx;
  line-height: 76rpx;
  font-size: 30rpx;
  font-weight: bold;
}
</style>
