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
      <!-- 眼袋科普小测 -->
      <view class="quiz-banner" @click="startQuiz">
        <view class="quiz-banner-left">
          <text class="quiz-banner-title">👁 眼袋类型科普小测</text>
          <text class="quiz-banner-desc">3 个问题，了解眼袋相关知识（非诊疗建议）</text>
        </view>
        <text class="quiz-banner-btn">开始了解 →</text>
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
            <view class="quiz-btn-consult" @click="goFormFromQuiz">查看更多相关科普</view>
            <view class="quiz-btn-close" @click="quizVisible = false">知道了</view>
          </view>
          <text class="quiz-result-tip">以上内容仅供科普参考，具体情况请以执业医师面诊结果为准。</text>
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
      <view v-for="qa in qaList" :key="qa._id || qa.seed_id" class="qa-card" @click="goQADetail(qa)">
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
          <text class="qa-answerer">{{ qa.answerer_name || '编辑部' }}</text>
        </view>
      </view>

      <view v-if="!qaList.length" class="empty-tip">
        <text>暂无问答内容</text>
      </view>

      <view class="consult-banner" @click="goForm">
        <text class="consult-banner-text">想了解更多？留下您的信息，我们将整理相关科普资料</text>
        <text class="consult-banner-btn">在线留言</text>
      </view>
    </view>

    <!-- 美丽贴士 -->
    <view v-if="currentTab === 'tips'" class="tab-content">
      <view v-for="(tip, index) in tipsList" :key="tip._id || tip.seed_id || index" class="tip-card">
        <view class="tip-number">
          <text class="tip-num-text">{{ String(index + 1).padStart(2, '0') }}</text>
        </view>
        <view class="tip-content">
          <text class="tip-title">{{ tip.title }}</text>
          <text class="tip-text">{{ tip.content }}</text>
        </view>
      </view>

      <view v-if="!tipsList.length" class="empty-tip">
        <text>暂无贴士内容</text>
      </view>

      <view class="consult-banner" @click="goForm">
        <text class="consult-banner-text">想了解更多护肤科普？留下您的信息</text>
        <text class="consult-banner-btn">在线留言</text>
      </view>
    </view>

    <!-- 悬浮咨询按钮 -->
    <float-consult />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import floatConsult from '@/components/float-consult/float-consult.vue'
import { listQa, listTips, listArticles } from '@/utils/content-api.js'

// 注意：首版"案例展示"tab 已依据《医疗广告管理办法》第七条暂时下线
// （禁止以治疗前后对比形式宣传医疗广告）。待获得对应广告审查证明后再开放。
const tabs = [
  { label: '知识百科', value: 'encyclopedia' },
  { label: '热门问答', value: 'qa' },
  { label: '美丽贴士', value: 'tips' }
]

const currentTab = ref('encyclopedia')
const qaList = ref([])
const tipsList = ref([])
const qaLoaded = ref(false)
const tipsLoaded = ref(false)

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
  { value: 'eye_bag', label: '眼袋', emoji: '👁', desc: '内切/外切/无创祛眼袋' },
  { value: 'double_eyelid', label: '双眼皮', emoji: '✂️', desc: '全切/埋线/开眼角' },
  { value: 'skin_care', label: '皮肤管理', emoji: '✨', desc: '光子嫩肤/刷酸/补水' },
  { value: 'nose', label: '鼻部整形', emoji: '👃', desc: '隆鼻/鼻综合/鼻翼缩小' },
  { value: 'face', label: '面部轮廓', emoji: '💎', desc: '瘦脸针/吸脂/下颌角' },
  { value: 'dental', label: '口腔美容', emoji: '😁', desc: '牙齿矫正/贴面/美白' },
  { value: 'anti_aging', label: '抗衰老', emoji: '🌿', desc: '热玛吉/超声刀/水光' }
]

function getCategoryLabel(value) {
  return categoryMap[value] || value
}

async function goCategory(category) {
  const { items } = await listArticles({ category, page: 1, pageSize: 1 })
  const first = items && items[0]
  if (first) {
    const targetId = first._id || first.seed_id
    uni.navigateTo({ url: `/pages/article/detail?id=${targetId}` })
  } else {
    uni.showToast({ title: '该分类暂无科普内容', icon: 'none' })
  }
}

async function loadQa() {
  if (qaLoaded.value) return
  try {
    const { items } = await listQa({ page: 1, pageSize: 30 })
    qaList.value = items || []
  } finally {
    qaLoaded.value = true
  }
}

async function loadTips() {
  if (tipsLoaded.value) return
  try {
    const { items } = await listTips({ page: 1, pageSize: 30 })
    tipsList.value = items || []
  } finally {
    tipsLoaded.value = true
  }
}

watch(currentTab, (tab) => {
  if (tab === 'qa') loadQa()
  else if (tab === 'tips') loadTips()
})

onMounted(() => {
  // 预加载问答，切换时更顺滑
  loadQa()
})

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
      title: '了解一下：无创改善方向的科普',
      desc: '您倾向无创方式。相关科普资料中介绍了射频类、光电类等非手术方案的原理与适用范围。具体是否适合个体情况，需由执业医师面诊评估。'
    }
  }
  if (q1 === 'fat' && q2 === 'good') {
    return {
      emoji: '🎯',
      title: '了解一下：内切术式相关科普',
      desc: '您的选项偏向脂肪型眼袋、皮肤弹性较好的特征。科普资料中介绍了经结膜入路术式的原理与注意事项，仅供了解，不构成诊疗建议。'
    }
  }
  if (q1 === 'skin' || q2 === 'loose') {
    return {
      emoji: '💡',
      title: '了解一下：外切与皮肤松弛相关科普',
      desc: '您的选项与皮肤松弛相关。科普资料介绍了外切术式、脂肪重置等常见改善方向的基本原理与适用人群，具体需面诊评估。'
    }
  }
  return {
    emoji: '👨‍⚕️',
    title: '建议面诊专业评估',
    desc: '眼袋类型需由执业医师结合面部条件综合判断。您可以在"知识百科"继续阅读相关科普内容，或前往具备资质的医疗机构面诊咨询。'
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
.quiz-result-tip {
  display: block;
  margin-top: 20rpx;
  font-size: 22rpx;
  color: #999;
  text-align: center;
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
.qa-answerer {
  font-size: 22rpx;
  color: #999;
}
.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #bbb;
  font-size: 26rpx;
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
