<template>
  <view class="page-webview">
    <web-view v-if="externalUrl" :src="externalUrl" />
    <scroll-view v-else scroll-y class="local-content">
      <rich-text :nodes="contentHtml" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const externalUrl = ref('')
const contentHtml = ref('')

const titleMap = {
  privacy: '隐私政策',
  agreement: '用户协议'
}

const privacyHtml = `
<div style="padding:30px;font-size:14px;color:#333;line-height:2;">
<h2 style="text-align:center;">隐私政策</h2>
<p>更新日期：2025年1月1日</p>
<p>生效日期：2025年1月1日</p>

<h3>引言</h3>
<p>靓人科普（以下简称"我们"）非常重视用户的隐私保护。本隐私政策适用于"靓人科普"应用程序（以下简称"本应用"）。在使用本应用前，请您仔细阅读并了解本隐私政策。</p>

<h3>一、我们收集的信息</h3>
<p>为了向您提供服务，我们可能需要收集以下信息：</p>
<ul>
<li><strong>手机号码：</strong>用于登录验证和联系服务</li>
<li><strong>您主动提供的咨询信息：</strong>姓名、联系方式、所在城市、感兴趣的服务内容</li>
<li><strong>设备信息：</strong>设备型号、操作系统版本、唯一设备标识符</li>
<li><strong>日志信息：</strong>浏览记录、访问时间、IP地址</li>
</ul>

<h3>二、信息的使用</h3>
<p>我们使用收集到的信息用于：</p>
<ul>
<li>提供、维护和改进我们的服务</li>
<li>为您匹配合适的咨询服务（经您授权同意）</li>
<li>向您发送服务相关的通知</li>
<li>防止欺诈和滥用行为</li>
</ul>

<h3>三、信息的共享</h3>
<p>我们不会主动共享您的个人信息，除非：</p>
<ul>
<li>获得您的明确授权同意</li>
<li>在您提交咨询表单时，您授权我们将信息提供给合作医疗机构</li>
<li>法律法规要求的情形</li>
</ul>

<h3>四、信息的存储与保护</h3>
<p>我们采用业界标准的安全措施保护您的信息，包括但不限于数据加密、访问控制和安全审计。您的个人信息存储在中国境内的云服务器上。</p>

<h3>五、您的权利</h3>
<p>您可以随时：</p>
<ul>
<li>查看和修改您的个人信息</li>
<li>删除您的账户和相关数据</li>
<li>撤回您的授权同意</li>
</ul>

<h3>六、未成年人保护</h3>
<p>本应用不面向未满18周岁的未成年人。如果我们发现未经监护人同意收集了未成年人的个人信息，将尽快删除。</p>

<h3>七、联系我们</h3>
<p>如您对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
<p>邮箱：privacy@liangren.com</p>
<p>电话：400-888-0000</p>
</div>`

const agreementHtml = `
<div style="padding:30px;font-size:14px;color:#333;line-height:2;">
<h2 style="text-align:center;">用户服务协议</h2>
<p>更新日期：2025年1月1日</p>
<p>生效日期：2025年1月1日</p>

<h3>一、服务说明</h3>
<p>靓人科普是一款医学美容科普知识平台，为用户提供医美知识文章、咨询服务匹配等功能。本应用所提供的内容仅供参考，不构成医疗建议。</p>

<h3>二、用户注册</h3>
<p>您需要使用手机号码注册并登录本应用。您应确保提供的注册信息真实、准确。您有义务妥善保管账户信息，因账户信息泄露导致的损失由您自行承担。</p>

<h3>三、用户行为规范</h3>
<p>使用本应用时，您不得：</p>
<ul>
<li>发布虚假信息或冒用他人身份</li>
<li>利用本应用进行任何违法活动</li>
<li>干扰或破坏本应用的正常运行</li>
<li>未经授权收集其他用户的信息</li>
</ul>

<h3>四、知识产权</h3>
<p>本应用中的所有内容（包括但不限于文字、图片、音频、视频）的知识产权归我们所有。未经我们书面许可，任何人不得复制、转载或以其他方式使用。</p>

<h3>五、免责声明</h3>
<p>本应用提供的科普内容仅供参考，不能替代专业医疗建议。您在做出任何医美决定前，应当咨询有资质的医疗专业人员。对于因使用本应用内容而导致的任何损失，我们不承担责任。</p>

<h3>六、咨询服务</h3>
<p>当您提交咨询表单时，即表示您同意将填写的信息提供给合作的医疗美容机构，用于为您提供咨询服务。合作机构的服务质量由其自行负责。</p>

<h3>七、账号注销</h3>
<p>您可以随时在应用内申请注销账号。注销后，您的个人信息将被删除，但法律法规要求保留的信息除外。</p>

<h3>八、协议变更</h3>
<p>我们可能会不时修订本协议。变更后的协议将在应用内公布，继续使用本应用即表示您接受变更后的协议。</p>

<h3>九、联系方式</h3>
<p>邮箱：contact@liangren.com</p>
<p>电话：400-888-0000</p>
</div>`

onLoad((options) => {
  if (options.url) {
    // 外部链接
    externalUrl.value = options.url
    uni.setNavigationBarTitle({ title: titleMap[options.type] || '协议' })
  } else {
    // 本地内容
    const type = options.type || 'privacy'
    uni.setNavigationBarTitle({ title: titleMap[type] || '协议' })
    contentHtml.value = type === 'agreement' ? agreementHtml : privacyHtml
  }
})
</script>

<style scoped>
.page-webview {
  min-height: 100vh;
  background-color: #fff;
}
.local-content {
  height: 100vh;
}
</style>
