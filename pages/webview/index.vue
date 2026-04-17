<template>
  <web-view :src="url" />
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')

const urlMap = {
  privacy: 'https://your-domain.com/privacy.html',
  agreement: 'https://your-domain.com/agreement.html'
}

const titleMap = {
  privacy: '隐私政策',
  agreement: '用户协议'
}

onLoad((options) => {
  const type = options.type || 'privacy'
  url.value = urlMap[type] || urlMap.privacy
  uni.setNavigationBarTitle({ title: titleMap[type] || '协议' })
})
</script>
