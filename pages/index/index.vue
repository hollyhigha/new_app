<template>
  <view class="page-index">
    <!-- 隐私弹窗 -->
    <privacy-popup ref="privacyPopupRef" @agree="onPrivacyAgree" @disagree="onPrivacyDisagree" />

    <!-- 医美科普免责声明（常驻顶部） -->
    <view class="disclaimer-bar">
      <text class="disclaimer-text">本平台内容仅供科普参考，不构成诊疗建议，就医请咨询执业医师</text>
    </view>

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
        <view v-for="article in hotArticles" :key="article._id || article.seed_id" class="hot-card" @click="goDetail(article._id || article.seed_id)">
          <image class="hot-cover" :src="article.cover_image" mode="aspectFill" />
          <text class="hot-title">{{ article.title }}</text>
          <view class="hot-meta">
            <text class="hot-author">{{ article.author || '编辑部' }}</text>
            <text v-if="article.read_count" class="hot-read">{{ formatCount(article.read_count) }}阅读</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 文章列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">{{ currentCategory === 'all' ? '最新文章' : currentCategoryLabel }}</text>
      </view>
      <view v-for="article in displayArticles" :key="article._id || article.seed_id" class="article-card" @click="goDetail(article._id || article.seed_id)">
        <view class="article-info">
          <text class="article-title">{{ article.title }}</text>
          <text class="article-summary">{{ article.summary }}</text>
          <view class="article-meta">
            <text class="meta-author">{{ article.author || '编辑部' }}</text>
            <template v-if="article.read_count">
              <text class="meta-dot">·</text>
              <text class="meta-read">{{ formatCount(article.read_count) }}阅读</text>
            </template>
            <template v-if="article.create_time">
              <text class="meta-dot">·</text>
              <text class="meta-time">{{ formatTimeAgo(article.create_time) }}</text>
            </template>
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
  saveClickId,
  syncClickIdToCloud,
  reportAppInstall
} from '@/utils/click-id.js'
import { bannerList, formatCount, formatTimeAgo } from '@/utils/mock-data.js'
import { listArticles, getHotArticles } from '@/utils/content-api.js'

const privacyPopupRef = ref(null)
const currentCategory = ref('all')
const page = ref(1)
const allDisplayed = ref([])
const hasMore = ref(true)
const hotArticles = ref([])
const loading = ref(false)

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

const displayArticles = computed(() => allDisplayed.value)

onMounted(async () => {
  const privacyAgreed = uni.getStorageSync('privacy_agreed')
  if (!privacyAgreed) {
    setTimeout(() => {
      privacyPopupRef.value?.open()
    }, 300)
  }
  loadHotArticles()
  loadArticles(true)
})

async function loadHotArticles() {
  try {
    const items = await getHotArticles({ limit: 4 })
    hotArticles.value = items || []
  } catch (e) {
    hotArticles.value = []
  }
}

const PAGE_SIZE = 6

async function loadArticles(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    if (reset) {
      page.value = 1
      allDisplayed.value = []
      hasMore.value = true
    }
    const { items, total } = await listArticles({
      category: currentCategory.value,
      page: page.value,
      pageSize: PAGE_SIZE
    })
    allDisplayed.value = reset ? (items || []) : [...allDisplayed.value, ...(items || [])]
    hasMore.value = allDisplayed.value.length < (total || 0)
    page.value++
  } catch (e) {
    console.error('loadArticles failed:', e)
    if (reset) allDisplayed.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(async () => {
  await Promise.all([loadHotArticles(), loadArticles(true)])
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

function onPrivacyAgree() {
  const result = parseFromLaunchOptions({})
  if (result.clickId) {
    saveClickId(result)
    syncClickIdToCloud(result)
    reportAppInstall({ clickId: result.clickId, clientId: result.clientId })
  }
}

// iOS 禁止主动退出 App（4.0 / HIG），Android 也不宜强制退出。
// 用户不同意时进入"仅浏览模式"：仅展示本地科普内容，不收集任何个人信息，
// 不请求网络归因/登录能力。用户可在"设置"页随时重新查看并同意协议。
function onPrivacyDisagree() {
  uni.showModal({
    title: '温馨提示',
    content: '不同意协议时，您仍可浏览基础科普内容，但无法使用登录、留言咨询等功能。',
    showCancel: false,
    confirmText: '我知道了',
    success() {
      uni.setStorageSync('privacy_basic_mode', true)
    }
  })
}
</script>

<style scoped>
.page-index {
  padding-bottom: 120rpx;
  background-color: #F5F5F5;
}

.disclaimer-bar {
  background-color: #FFF8E1;
  padding: 12rpx 30rpx;
  border-bottom: 1rpx solid #FFECB3;
}
.disclaimer-text {
  font-size: 22rpx;
  color: #8A6D3B;
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
