<template>
  <view class="page-index">
    <!-- 隐私弹窗（首次启动） -->
    <privacy-popup
      ref="privacyPopupRef"
      @agree="onPrivacyAgree"
      @disagree="onPrivacyDisagree"
    />

    <!-- 顶部标题 -->
    <view class="header">
      <text class="header-title">靓人科普</text>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-bar">
      <view
        v-for="cat in categories"
        :key="cat.value"
        :class="['category-item', currentCategory === cat.value && 'active']"
        @click="switchCategory(cat.value)"
      >
        {{ cat.label }}
      </view>
    </scroll-view>

    <!-- 文章列表 -->
    <view class="article-list">
      <view
        v-for="article in articleList"
        :key="article._id"
        class="article-card"
        @click="goDetail(article._id)"
      >
        <image
          v-if="article.cover_image"
          class="article-cover"
          :src="article.cover_image"
          mode="aspectFill"
        />
        <view class="article-info">
          <text class="article-title">{{ article.title }}</text>
          <text class="article-summary">{{ article.summary }}</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-tip">
        <text>加载中...</text>
      </view>
      <view v-if="!loading && articleList.length === 0" class="empty-tip">
        <text>暂无文章</text>
      </view>
      <view v-if="noMore && articleList.length > 0" class="loading-tip">
        <text>没有更多了</text>
      </view>
    </view>

    <!-- 悬浮咨询按钮 -->
    <view class="float-btn" @click="goForm">
      <text class="float-btn-text">免费咨询</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import privacyPopup from '@/components/privacy-popup/privacy-popup.vue'
import {
  parseFromLaunchOptions,
  parseFromClipboard,
  saveClickId,
  syncClickIdToCloud
} from '@/utils/click-id.js'

const db = uniCloud.database()

const categories = [
  { label: '全部', value: 'all' },
  { label: '双眼皮', value: 'double_eyelid' },
  { label: '皮肤管理', value: 'skin_care' }
]

const currentCategory = ref('all')
const articleList = ref([])
const loading = ref(false)
const noMore = ref(false)
const pageSize = 10
const pageNum = ref(1)

// 隐私弹窗
const privacyPopupRef = ref(null)

onMounted(() => {
  // 检查是否需要显示隐私弹窗
  const needPopup = uni.getStorageSync('need_privacy_popup')
  if (needPopup) {
    uni.removeStorageSync('need_privacy_popup')
    privacyPopupRef.value?.open()
  }
  loadArticles(true)
})

async function onPrivacyAgree() {
  // 隐私同意后，执行 click_id 获取
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

async function loadArticles(reset = false) {
  if (loading.value) return
  if (!reset && noMore.value) return

  if (reset) {
    pageNum.value = 1
    noMore.value = false
    articleList.value = []
  }

  loading.value = true
  try {
    let query = db.collection('articles').where({ status: 1 })

    if (currentCategory.value !== 'all') {
      query = db.collection('articles').where({
        status: 1,
        category: currentCategory.value
      })
    }

    const res = await query
      .orderBy('sort_order', 'asc')
      .orderBy('create_time', 'desc')
      .skip((pageNum.value - 1) * pageSize)
      .limit(pageSize)
      .field('_id,title,summary,cover_image,category,create_time')
      .get()

    const list = res.result.data || []
    if (list.length < pageSize) {
      noMore.value = true
    }
    articleList.value = reset ? list : [...articleList.value, ...list]
    pageNum.value++
  } catch (e) {
    console.error('loadArticles failed:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function switchCategory(value) {
  currentCategory.value = value
  loadArticles(true)
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/article/detail?id=${id}` })
}

function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}

onPullDownRefresh(() => {
  loadArticles(true).then(() => {
    uni.stopPullDownRefresh()
  })
})

onReachBottom(() => {
  loadArticles()
})
</script>

<style scoped>
.page-index {
  padding-bottom: 120rpx;
}
.header {
  background-color: #fff;
  padding: 20rpx 30rpx;
}
.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.category-bar {
  white-space: nowrap;
  background-color: #fff;
  padding: 20rpx 30rpx;
}
.category-item {
  display: inline-block;
  padding: 12rpx 30rpx;
  margin-right: 16rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
}
.category-item.active {
  color: #fff;
  background-color: #E91E63;
}
.article-list {
  padding: 20rpx 30rpx;
}
.article-card {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}
.article-cover {
  width: 240rpx;
  height: 180rpx;
  flex-shrink: 0;
}
.article-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  margin-top: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.loading-tip,
.empty-tip {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}
.float-btn {
  position: fixed;
  bottom: 140rpx;
  right: 30rpx;
  background-color: #E91E63;
  border-radius: 60rpx;
  padding: 20rpx 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(233, 30, 99, 0.4);
}
.float-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
