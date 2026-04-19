<template>
  <view class="page-index">
    <!-- 隐私弹窗 -->
    <privacy-popup ref="privacyPopupRef" @agree="onPrivacyAgree" @disagree="onPrivacyDisagree" />

    <!-- 搜索栏 -->
    <view class="search-bar" @click="goSearch">
      <view class="search-inner">
        <text class="search-icon">&#x1F50D;</text>
        <text class="search-placeholder">搜索医美科普知识...</text>
      </view>
    </view>

    <!-- Banner轮播 -->
    <swiper class="banner-swiper" autoplay circular indicator-dots indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#fff">
      <swiper-item v-for="banner in bannerList" :key="banner.id" @click="onBannerClick(banner)">
        <image class="banner-image" :src="banner.image" mode="aspectFill" />
        <view class="banner-title-bar">
          <text class="banner-title">{{ banner.title }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 分类导航 -->
    <view class="category-grid">
      <view v-for="cat in displayCategories" :key="cat.value" class="category-grid-item" @click="switchCategory(cat.value)">
        <view class="category-icon-container">
          <view :class="['category-icon-wrap', currentCategory === cat.value && 'active']">
            <text class="category-icon-text">{{ cat.emoji }}</text>
          </view>
          <text v-if="cat.hot" class="category-hot-badge">热</text>
        </view>
        <text :class="['category-name', currentCategory === cat.value && 'active']">{{ cat.label }}</text>
      </view>
    </view>

    <!-- 热门推荐 -->
    <view class="section" v-if="currentCategory === 'all'">
      <view class="section-header">
        <text class="section-title">热门推荐</text>
        <text class="section-more" @click="switchCategory('all')">更多</text>
      </view>
      <scroll-view scroll-x class="hot-scroll">
        <view v-for="article in hotArticles" :key="article._id" class="hot-card" @click="goDetail(article._id)">
          <image class="hot-cover" :src="article.cover_image" mode="aspectFill" />
          <text class="hot-title">{{ article.title }}</text>
          <view class="hot-meta">
            <text class="hot-author">{{ article.author }}</text>
            <text class="hot-read">{{ formatCount(article.read_count) }}阅读</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 文章列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">{{ currentCategory === 'all' ? '最新文章' : currentCategoryLabel }}</text>
      </view>
      <view v-for="article in displayArticles" :key="article._id" class="article-card" @click="goDetail(article._id)">
        <view class="article-info">
          <text class="article-title">{{ article.title }}</text>
          <text class="article-summary">{{ article.summary }}</text>
          <view class="article-meta">
            <text class="meta-author">{{ article.author }}</text>
            <text class="meta-dot">.</text>
            <text class="meta-read">{{ formatCount(article.read_count) }}阅读</text>
            <text class="meta-dot">.</text>
            <text class="meta-time">{{ formatTimeAgo(article.create_time) }}</text>
          </view>
        </view>
        <image class="article-cover" :src="article.cover_image" mode="aspectFill" />
      </view>

      <view v-if="displayArticles.length === 0" class="empty-tip">
        <text>暂无相关文章</text>
      </view>
      <view v-if="!hasMore && displayArticles.length > 0" class="loading-tip">
        <text>— 已经到底了 —</text>
      </view>
    </view>

    <!-- 悬浮咨询按钮 -->
    <float-consult />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import privacyPopup from '@/components/privacy-popup/privacy-popup.vue'
import floatConsult from '@/components/float-consult/float-consult.vue'
import {
  parseFromLaunchOptions,
  parseFromClipboard,
  saveClickId,
  syncClickIdToCloud
} from '@/utils/click-id.js'
import {
  bannerList,
  articleList,
  getArticlesByCategory,
  formatCount,
  formatTimeAgo
} from '@/utils/mock-data.js'

const privacyPopupRef = ref(null)
const currentCategory = ref('all')
const page = ref(1)
const allDisplayed = ref([])
const hasMore = ref(true)

const displayCategories = [
  { value: 'all', label: '全部', emoji: '🏠' },
  { value: 'eye_bag', label: '眼袋', emoji: '👁', hot: true },
  { value: 'double_eyelid', label: '双眼皮', emoji: '✂️' },
  { value: 'skin_care', label: '皮肤管理', emoji: '✨' },
  { value: 'nose', label: '鼻部整形', emoji: '👃' },
  { value: 'face', label: '面部轮廓', emoji: '💎' },
  { value: 'dental', label: '口腔美容', emoji: '😁' },
  { value: 'anti_aging', label: '抗衰老', emoji: '🌿' }
]

const currentCategoryLabel = computed(() => {
  const cat = displayCategories.find(c => c.value === currentCategory.value)
  return cat ? cat.label : '文章'
})

// Hot articles: 前2个固定为眼袋文章，后2个取其他分类阅读量最高的
const hotArticles = computed(() => {
  const eyeBagTop = [...articleList]
    .filter(a => a.category === 'eye_bag')
    .sort((a, b) => b.read_count - a.read_count)
    .slice(0, 2)
  const othersTop = [...articleList]
    .filter(a => a.category !== 'eye_bag')
    .sort((a, b) => b.read_count - a.read_count)
    .slice(0, 2)
  return [...eyeBagTop, ...othersTop]
})

const displayArticles = computed(() => allDisplayed.value)

onMounted(() => {
  const needPopup = uni.getStorageSync('need_privacy_popup')
  if (needPopup) {
    uni.removeStorageSync('need_privacy_popup')
    setTimeout(() => {
      privacyPopupRef.value?.open()
    }, 500)
  }
  loadArticles(true)
})

function loadArticles(reset = false) {
  if (reset) {
    page.value = 1
    allDisplayed.value = []
    hasMore.value = true
  }
  const result = getArticlesByCategory(currentCategory.value, page.value, 6)
  allDisplayed.value = reset ? result.data : [...allDisplayed.value, ...result.data]
  hasMore.value = result.hasMore
  page.value++
}

onPullDownRefresh(() => {
  loadArticles(true)
  uni.stopPullDownRefresh()
})

function switchCategory(value) {
  currentCategory.value = value
  loadArticles(true)
}

function onBannerClick(banner) {
  if (banner.link === 'form') {
    uni.navigateTo({ url: '/pages/form/index' })
  } else if (banner.articleId) {
    uni.navigateTo({ url: `/pages/article/detail?id=${banner.articleId}` })
  }
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/article/detail?id=${id}` })
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

async function onPrivacyAgree() {
  let result = parseFromLaunchOptions({})
  if (!result.clickId) {
    result = await parseFromClipboard()
  }
  if (result.clickId) {
    saveClickId(result)
    syncClickIdToCloud(result)
  }
}

function onPrivacyDisagree() {
  // #ifdef APP-PLUS
  plus.runtime.quit()
  // #endif
}
</script>

<style scoped>
.page-index {
  padding-bottom: 120rpx;
  background-color: #F5F5F5;
}

/* Search bar */
.search-bar {
  padding: 16rpx 30rpx;
  background-color: #fff;
}
.search-inner {
  display: flex;
  align-items: center;
  height: 68rpx;
  background-color: #F5F5F5;
  border-radius: 34rpx;
  padding: 0 24rpx;
}
.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}
.search-placeholder {
  font-size: 26rpx;
  color: #999;
}

/* Banner */
.banner-swiper {
  height: 340rpx;
  margin: 0 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-top: 16rpx;
}
.banner-image {
  width: 100%;
  height: 340rpx;
}
.banner-title-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 24rpx;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
}
.banner-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

/* Category grid */
.category-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx 30rpx 10rpx;
  background-color: #fff;
  margin-top: 16rpx;
}
.category-grid-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}
.category-icon-container {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 10rpx;
}
.category-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.category-hot-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: linear-gradient(135deg, #FF6B35, #FF3B30);
  color: #fff;
  font-size: 18rpx;
  font-weight: bold;
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
  line-height: 1.4;
  letter-spacing: 1rpx;
}
.category-icon-wrap.active {
  background-color: #FCE4EC;
}
.category-icon-text {
  font-size: 40rpx;
}
.category-name {
  font-size: 24rpx;
  color: #666;
}
.category-name.active {
  color: #E91E63;
  font-weight: bold;
}

/* Section */
.section {
  margin-top: 16rpx;
  background-color: #fff;
  padding: 24rpx 30rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.section-more {
  font-size: 24rpx;
  color: #999;
}

/* Hot scroll */
.hot-scroll {
  white-space: nowrap;
}
.hot-card {
  display: inline-block;
  width: 280rpx;
  margin-right: 20rpx;
  vertical-align: top;
  white-space: normal;
}
.hot-cover {
  width: 280rpx;
  height: 180rpx;
  border-radius: 12rpx;
}
.hot-title {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  margin-top: 10rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hot-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}
.hot-author, .hot-read {
  font-size: 22rpx;
  color: #999;
}

/* Article list */
.article-card {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.article-card:last-child {
  border-bottom: none;
}
.article-info {
  flex: 1;
  padding-right: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.article-title {
  font-size: 30rpx;
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
.article-meta {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}
.meta-author, .meta-read, .meta-time {
  font-size: 22rpx;
  color: #bbb;
}
.meta-dot {
  margin: 0 8rpx;
  color: #ddd;
  font-size: 22rpx;
}
.article-cover {
  width: 220rpx;
  height: 150rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

/* Empty / loading */
.loading-tip, .empty-tip {
  text-align: center;
  padding: 30rpx;
  color: #ccc;
  font-size: 24rpx;
}

</style>
