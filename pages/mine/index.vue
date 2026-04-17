<template>
  <view class="page-mine">
    <!-- 用户信息区 -->
    <view class="user-card">
      <view class="avatar-wrap">
        <image class="avatar" src="/static/default-avatar.png" mode="aspectFill" />
      </view>
      <view class="user-info">
        <text class="user-phone">{{ maskedPhone }}</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-group">
      <view class="menu-item" @click="goMyLeads">
        <text class="menu-text">我的咨询记录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="openWebview('agreement')">
        <text class="menu-text">用户协议</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="openWebview('privacy')">
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goFeedback">
        <text class="menu-text">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="handleLogout">
        <text class="menu-text">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="handleDeleteAccount">
        <text class="menu-text danger">注销账号</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 版本号 -->
    <view class="version-info">
      <text>版本 {{ appVersion }}</text>
    </view>

    <!-- 我的咨询记录弹出层 -->
    <uni-popup ref="leadsPopupRef" type="bottom">
      <view class="leads-popup">
        <view class="leads-header">
          <text class="leads-title">我的咨询记录</text>
          <text class="leads-close" @click="closeLeadsPopup">关闭</text>
        </view>
        <scroll-view scroll-y class="leads-list">
          <view v-if="myLeads.length === 0" class="empty-leads">
            <text>暂无咨询记录</text>
          </view>
          <view v-for="lead in myLeads" :key="lead._id" class="lead-item">
            <view class="lead-row">
              <text class="lead-label">姓名：</text>
              <text>{{ lead.name }}</text>
            </view>
            <view class="lead-row">
              <text class="lead-label">感兴趣：</text>
              <text>{{ formatInterest(lead.interest) }}</text>
            </view>
            <view class="lead-row">
              <text class="lead-label">状态：</text>
              <text :class="'status-' + lead.status">{{ statusText(lead.status) }}</text>
            </view>
            <view class="lead-row">
              <text class="lead-label">时间：</text>
              <text>{{ formatTime(lead.create_time) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const db = uniCloud.database()

const maskedPhone = ref('未登录')
const appVersion = ref('')
const myLeads = ref([])
const leadsPopupRef = ref(null)

const interestMap = {
  double_eyelid: '双眼皮',
  skin_care: '皮肤管理'
}

onMounted(() => {
  loadUserInfo()
  // #ifdef APP-PLUS
  appVersion.value = plus.runtime.version || '1.0.0'
  // #endif
  // #ifndef APP-PLUS
  appVersion.value = '1.0.0'
  // #endif
})

function loadUserInfo() {
  const userInfo = uniCloud.getCurrentUserInfo()
  if (userInfo.uid) {
    db.collection('uni-id-users').doc(userInfo.uid)
      .field('mobile')
      .get()
      .then(res => {
        const phone = res.result.data[0]?.mobile || ''
        maskedPhone.value = phone
          ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
          : '未设置手机号'
      })
      .catch(() => {
        maskedPhone.value = '获取失败'
      })
  }
}

async function goMyLeads() {
  const userInfo = uniCloud.getCurrentUserInfo()
  if (!userInfo.uid) return

  try {
    const res = await db.collection('leads')
      .where({ user_id: userInfo.uid })
      .orderBy('create_time', 'desc')
      .limit(20)
      .field('_id,name,interest,status,create_time')
      .get()
    myLeads.value = res.result.data || []
  } catch (e) {
    console.error('loadMyLeads failed:', e)
  }
  leadsPopupRef.value?.open()
}

function closeLeadsPopup() {
  leadsPopupRef.value?.close()
}

function formatInterest(arr) {
  return (arr || []).map(i => interestMap[i] || i).join('、')
}

function statusText(status) {
  const map = { 0: '待跟进', 1: '已联系', 2: '已转化', 3: '无效' }
  return map[status] || '未知'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openWebview(type) {
  uni.navigateTo({ url: `/pages/webview/index?type=${type}` })
}

function goFeedback() {
  // #ifdef APP-PLUS
  plus.runtime.openURL('mailto:feedback@liangren.com')
  // #endif
  // #ifndef APP-PLUS
  uni.showToast({ title: '请发送邮件到 feedback@liangren.com', icon: 'none' })
  // #endif
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        uni.removeStorageSync('uni_id_token')
        uni.removeStorageSync('uni_id_token_expired')
        uni.reLaunch({ url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd' })
      }
    }
  })
}

function handleDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被删除且无法恢复，确定要注销吗？',
    confirmColor: '#E91E63',
    success(res) {
      if (res.confirm) {
        const uniIdCo = uniCloud.importObject('uni-id-co')
        uniIdCo.closeAccount().then(() => {
          uni.removeStorageSync('uni_id_token')
          uni.removeStorageSync('uni_id_token_expired')
          uni.showToast({ title: '账号已注销', icon: 'none' })
          setTimeout(() => {
            uni.reLaunch({ url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd' })
          }, 1500)
        }).catch(err => {
          console.error('closeAccount failed:', err)
          uni.showToast({ title: '注销失败，请稍后重试', icon: 'none' })
        })
      }
    }
  })
}
</script>

<style scoped>
.page-mine {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}
.avatar-wrap {
  margin-right: 24rpx;
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background-color: #eee;
}
.user-phone {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.menu-group {
  background-color: #fff;
  margin-bottom: 20rpx;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-text {
  font-size: 28rpx;
  color: #333;
}
.menu-text.danger {
  color: #E91E63;
}
.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}
.version-info {
  text-align: center;
  padding: 40rpx;
  font-size: 24rpx;
  color: #999;
}
.leads-popup {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
}
.leads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.leads-title {
  font-size: 30rpx;
  font-weight: bold;
}
.leads-close {
  font-size: 28rpx;
  color: #999;
}
.leads-list {
  padding: 20rpx 30rpx;
  max-height: 60vh;
}
.empty-leads {
  text-align: center;
  padding: 60rpx;
  color: #999;
}
.lead-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.lead-row {
  display: flex;
  font-size: 26rpx;
  margin-bottom: 8rpx;
}
.lead-label {
  color: #999;
  width: 140rpx;
}
.status-0 { color: #FF9800; }
.status-1 { color: #2196F3; }
.status-2 { color: #4CAF50; }
.status-3 { color: #999; }
</style>
