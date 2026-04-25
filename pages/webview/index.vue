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

// webview 外链白名单：仅允许自有域名的隐私政策/用户协议页面
// 避免被 URL Scheme 注入任意外链（审核风险）
const ALLOWED_HOSTS = [
  'liangren.com',
  'www.liangren.com',
  'privacy.liangren.com',
  'cdn.liangren.com'
]

const externalUrl = ref('')
const contentHtml = ref('')

const titleMap = {
  privacy: '隐私政策',
  agreement: '用户协议'
}

const privacyHtml = `
<div style="padding:30px;font-size:14px;color:#333;line-height:2;">
<h2 style="text-align:center;">隐私政策</h2>
<p>更新日期：2026年04月19日</p>
<p>生效日期：2026年04月19日</p>

<h3>引言</h3>
<p>靓人科普（以下简称"我们"）非常重视用户的隐私保护。本隐私政策适用于"靓人科普"应用程序（以下简称"本应用"）。在使用本应用前，请您仔细阅读并了解本隐私政策。</p>
<p>本应用为"医学美容科普信息"类应用，不提供任何诊疗、处方、手术等医疗服务。涉及医疗建议的内容仅供科普参考，具体请以具备相应资质的医疗机构面诊结果为准。</p>

<h3>一、我们收集的个人信息</h3>
<p>为实现不同业务功能，我们按照最小必要原则收集以下信息：</p>
<ul>
<li><strong>手机号码</strong>：用于注册、登录、身份验证；通过阿里云短信服务发送验证码。</li>
<li><strong>留言咨询信息</strong>：您主动填写的姓名、联系电话、所在城市、感兴趣内容，用于合作医疗机构为您提供后续服务（经您在提交前明确授权同意）。</li>
<li><strong>设备信息</strong>：操作系统名称与版本、设备型号、应用版本号、语言与时区。用于稳定性分析、适配。</li>
<li><strong>网络信息</strong>：网络类型、IP 地址。用于安全风控、频率限制防刷。</li>
<li><strong>使用日志</strong>：浏览记录、收藏、点赞等本地记录，仅存储在您的设备本地，不会上传服务器。</li>
<li><strong>广告归因参数</strong>：在您从合作广告平台（如巨量引擎/抖音）点击广告后安装打开本应用时，我们会从启动参数（URL Scheme / Universal Link）中获取 click_id 等广告归因标识，用于回传激活/留言等转化事件。<strong>本应用不会读取系统剪贴板。</strong></li>
</ul>

<h3>二、我们使用个人信息的方式</h3>
<ul>
<li>向您提供注册登录、留言咨询、内容浏览等核心功能；</li>
<li>改进产品质量、适配不同机型与系统；</li>
<li>防止欺诈、恶意刷单等风险；</li>
<li>向广告投放平台回传转化事件（仅回传脱敏后的 click_id 等归因参数，不包含您的手机号等个人信息）。</li>
</ul>

<h3>三、个人信息的共享、转让、公开披露</h3>
<p>我们不会向第三方共享、转让或公开披露您的个人信息，以下情形除外：</p>
<ul>
<li>事先获得您的明确同意；</li>
<li>在您通过"在线留言"主动提交信息时，我们将在您授权后向对应的合作医疗机构共享您的姓名、手机号、城市、感兴趣内容，以便其为您提供后续服务；</li>
<li>根据法律法规、诉讼仲裁或行政、司法机关要求披露；</li>
<li>为维护您或其他用户、公众的重大合法权益所必需。</li>
</ul>

<h3>四、第三方 SDK 目录</h3>
<p>为实现相应功能，本应用集成了以下第三方 SDK 或服务，具体收集信息、用途与隐私政策如下：</p>
<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px;">
<tr><th>SDK/服务名称</th><th>提供方</th><th>收集信息</th><th>用途</th></tr>
<tr><td>uni-app 运行时</td><td>DCloud</td><td>设备信息、崩溃日志</td><td>应用框架与稳定性</td></tr>
<tr><td>uniCloud 云服务</td><td>DCloud / 阿里云</td><td>请求 IP、调用日志</td><td>提供后端服务与风控</td></tr>
<tr><td>uni-id 用户体系</td><td>DCloud</td><td>手机号、登录日志</td><td>账号注册、登录、注销</td></tr>
<tr><td>阿里云短信服务</td><td>阿里云计算有限公司</td><td>手机号</td><td>发送短信验证码</td></tr>
<tr><td>巨量引擎转化回传 API</td><td>北京巨量引擎网络技术有限公司</td><td>click_id、事件时间、事件类型</td><td>广告效果归因（不包含手机号等个人信息）</td></tr>
</table>

<h3>五、权限使用说明</h3>
<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px;">
<tr><th>权限</th><th>使用场景</th><th>是否可拒绝</th></tr>
<tr><td>网络访问</td><td>请求云端数据、发送验证码</td><td>否（基础能力）</td></tr>
<tr><td>网络状态</td><td>判断网络是否可用、弱网提示</td><td>否（基础能力）</td></tr>
</table>
<p>本应用不申请摄像头、麦克风、位置、通讯录、相册、日历、运动数据等敏感权限，也不会读取系统剪贴板。</p>

<h3>六、个人信息的存储</h3>
<p>您的个人信息存储于中国境内的 uniCloud（阿里云）服务空间中。除非法律法规另有要求，留言咨询信息保留期限为您提交之日起最长不超过 24 个月；账号信息在您注销后按本政策"账号注销"章节处理。</p>

<h3>七、您的权利</h3>
<p>您可以通过以下方式行使个人信息主体权利：</p>
<ul>
<li><strong>查阅、复制、更正</strong>：通过"我的"-"设置"-"个人资料"进行查阅与修改；</li>
<li><strong>删除</strong>：通过"设置"-"清除缓存"删除本地数据；通过"设置"-"注销账号"删除云端账号信息；</li>
<li><strong>撤回同意</strong>：您可通过系统设置关闭相关权限，或通过"注销账号"撤回全部授权；</li>
<li><strong>投诉举报</strong>：如您认为我们的个人信息处理行为存在问题，可通过本政策末尾的联系方式与我们联系；如协商未果，您可向网信、工信、公安等监管机构投诉。</li>
</ul>

<h3>八、账号注销</h3>
<p>您可通过"我的"-"设置"-"注销账号"申请注销账号。注销后，我们将在 15 个工作日内删除或匿名化处理您的账号信息与留言记录，但法律法规要求必须保留的记录除外（如留痕日志可能按法律要求保存不少于 6 个月）。</p>

<h3>九、未成年人保护</h3>
<p>本应用主要面向 18 周岁及以上成年人。我们不会在知情的情况下向未成年人收集任何个人信息。若您是未满 18 周岁的未成年人，请在监护人指导下使用本应用，并由监护人阅读本隐私政策。如发现未经监护人同意而收集的未成年人个人信息，我们将在核实后尽快删除。</p>

<h3>十、本隐私政策的变更</h3>
<p>我们可能会适时修订本隐私政策。变更后的政策将在本应用内公布，并在生效前以显著方式提示您（如启动页提示、弹窗公告）。若您继续使用本应用即视为接受更新后的政策。</p>

<h3>十一、联系我们</h3>
<p>如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：</p>
<p>公司名称：（请填写主体公司全称）</p>
<p>注册地址：（请填写注册地址）</p>
<p>个人信息保护负责人邮箱：privacy@example.com</p>
<p>客服电话：（请填写真实可拨打电话）</p>
</div>`

const agreementHtml = `
<div style="padding:30px;font-size:14px;color:#333;line-height:2;">
<h2 style="text-align:center;">用户服务协议</h2>
<p>更新日期：2026年04月19日</p>
<p>生效日期：2026年04月19日</p>

<h3>一、服务说明</h3>
<p>靓人科普是一款医学美容科普信息类应用，为用户提供医美科普文章、问答、案例信息展示及向合作医疗机构留言咨询等信息服务。本应用<strong>不提供任何诊疗、处方、手术等医疗服务</strong>，本应用所提供的全部内容仅供科普参考，不构成对任何具体个体的诊断或治疗建议。</p>

<h3>二、用户注册与账号</h3>
<p>您需要使用手机号码进行注册并登录本应用。您应确保所提供的信息真实、准确、合法；您应妥善保管账户信息，因账户信息泄露导致的损失由您自行承担。</p>

<h3>三、用户行为规范</h3>
<p>使用本应用时，您不得：</p>
<ul>
<li>发布违反法律法规、侵害他人合法权益的信息；</li>
<li>冒用他人身份或填写虚假资料；</li>
<li>通过任何方式干扰或破坏本应用的正常运行；</li>
<li>未经授权收集、处理其他用户的信息。</li>
</ul>

<h3>四、知识产权</h3>
<p>本应用中由我方提供的内容（包括但不限于文字、图片、音视频、界面设计）之知识产权归本公司或相应权利人所有。未经书面许可，任何人不得复制、转载或以其他方式使用。</p>

<h3>五、医疗免责声明</h3>
<p>本应用内容仅供科普参考，不能替代执业医师的专业诊疗意见。您在做出任何医美决定前，应当咨询具备相应资质的医疗机构与执业医师，并综合评估自身身体状况、适应证、禁忌证、风险与收益。本平台及内容作者对您因参考本平台内容作出的任何决定所产生的后果不承担责任。</p>

<h3>六、留言咨询服务</h3>
<p>当您通过"在线留言"提交信息时，您确认已阅读并同意本协议及《隐私政策》，并授权我们将您主动填写的信息共享给相应的合作医疗机构，以便其向您提供后续服务。合作医疗机构的服务质量、资质、广告合规性由其自行负责，您应在接受任何医美服务前自行核实其资质。</p>

<h3>七、账号注销</h3>
<p>您可随时在"设置-注销账号"中申请注销账号。注销后，您的个人信息将按《隐私政策》的约定处理。法律法规要求必须保留的记录除外。</p>

<h3>八、协议变更</h3>
<p>我们可能会不时修订本协议。变更后的协议将在应用内公布。若您继续使用本应用即视为接受变更后的协议。</p>

<h3>九、适用法律与争议解决</h3>
<p>本协议的签订、履行与解释均适用中华人民共和国法律。因本协议引起的或与本协议有关的任何争议，双方应协商解决；协商不成的，任一方可向我方运营主体所在地有管辖权的人民法院提起诉讼。</p>

<h3>十、联系方式</h3>
<p>邮箱：contact@example.com</p>
<p>客服电话：（请填写真实可拨打电话）</p>
</div>`

function isAllowedExternalUrl(url) {
  try {
    if (!/^https?:\/\//i.test(url)) return false
    const host = new URL(url).hostname
    return ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h))
  } catch (e) {
    return false
  }
}

onLoad((options) => {
  const type = options.type || 'privacy'
  uni.setNavigationBarTitle({ title: titleMap[type] || '协议' })

  if (options.url) {
    if (isAllowedExternalUrl(options.url)) {
      externalUrl.value = options.url
    } else {
      contentHtml.value = type === 'agreement' ? agreementHtml : privacyHtml
      uni.showToast({ title: '链接来源不受信任，已展示本地内容', icon: 'none' })
    }
  } else {
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
