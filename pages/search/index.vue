<template>
  <view class="page-search">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索医美科普知识"
          confirm-type="search"
          focus
          @confirm="doSearch"
        />
      </view>
      <text class="search-btn" @click="doSearch">搜索</text>
    </view>

    <!-- 热门搜索 -->
    <view v-if="!hasSearched" class="hot-section">
      <text class="section-title">热门搜索</text>
      <view class="hot-tags">
        <text v-for="tag in hotSearches" :key="tag" class="hot-tag" @click="quickSearch(tag)">{{ tag }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="hasSearched" class="result-section">
      <text class="result-count">找到 {{ results.length }} 篇相关文章</text>
      <view v-for="article in results" :key="article._id" class="result-item" @click="goDetail(article._id)">
        <text class="result-title">{{ article.title }}</text>
        <text class="result-summary">{{ article.summary }}</text>
        <view class="result-meta">
          <text>{{ article.author }}</text>
          <text class="meta-sep">|</text>
          <text>{{ formatCount(article.read_count) }}阅读</text>
        </view>
      </view>
      <view v-if="results.length === 0" class="empty">
        <text class="empty-text">未找到相关内容</text>
        <text class="empty-hint">换个关键词试试，或直接咨询专业医师</text>
        <view class="empty-btn" @click="goForm">
          <text class="empty-btn-text">免费咨询</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { hotSearches, searchArticles, formatCount } from '@/utils/mock-data.js'

const keyword = ref('')
const results = ref([])
const hasSearched = ref(false)

function doSearch() {
  if (!keyword.value.trim()) return
  hasSearched.value = true
  results.value = searchArticles(keyword.value.trim())
}

function quickSearch(tag) {
  keyword.value = tag
  doSearch()
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/article/detail?id=${id}` })
}

function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}
</script>

<style scoped>
.page-search {
  background-color: #F5F5F5;
  min-height: 100vh;
}
.search-header {
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx;
  background-color: #fff;
}
.search-input-wrap {
  flex: 1;
  height: 68rpx;
  background-color: #F5F5F5;
  border-radius: 34rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  height: 68rpx;
}
.search-btn {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #E91E63;
  font-weight: bold;
}
.hot-section {
  padding: 30rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.hot-tag {
  padding: 14rpx 28rpx;
  background-color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
}
.result-section {
  padding: 20rpx 30rpx;
}
.result-count {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}
.result-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.result-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}
.result-summary {
  font-size: 26rpx;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.result-meta {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #bbb;
}
.meta-sep { margin: 0 12rpx; }
.empty {
  text-align: center;
  padding: 100rpx 0;
}
.empty-text {
  font-size: 30rpx;
  color: #999;
  display: block;
}
.empty-hint {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 10rpx;
  display: block;
}
.empty-btn {
  margin-top: 30rpx;
  background-color: #E91E63;
  padding: 16rpx 48rpx;
  border-radius: 36rpx;
}
.empty-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
