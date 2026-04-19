<template>
  <view class="page-discover">
    <!-- 顶部标签切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', currentTab === tab.value && 'active']"
        @click="currentTab = tab.value"
      >
        <text>{{ tab.label }}</text>
        <view v-if="currentTab === tab.value" class="tab-line" />
      </view>
    </view>

    <!-- 知识百科 -->
    <view v-if="currentTab === 'encyclopedia'" class="tab-content">
      <!-- 眼袋自测入口 -->
      <view class="quiz-banner" @click="startQuiz">
        <view class="quiz-banner-left">
          <text class="quiz-banner-title">👁 测测你的眼袋类型</text>
          <text class="quiz-banner-desc">3个问题，30秒，找到最适合你的方案</text>
        </view>
        <text class="quiz-banner-btn">开始测试 →</text>
      </view>

      <view class="wiki-grid">
        <view v-for="cat in wikiCategories" :key="cat.value" class="wiki-card" @click="goCategory(cat.value)">
          <view class="wiki-emoji-wrap">
            <view class="wiki-emoji">{{ cat.emoji }}</view>
            <text v-if="cat.hot" class="wiki-hot-badge">热</text>
          </view>
          <text class="wiki-title">{{ cat.label }}</text>
          <text class="wiki-desc">{{ cat.desc }}</text>
          <text class="wiki-count">{{ cat.count }}篇科普</text>
        </view>
      </view>
    </view>

    <!-- 眼袋自测弹窗 -->
    <view v-if="quizVisible" class="quiz-mask" @click.self="quizVisible = false">
      <view class="quiz-modal">
        <!-- 结果页 -->
        <view v-if="quizStep === 4" class="quiz-result">
          <text class="quiz-result-emoji">{{ quizResult.emoji }}</text>
          <text class="quiz-result-title">{{ quizResult.title }}</text>
          <text class="quiz-result-desc">{{ quizResult.desc }}</text>
          <view class="quiz-result-btns">
            <view class="quiz-btn-consult" @click="goFormFromQuiz">免费咨询专业医生</view>
            <view class="quiz-btn-close" @click="quizVisible = false">知道了</view>
          </view>
        </view>
        <!-- 问题页 -->
        <view v-else>
          <view class="quiz-progress">
            <view class="quiz-progress-bar" :style="{ width: (quizStep / 3 * 100) + '%' }" />
          </view>
          <text class="quiz-step-label">第 {{ quizStep }}/3 题</text>
          <text class="quiz-question">{{ quizQuestions[quizStep - 1].q }}</text>
          <view
            v-for="opt in quizQuestions[quizStep - 1].options"
            :key="opt.value"
            class="quiz-option"
            @click="answerQuiz(opt.value)"
          >
            <text>{{ opt.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门问答 -->
    <view v-if="currentTab === 'qa'" class="tab-content">
      <view v-for="qa in qaList" :key="qa.id" class="qa-card" @click="goQADetail(qa)">
        <view class="qa-header">
          <text class="qa-q-icon">Q</text>
          <text class="qa-question">{{ qa.question }}</text>
        </view>
        <view class="qa-body">
          <text class="qa-a-icon">A</text>
          <text class="qa-answer">{{ qa.answer }}</text>
        </view>
        <view class="qa-footer">
          <text class="qa-category">{{ getCategoryLabel(qa.category) }}</text>
          <view class="qa-like">
            <text class="qa-like-icon">&#x1F44D;</text>
            <text class="qa-like-count">{{ qa.like_count }}</text>
          </view>
        </view>
      </view>

      <view class="consult-banner" @click="goForm">
        <text class="consult-banner-text">还有疑问？专业医师在线解答</text>
        <text class="consult-banner-btn">免费咨询</text>
      </view>
    </view>

    <!-- 美丽贴士 -->
    <view v-if="currentTab === 'tips'" class="tab-content">
      <view v-for="(tip, index) in tipsList" :key="tip.id" class="tip-card">
        <view class="tip-number">
          <text class="tip-num-text">{{ String(index + 1).padStart(2, '0') }}</text>
        </view>
        <view class="tip-content">
          <text class="tip-title">{{ tip.title }}</text>
          <text class="tip-text">{{ tip.content }}</text>
        </view>
      </view>

      <view class="consult-banner" @click="goForm">
        <text class="consult-banner-text">想获取个性化护肤建议？</text>
        <text class="consult-banner-btn">免费咨询</text>
      </view>
    </view>

    <!-- 案例展示 -->
    <view v-if="currentTab === 'cases'" class="tab-content">
      <view class="cases-notice">
        <text class="cases-notice-text">以下案例仅供参考，效果因人而异，请以面诊结果为准</text>
      </view>
      <view v-for="item in caseList" :key="item.id" class="case-card">
        <view class="case-header">
          <text class="case-title">{{ item.title }}</text>
          <text class="case-category">{{ getCategoryLabel(item.category) }}</text>
        </view>
        <text class="case-desc">{{ item.description }}</text>
        <view class="case-images">
          <view class="case-img-placeholder">
            <text class="case-img-label">术前</text>
          </view>
          <view class="case-arrow">
            <text>→</text>
          </view>
          <view class="case-img-placeholder after">
            <text class="case-img-label">术后</text>
          </view>
        </view>
        <view class="case-tags">
          <text v-for="tag in item.tags" :key="tag" class="case-tag">{{ tag }}</text>
        </view>
      </view>

      <view class="consult-banner" @click="goForm">
        <text class="consult-banner-text">想了解更多案例？预约免费面诊</text>
        <text class="consult-banner-btn">立即咨询</text>
      </view>
    </view>

    <!-- 悬浮咨询按钮 -->
    <float-consult />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import floatConsult from '@/components/float-consult/float-consult.vue'
import { qaList, tipsList, caseList, articleList } from '@/utils/mock-data.js'

const tabs = [
  { label: '知识百科', value: 'encyclopedia' },
  { label: '热门问答', value: 'qa' },
  { label: '美丽贴士', value: 'tips' },
  { label: '案例展示', value: 'cases' }
]

const currentTab = ref('encyclopedia')

const categoryMap = {
  eye_bag: '眼袋',
  double_eyelid: '双眼皮',
  skin_care: '皮肤管理',
  nose: '鼻部整形',
  face: '面部轮廓',
  dental: '口腔美容',
  body: '形体塑造',
  anti_aging: '抗衰老'
}

const wikiCategories = [
  {
    value: 'eye_bag', label: '眼袋', emoji: '👁', hot: true,
    desc: '内切/外切/无创祛眼袋',
    count: articleList.filter(a => a.category === 'eye_bag').length
  },
  {
    value: 'double_eyelid', label: '双眼皮', emoji: '✂️',
    desc: '全切/埋线/开眼角',
    count: articleList.filter(a => a.category === 'double_eyelid').length
  },
  {
    value: 'skin_care', label: '皮肤管理', emoji: '✨',
    desc: '光子嫩肤/刷酸/补水',
    count: articleList.filter(a => a.category === 'skin_care').length
  },
  {
    value: 'nose', label: '鼻部整形', emoji: '👃',
    desc: '隆鼻/鼻综合/鼻翼缩小',
    count: articleList.filter(a => a.category === 'nose').length
  },
  {
    value: 'face', label: '面部轮廓', emoji: '💎',
    desc: '瘦脸针/吸脂/下颌角',
    count: articleList.filter(a => a.category === 'face').length
  },
  {
    value: 'dental', label: '口腔美容', emoji: '😁',
    desc: '牙齿矫正/贴面/美白',
    count: articleList.filter(a => a.category === 'dental').length
  },
  {
    value: 'anti_aging', label: '抗衰老', emoji: '🌿',
    desc: '热玛吉/超声刀/水光',
    count: articleList.filter(a => a.category === 'anti_aging').length
  }
]

function getCategoryLabel(value) {
  return categoryMap[value] || value
}

function goCategory(category) {
  const first = articleList.find(a => a.category === category)
  if (first) {
    uni.navigateTo({ url: `/pages/article/detail?id=${first._id}` })
  }
}

function goQADetail(qa) {
  // Show the answer in a simple modal
  uni.showModal({
    title: qa.question,
    content: qa.answer,
    showCancel: false,
    confirmText: '知道了'
  })
}

function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}

// ===== 眼袋自测 =====
const quizVisible = ref(false)
const quizStep = ref(1)
const quizAnswers = ref([])

const quizQuestions = [
  {
    q: '你的眼袋用手向上推时会怎样？',
    options: [
      { label: '推起后眼袋基本消失', value: 'skin' },
      { label: '推起后仍有明显凸起', value: 'fat' },
      { label: '不太确定', value: 'mix' }
    ]
  },
  {
    q: '你的眼周皮肤状态如何？',
    options: [
      { label: '弹性好，基本没有细纹', value: 'good' },
      { label: '有一些细纹，皮肤有点松', value: 'normal' },
      { label: '明显松弛，皱纹较多', value: 'loose' }
    ]
  },
  {
    q: '你更倾向哪种方式改善眼袋？',
    options: [
      { label: '手术，效果彻底持久', value: 'surgery' },
      { label: '无创，不想动刀', value: 'noninvasive' },
      { label: '先了解，再做决定', value: 'undecided' }
    ]
  }
]

const quizResult = computed(() => {
  const [q1, q2, q3] = quizAnswers.value
  if (q3 === 'noninvasive') {
    return {
      emoji: '✨',
      title: '无创方案适合你',
      desc: '你倾向于无创改善。眼周热玛吉或射频微针可以收紧皮肤、改善轻中度眼袋，无需手术，恢复快。建议咨询医生评估眼袋严重程度后制定方案。'
    }
  }
  if (q1 === 'fat' && q2 === 'good') {
    return {
      emoji: '🎯',
      title: '内切去眼袋最适合你',
      desc: '你的眼袋以脂肪膨出为主，皮肤弹性好。内切手术从结膜面进入，皮肤表面零疤痕，恢复快，是最适合你的方案。'
    }
  }
  if (q1 === 'skin' || q2 === 'loose') {
    return {
      emoji: '💡',
      title: '外切去眼袋更适合你',
      desc: '你的眼袋有明显皮肤松弛成分。外切手术可以同时去除多余皮肤和脂肪，改善更全面。建议咨询医生面诊评估，同时了解脂肪重置方案。'
    }
  }
  return {
    emoji: '👨‍⚕️',
    title: '建议面诊专业评估',
    desc: '你的情况需要医生结合面部条件综合判断，内切、外切或无创方案都有可能适合你。免费面诊可以帮你找到最适合的方案。'
  }
})

function startQuiz() {
  quizStep.value = 1
  quizAnswers.value = []
  quizVisible.value = true
}

function answerQuiz(value) {
  quizAnswers.value.push(value)
  if (quizStep.value < 3) {
    quizStep.value++
  } else {
    quizStep.value = 4 // 结果页
  }
}

function goFormFromQuiz() {
  quizVisible.value = false
  uni.navigateTo({ url: '/pages/form/index' })
}
</script>

<style scoped>
.page-discover {
  background-color: #F5F5F5;
  min-height: 100vh;
}

/* Tab bar */
.tab-bar {
  display: flex;
  background-color: #fff;
  padding: 0 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0 18rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}
.tab-item.active {
  color: #E91E63;
  font-weight: bold;
}
.tab-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background-color: #E91E63;
  border-radius: 3rpx;
}

.tab-content {
  padding: 20rpx 30rpx;
}

/* Quiz banner */
.quiz-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #FCE4EC, #F8BBD0);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid #F48FB1;
}
.quiz-banner-left {
  flex: 1;
}
.quiz-banner-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #880E4F;
  display: block;
  margin-bottom: 8rpx;
}
.quiz-banner-desc {
  font-size: 22rpx;
  color: #C2185B;
}
.quiz-banner-btn {
  font-size: 24rpx;
  color: #fff;
  background-color: #E91E63;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-weight: bold;
  flex-shrink: 0;
  margin-left: 16rpx;
}

/* Quiz modal */
.quiz-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}
.quiz-modal {
  background: #fff;
  width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 40rpx 60rpx;
}
.quiz-progress {
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  margin-bottom: 24rpx;
}
.quiz-progress-bar {
  height: 6rpx;
  background: #E91E63;
  border-radius: 3rpx;
  transition: width 0.3s;
}
.quiz-step-label {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 16rpx;
}
.quiz-question {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 32rpx;
  line-height: 1.6;
}
.quiz-option {
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
}
.quiz-option:active {
  background: #FCE4EC;
  border-color: #E91E63;
  color: #E91E63;
}
.quiz-result {
  text-align: center;
  padding: 20rpx 0;
}
.quiz-result-emoji {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}
.quiz-result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}
.quiz-result-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
  display: block;
  margin-bottom: 40rpx;
  text-align: left;
}
.quiz-result-btns {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.quiz-btn-consult {
  background: linear-gradient(135deg, #E91E63, #FF5252);
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  text-align: center;
  padding: 28rpx;
  border-radius: 16rpx;
}
.quiz-btn-close {
  background: #F5F5F5;
  color: #666;
  font-size: 28rpx;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
}

/* Wiki grid */
.wiki-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.wiki-card {
  width: 48.5%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.wiki-emoji-wrap {
  position: relative;
  width: 48rpx;
  margin-bottom: 12rpx;
}
.wiki-emoji {
  font-size: 48rpx;
}
.wiki-hot-badge {
  position: absolute;
  top: -8rpx;
  right: -20rpx;
  background: linear-gradient(135deg, #FF6B35, #FF3B30);
  color: #fff;
  font-size: 18rpx;
  font-weight: bold;
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
  line-height: 1.4;
  letter-spacing: 1rpx;
}
.wiki-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.wiki-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
.wiki-count {
  font-size: 22rpx;
  color: #E91E63;
  margin-top: 12rpx;
}

/* Q&A */
.qa-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.qa-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}
.qa-q-icon {
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  background-color: #E91E63;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: bold;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.qa-question {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  line-height: 44rpx;
}
.qa-body {
  display: flex;
  align-items: flex-start;
}
.qa-a-icon {
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  background-color: #4CAF50;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: bold;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.qa-answer {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}
.qa-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}
.qa-category {
  font-size: 22rpx;
  color: #E91E63;
  background-color: #FCE4EC;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.qa-like {
  display: flex;
  align-items: center;
}
.qa-like-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}
.qa-like-count {
  font-size: 22rpx;
  color: #999;
}

/* Tips */
.tip-card {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.tip-number {
  width: 60rpx;
  height: 60rpx;
  background-color: #FCE4EC;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.tip-num-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #E91E63;
}
.tip-content {
  flex: 1;
}
.tip-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}
.tip-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}

/* Cases */
.cases-notice {
  background-color: #FFF8E1;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}
.cases-notice-text {
  font-size: 22rpx;
  color: #F57F17;
}
.case-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.case-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}
.case-category {
  font-size: 22rpx;
  color: #E91E63;
  background-color: #FCE4EC;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.case-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}
.case-images {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}
.case-img-placeholder {
  width: 260rpx;
  height: 200rpx;
  background-color: #F5F5F5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;
}
.case-img-placeholder.after {
  background-color: #FCE4EC;
  border-color: #E91E63;
}
.case-img-label {
  font-size: 28rpx;
  color: #999;
}
.case-arrow {
  font-size: 36rpx;
  color: #E91E63;
}
.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.case-tag {
  font-size: 22rpx;
  color: #666;
  background-color: #F5F5F5;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* Consult banner */
.consult-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #E91E63, #FF5252);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-top: 10rpx;
}
.consult-banner-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}
.consult-banner-btn {
  font-size: 24rpx;
  color: #E91E63;
  background-color: #fff;
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  font-weight: bold;
}
</style>
