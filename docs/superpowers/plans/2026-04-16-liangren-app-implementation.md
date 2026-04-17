# 靓人科普 App 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建"靓人科普"医美资讯科普 App，基于 uni-app (Vue3) + uniCloud 阿里云版，实现手机号注册登录、科普文章浏览、线索表单提交、企微通知、巨量引擎转化回传等完整功能。

**Architecture:** uni-app Vue3 组合式 API 前端 + uniCloud 阿里云版 Serverless 后端。用户通过巨量引擎广告进入 App，注册后浏览科普文章，提交咨询表单产生线索，线索同时推送企微群和回传巨量引擎。多客户共用同一 App，通过广告链接参数 client_id 区分归属。

**Tech Stack:** uni-app (Vue3 Composition API), uniCloud (阿里云版), uni-id-pages, MongoDB (uniCloud 云数据库), 企业微信 Webhook, 巨量引擎转化 API

---

## 文件结构

### 前端页面

| 文件 | 职责 |
|------|------|
| `pages/index/index.vue` | 首页 - 科普文章列表、分类标签、悬浮咨询按钮 |
| `pages/article/detail.vue` | 文章详情页 - 富文本内容展示 |
| `pages/form/index.vue` | 线索表单页 - 姓名/电话/城市/兴趣/授权 |
| `pages/result/index.vue` | 提交成功页 |
| `pages/mine/index.vue` | 我的页面 - 个人信息、咨询记录、注销、协议 |

### 组件

| 文件 | 职责 |
|------|------|
| `components/privacy-popup.vue` | 隐私政策首次弹窗 |

### 工具模块

| 文件 | 职责 |
|------|------|
| `utils/click-id.js` | click_id 多渠道获取（URL Scheme / Universal Link / 剪切板） |
| `utils/city-data.js` | 城市白名单数据 |

### 云函数

| 文件 | 职责 |
|------|------|
| `uniCloud-aliyun/cloudfunctions/submit-lead/index.js` | 线索提交 + 防刷校验 |
| `uniCloud-aliyun/cloudfunctions/notify-wechat/index.js` | 企微群机器人通知 |
| `uniCloud-aliyun/cloudfunctions/report-conversion/index.js` | 巨量引擎转化回传 |
| `uniCloud-aliyun/cloudfunctions/retry-conversion/index.js` | 定时补偿回传（每小时） |
| `uniCloud-aliyun/cloudfunctions/check-update/index.js` | App 版本检查 |
| `uniCloud-aliyun/cloudfunctions/clean-expired/index.js` | 定时清理过期数据 |

### 数据库 Schema

| 文件 | 职责 |
|------|------|
| `uniCloud-aliyun/database/leads.schema.json` | 线索表 Schema |
| `uniCloud-aliyun/database/clients.schema.json` | 客户表 Schema |
| `uniCloud-aliyun/database/articles.schema.json` | 文章表 Schema |
| `uniCloud-aliyun/database/conversion-logs.schema.json` | 转化回传日志 Schema |
| `uniCloud-aliyun/database/sms-logs.schema.json` | 短信记录 Schema |
| `uniCloud-aliyun/database/app-version.schema.json` | 版本管理 Schema |

### 配置文件

| 文件 | 职责 |
|------|------|
| `pages.json` | 页面路由 + TabBar 配置 |
| `manifest.json` | App 配置（uni-app 项目配置） |
| `App.vue` | 启动参数解析 + 隐私弹窗 + click_id 获取 |
| `main.js` | Vue 应用入口 |
| `uni.scss` | 全局样式变量 |

---

## Task 1: 项目初始化

**Files:**
- Create: `pages.json`
- Create: `manifest.json`
- Create: `main.js`
- Create: `App.vue`
- Create: `uni.scss`

- [ ] **Step 1: 使用 HBuilderX 或 CLI 创建 uni-app Vue3 项目**

```bash
# 如果使用 CLI（需已安装 @dcloudio/uni-cli）
npx degit dcloudio/uni-preset-vue#vite-ts liangren-app
cd liangren-app
npm install
```

> 注意：推荐使用 HBuilderX 创建项目（菜单 → 文件 → 新建 → 项目 → uni-app → Vue3），因为 HBuilderX 会自动配置 uniCloud 和各类插件。如果用 CLI 创建，后续需手动配置 uniCloud。

- [ ] **Step 2: 配置 pages.json 页面路由和 TabBar**

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^uni-(.*)": "@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue"
    }
  },
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "靓人科普",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/mine/index",
      "style": {
        "navigationBarTitleText": "我的"
      }
    },
    {
      "path": "pages/article/detail",
      "style": {
        "navigationBarTitleText": "文章详情"
      }
    },
    {
      "path": "pages/form/index",
      "style": {
        "navigationBarTitleText": "预约咨询"
      }
    },
    {
      "path": "pages/result/index",
      "style": {
        "navigationBarTitleText": "提交成功"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "靓人科普",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#E91E63",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tab/home.png",
        "selectedIconPath": "static/tab/home-active.png"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的",
        "iconPath": "static/tab/mine.png",
        "selectedIconPath": "static/tab/mine-active.png"
      }
    ]
  }
}
```

- [ ] **Step 3: 配置 uni.scss 全局样式变量**

```scss
/* 品牌色 */
$brand-color: #E91E63;
$brand-color-light: #FCE4EC;
$brand-color-dark: #C2185B;

/* 文字色 */
$text-primary: #333333;
$text-secondary: #666666;
$text-placeholder: #999999;

/* 背景色 */
$bg-color: #F5F5F5;
$bg-white: #FFFFFF;

/* 间距 */
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
$spacing-lg: 32rpx;

/* 圆角 */
$radius-sm: 8rpx;
$radius-md: 12rpx;
$radius-lg: 16rpx;

/* 字号 */
$font-sm: 24rpx;
$font-md: 28rpx;
$font-lg: 32rpx;
$font-xl: 36rpx;
```

- [ ] **Step 4: 配置 main.js 入口文件**

```js
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
```

- [ ] **Step 5: 编写 App.vue 基础骨架**

```vue
<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch((options) => {
  console.log('App Launch', options)
})

onShow((options) => {
  console.log('App Show', options)
})
</script>

<style>
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: #333333;
}
</style>
```

- [ ] **Step 6: 关联 uniCloud 阿里云服务空间**

在 HBuilderX 中：右键项目 → 创建 uniCloud 云开发环境 → 选择阿里云 → 关联已有服务空间或新建。

确保项目根目录下出现 `uniCloud-aliyun/` 目录结构：
```
uniCloud-aliyun/
├── cloudfunctions/
└── database/
```

- [ ] **Step 7: 安装 uni-id-pages 插件**

在 HBuilderX 插件市场搜索 `uni-id-pages`，点击"使用 HBuilderX 导入插件"。

导入后确认 `uni_modules/uni-id-pages/` 存在。

在 uniCloud 控制台 → 配置中心设置 `uni-id` 配置（短信模板 ID、token 有效期等）。

- [ ] **Step 8: 提交初始化代码**

```bash
git init
git add -A
git commit -m "feat: init uni-app vue3 project with uniCloud aliyun"
```

---

## Task 2: 数据库 Schema — leads 线索表

**Files:**
- Create: `uniCloud-aliyun/database/leads.schema.json`

- [ ] **Step 1: 创建 leads.schema.json**

```json
{
  "bsonType": "object",
  "required": ["user_id", "name", "phone", "city", "interest", "client_id", "consent_time"],
  "permission": {
    "read": "doc._id == auth.uid || 'READ_LEADS' in auth.permission",
    "create": "auth.uid != null",
    "update": "'UPDATE_LEADS' in auth.permission",
    "delete": "'DELETE_LEADS' in auth.permission"
  },
  "properties": {
    "_id": { "description": "线索ID" },
    "user_id": {
      "bsonType": "string",
      "description": "关联用户ID",
      "foreignKey": "uni-id-users._id"
    },
    "user_mobile": {
      "bsonType": "string",
      "description": "用户注册手机号（冗余）"
    },
    "name": {
      "bsonType": "string",
      "description": "姓名",
      "minLength": 2,
      "maxLength": 20,
      "trim": "both"
    },
    "phone": {
      "bsonType": "string",
      "description": "联系电话",
      "pattern": "^1[3-9]\\d{9}$"
    },
    "city": {
      "bsonType": "string",
      "description": "城市"
    },
    "interest": {
      "bsonType": "array",
      "description": "感兴趣内容",
      "items": {
        "bsonType": "string",
        "enum": ["double_eyelid", "skin_care"]
      }
    },
    "click_id": {
      "bsonType": "string",
      "description": "巨量引擎 click_id"
    },
    "client_id": {
      "bsonType": "string",
      "description": "客户标识"
    },
    "client_name": {
      "bsonType": "string",
      "description": "客户名称（冗余）"
    },
    "status": {
      "bsonType": "int",
      "description": "状态：0待跟进 1已联系 2已转化 3无效",
      "defaultValue": 0,
      "enum": [0, 1, 2, 3]
    },
    "source": {
      "bsonType": "string",
      "description": "来源",
      "defaultValue": "oceanengine"
    },
    "submit_ip": {
      "bsonType": "string",
      "description": "提交请求IP"
    },
    "consent_time": {
      "bsonType": "timestamp",
      "description": "授权同意时间"
    },
    "consent_version": {
      "bsonType": "string",
      "description": "授权协议版本",
      "defaultValue": "v1.0"
    },
    "follow_note": {
      "bsonType": "string",
      "description": "跟进备注",
      "defaultValue": ""
    },
    "create_time": {
      "bsonType": "timestamp",
      "description": "创建时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    },
    "update_time": {
      "bsonType": "timestamp",
      "description": "更新时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    }
  }
}
```

- [ ] **Step 2: 在 uniCloud 控制台创建索引**

在 uniCloud Web 控制台 → 云数据库 → leads 集合 → 索引管理中创建：

| 索引名 | 字段 | 说明 |
|--------|------|------|
| `idx_client_status_time` | `{ client_id: 1, status: 1, create_time: -1 }` | 客户+状态+时间复合索引 |
| `idx_status_createtime` | `{ status: 1, create_time: -1 }` | 全局线索查询 |
| `idx_phone` | `{ phone: 1 }` | 防重复提交 |
| `idx_click_id` | `{ click_id: 1 }`（稀疏） | 转化回传查询 |

- [ ] **Step 3: 提交**

```bash
git add uniCloud-aliyun/database/leads.schema.json
git commit -m "feat: add leads collection schema"
```

---

## Task 3: 数据库 Schema — clients 客户表

**Files:**
- Create: `uniCloud-aliyun/database/clients.schema.json`

- [ ] **Step 1: 创建 clients.schema.json**

```json
{
  "bsonType": "object",
  "required": ["client_id", "client_name"],
  "permission": {
    "read": false,
    "create": false,
    "update": false,
    "delete": false
  },
  "properties": {
    "_id": { "description": "自动生成" },
    "client_id": {
      "bsonType": "string",
      "description": "客户唯一标识"
    },
    "client_name": {
      "bsonType": "string",
      "description": "客户名称"
    },
    "contact_person": {
      "bsonType": "string",
      "description": "联系人"
    },
    "contact_phone": {
      "bsonType": "string",
      "description": "联系电话"
    },
    "webhook_url": {
      "bsonType": "string",
      "description": "企微群机器人 Webhook URL（加密存储）"
    },
    "status": {
      "bsonType": "int",
      "description": "状态：1启用 0停用",
      "defaultValue": 1,
      "enum": [0, 1]
    },
    "create_time": {
      "bsonType": "timestamp",
      "description": "创建时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    }
  }
}
```

- [ ] **Step 2: 在 uniCloud 控制台创建索引**

| 索引名 | 字段 | 说明 |
|--------|------|------|
| `idx_client_id` | `{ client_id: 1 }`（唯一） | 客户标识查找 |
| `idx_status` | `{ status: 1 }` | 筛选启用/停用 |

- [ ] **Step 3: 提交**

```bash
git add uniCloud-aliyun/database/clients.schema.json
git commit -m "feat: add clients collection schema"
```

---

## Task 4: 数据库 Schema — articles 文章表

**Files:**
- Create: `uniCloud-aliyun/database/articles.schema.json`

- [ ] **Step 1: 创建 articles.schema.json**

```json
{
  "bsonType": "object",
  "required": ["title", "content", "category"],
  "permission": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "properties": {
    "_id": { "description": "自动生成" },
    "title": {
      "bsonType": "string",
      "description": "文章标题",
      "trim": "both"
    },
    "summary": {
      "bsonType": "string",
      "description": "文章摘要"
    },
    "content": {
      "bsonType": "string",
      "description": "文章正文（富文本）"
    },
    "category": {
      "bsonType": "string",
      "description": "分类",
      "enum": ["double_eyelid", "skin_care"]
    },
    "cover_image": {
      "bsonType": "string",
      "description": "封面图 URL"
    },
    "sort_order": {
      "bsonType": "int",
      "description": "排序权重",
      "defaultValue": 0
    },
    "status": {
      "bsonType": "int",
      "description": "状态：1上架 0下架",
      "defaultValue": 1,
      "enum": [0, 1]
    },
    "create_time": {
      "bsonType": "timestamp",
      "description": "创建时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    }
  }
}
```

- [ ] **Step 2: 在 uniCloud 控制台创建索引**

| 索引名 | 字段 | 说明 |
|--------|------|------|
| `idx_category_sort` | `{ category: 1, sort_order: 1 }` | 按分类排序展示 |
| `idx_status` | `{ status: 1 }` | 筛选上/下架 |

- [ ] **Step 3: 提交**

```bash
git add uniCloud-aliyun/database/articles.schema.json
git commit -m "feat: add articles collection schema"
```

---

## Task 5: 数据库 Schema — conversion-logs, sms-logs, app-version

**Files:**
- Create: `uniCloud-aliyun/database/conversion-logs.schema.json`
- Create: `uniCloud-aliyun/database/sms-logs.schema.json`
- Create: `uniCloud-aliyun/database/app-version.schema.json`

- [ ] **Step 1: 创建 conversion-logs.schema.json**

```json
{
  "bsonType": "object",
  "required": ["click_id", "event_type"],
  "permission": {
    "read": false,
    "create": false,
    "update": false,
    "delete": false
  },
  "properties": {
    "_id": { "description": "自动生成" },
    "user_id": {
      "bsonType": "string",
      "description": "关联用户ID"
    },
    "click_id": {
      "bsonType": "string",
      "description": "巨量引擎 click_id"
    },
    "event_type": {
      "bsonType": "string",
      "description": "事件类型",
      "enum": ["register", "form_submit"]
    },
    "request_body": {
      "bsonType": "object",
      "description": "请求体"
    },
    "response_code": {
      "bsonType": "int",
      "description": "响应状态码"
    },
    "response_body": {
      "bsonType": "object",
      "description": "响应体"
    },
    "success": {
      "bsonType": "bool",
      "description": "是否成功",
      "defaultValue": false
    },
    "retry_count": {
      "bsonType": "int",
      "description": "重试次数",
      "defaultValue": 0
    },
    "next_retry_time": {
      "bsonType": "timestamp",
      "description": "下次重试时间"
    },
    "create_time": {
      "bsonType": "timestamp",
      "description": "创建时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    }
  }
}
```

索引：

| 索引名 | 字段 | 说明 |
|--------|------|------|
| `idx_clickid_event` | `{ click_id: 1, event_type: 1 }` | 防重复回传 |
| `idx_success_time` | `{ success: 1, create_time: -1 }` | 筛选失败记录 |
| `idx_next_retry` | `{ next_retry_time: 1 }`（稀疏） | 定时补偿查询 |

- [ ] **Step 2: 创建 sms-logs.schema.json**

```json
{
  "bsonType": "object",
  "required": ["phone", "code"],
  "permission": {
    "read": false,
    "create": false,
    "update": false,
    "delete": false
  },
  "properties": {
    "_id": { "description": "自动生成" },
    "phone": {
      "bsonType": "string",
      "description": "手机号"
    },
    "code": {
      "bsonType": "string",
      "description": "验证码"
    },
    "ip": {
      "bsonType": "string",
      "description": "发送请求IP"
    },
    "used": {
      "bsonType": "bool",
      "description": "是否已使用",
      "defaultValue": false
    },
    "verify_count": {
      "bsonType": "int",
      "description": "验证尝试次数",
      "defaultValue": 0
    },
    "create_time": {
      "bsonType": "timestamp",
      "description": "创建时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    },
    "expire_time": {
      "bsonType": "timestamp",
      "description": "过期时间"
    }
  }
}
```

索引：

| 索引名 | 字段 | 说明 |
|--------|------|------|
| `idx_phone_time` | `{ phone: 1, create_time: -1 }` | 频率限制 |
| `idx_ip_time` | `{ ip: 1, create_time: -1 }` | IP 防刷 |
| `idx_expire` | `{ expire_time: 1 }`（TTL 索引） | 自动清理过期验证码 |

- [ ] **Step 3: 创建 app-version.schema.json**

```json
{
  "bsonType": "object",
  "required": ["platform", "version", "version_code"],
  "permission": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "properties": {
    "_id": { "description": "自动生成" },
    "platform": {
      "bsonType": "string",
      "description": "平台",
      "enum": ["android", "ios", "harmony"]
    },
    "version": {
      "bsonType": "string",
      "description": "版本号（如 1.0.1）"
    },
    "version_code": {
      "bsonType": "int",
      "description": "版本数字（如 101）"
    },
    "update_type": {
      "bsonType": "string",
      "description": "更新类型",
      "enum": ["force", "optional"]
    },
    "download_url": {
      "bsonType": "string",
      "description": "wgt 包下载地址"
    },
    "release_note": {
      "bsonType": "string",
      "description": "更新说明"
    },
    "status": {
      "bsonType": "int",
      "description": "状态：1启用 0停用",
      "defaultValue": 1,
      "enum": [0, 1]
    },
    "create_time": {
      "bsonType": "timestamp",
      "description": "创建时间",
      "forceDefaultValue": {
        "$env": "now"
      }
    }
  }
}
```

- [ ] **Step 4: 上传全部 Schema 到 uniCloud**

在 HBuilderX 中：右键 `database` 目录 → 上传所有 DB Schema。

- [ ] **Step 5: 提交**

```bash
git add uniCloud-aliyun/database/
git commit -m "feat: add conversion-logs, sms-logs, app-version schemas"
```

---

## Task 6: 隐私政策弹窗组件

**Files:**
- Create: `components/privacy-popup.vue`

- [ ] **Step 1: 创建 privacy-popup.vue**

```vue
<template>
  <uni-popup ref="popupRef" type="center" :is-mask-click="false">
    <view class="privacy-popup">
      <view class="privacy-title">隐私保护提示</view>
      <view class="privacy-content">
        <text>
          欢迎使用靓人科普！我们非常重视您的隐私保护。在使用我们的服务前，请您仔细阅读
        </text>
        <text class="privacy-link" @click="openPrivacy">《隐私政策》</text>
        <text>和</text>
        <text class="privacy-link" @click="openAgreement">《用户协议》</text>
        <text>
          。如您同意，请点击"同意并继续"开始使用我们的服务。
        </text>
      </view>
      <view class="privacy-buttons">
        <button class="btn-disagree" @click="handleDisagree">不同意</button>
        <button class="btn-agree" @click="handleAgree">同意并继续</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['agree', 'disagree'])
const popupRef = ref(null)

function open() {
  popupRef.value?.open()
}

function close() {
  popupRef.value?.close()
}

function handleAgree() {
  uni.setStorageSync('privacy_agreed', true)
  uni.setStorageSync('privacy_agreed_time', Date.now())
  close()
  emit('agree')
}

function handleDisagree() {
  emit('disagree')
}

function openPrivacy() {
  uni.navigateTo({ url: '/pages/webview/index?type=privacy' })
}

function openAgreement() {
  uni.navigateTo({ url: '/pages/webview/index?type=agreement' })
}

defineExpose({ open, close })
</script>

<style scoped>
.privacy-popup {
  width: 580rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}
.privacy-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  color: #333;
}
.privacy-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 40rpx;
}
.privacy-link {
  color: #E91E63;
}
.privacy-buttons {
  display: flex;
  gap: 20rpx;
}
.btn-disagree {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
  background-color: #f5f5f5;
  color: #999;
}
.btn-agree {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
  background-color: #E91E63;
  color: #fff;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add components/privacy-popup.vue
git commit -m "feat: add privacy policy popup component"
```

---

## Task 7: App.vue 完整启动逻辑（隐私弹窗 + click_id 获取）

**Files:**
- Modify: `App.vue`
- Create: `utils/click-id.js`

- [ ] **Step 1: 创建 click_id 获取工具 utils/click-id.js**

```js
/**
 * click_id 多渠道获取工具
 * 优先级：URL Scheme/Intent 参数 > Universal Link > 剪切板
 */

const CLIPBOARD_PATTERN = /^##LIANGREN_(.+?)_(.+?)##$/

/**
 * 从启动参数中解析 click_id 和 client_id
 * @param {Object} launchOptions - uni-app 启动参数
 * @returns {{ clickId: string|null, clientId: string|null, source: string|null }}
 */
export function parseFromLaunchOptions(launchOptions) {
  const query = launchOptions?.query || {}

  if (query.click_id && query.client_id) {
    return {
      clickId: query.click_id,
      clientId: query.client_id,
      source: 'url_scheme'
    }
  }

  // #ifdef APP-PLUS
  const args = plus.runtime.arguments
  if (args) {
    try {
      const url = new URL(args)
      const clickId = url.searchParams.get('click_id')
      const clientId = url.searchParams.get('client_id')
      if (clickId && clientId) {
        return { clickId, clientId, source: 'url_scheme' }
      }
    } catch (e) {
      // args 不是有效 URL，尝试直接解析
      const match = args.match(/click_id=([^&]+)/)
      const clientMatch = args.match(/client_id=([^&]+)/)
      if (match && clientMatch) {
        return {
          clickId: match[1],
          clientId: clientMatch[1],
          source: 'url_scheme'
        }
      }
    }
  }
  // #endif

  return { clickId: null, clientId: null, source: null }
}

/**
 * 从剪切板获取 click_id（兜底方案）
 * 格式：##LIANGREN_clickId_clientId##
 * @returns {Promise<{ clickId: string|null, clientId: string|null, source: string|null }>}
 */
export function parseFromClipboard() {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    uni.getClipboardData({
      success(res) {
        const content = (res.data || '').trim()
        const match = content.match(CLIPBOARD_PATTERN)
        if (match) {
          // 读取后立即清除剪切板
          uni.setClipboardData({ data: '', showToast: false })
          resolve({
            clickId: match[1],
            clientId: match[2],
            source: 'clipboard'
          })
        } else {
          resolve({ clickId: null, clientId: null, source: null })
        }
      },
      fail() {
        resolve({ clickId: null, clientId: null, source: null })
      }
    })
    // #endif

    // #ifndef APP-PLUS
    resolve({ clickId: null, clientId: null, source: null })
    // #endif
  })
}

/**
 * 保存 click_id 到本地缓存
 */
export function saveClickId({ clickId, clientId, source }) {
  if (!clickId) return
  uni.setStorageSync('click_id', clickId)
  uni.setStorageSync('client_id', clientId)
  uni.setStorageSync('click_id_source', source)
  uni.setStorageSync('click_time', Date.now())
}

/**
 * 获取本地缓存的 click_id
 */
export function getLocalClickId() {
  return {
    clickId: uni.getStorageSync('click_id') || null,
    clientId: uni.getStorageSync('client_id') || null,
    source: uni.getStorageSync('click_id_source') || null,
    clickTime: uni.getStorageSync('click_time') || null
  }
}

/**
 * 同步 click_id 到云端用户记录
 */
export async function syncClickIdToCloud({ clickId, clientId, source }) {
  if (!clickId) return
  const uniIdCo = uniCloud.importObject('uni-id-co')
  try {
    const db = uniCloud.database()
    const uid = uniCloud.getCurrentUserInfo().uid
    if (!uid) return
    await db.collection('uni-id-users').doc(uid).update({
      click_id: clickId,
      client_id: clientId,
      click_id_source: source,
      last_click_time: Date.now()
    })
  } catch (e) {
    console.error('syncClickIdToCloud failed:', e)
  }
}
```

- [ ] **Step 2: 更新 App.vue 完整启动逻辑**

```vue
<script setup>
import { ref } from 'vue'
import { onLaunch, onShow } from '@dcloudio/uni-app'
import {
  parseFromLaunchOptions,
  parseFromClipboard,
  saveClickId,
  syncClickIdToCloud
} from './utils/click-id.js'

const privacyPopupRef = ref(null)

onLaunch(async (options) => {
  console.log('App Launch', options)

  // 1. 检查隐私政策是否已同意
  const privacyAgreed = uni.getStorageSync('privacy_agreed')
  if (!privacyAgreed) {
    // 等待页面加载后显示弹窗（在首页中触发）
    uni.setStorageSync('need_privacy_popup', true)
    return
  }

  // 2. 获取 click_id（隐私同意后才执行）
  await handleClickId(options)

  // 3. 检查 App 更新
  checkAppUpdate()
})

onShow((options) => {
  console.log('App Show', options)
})

async function handleClickId(options) {
  // 优先从启动参数获取
  let result = parseFromLaunchOptions(options)

  // 兜底：从剪切板获取
  if (!result.clickId) {
    result = await parseFromClipboard()
  }

  // 保存到本地
  if (result.clickId) {
    saveClickId(result)
    // 异步同步到云端（不阻塞主流程）
    syncClickIdToCloud(result)
  }
}

function checkAppUpdate() {
  // #ifdef APP-PLUS
  const systemInfo = uni.getSystemInfoSync()
  uniCloud.callFunction({
    name: 'check-update',
    data: {
      platform: systemInfo.osName,
      version_code: parseInt(systemInfo.appVersionCode || '0')
    }
  }).then(res => {
    const data = res.result
    if (!data || !data.needUpdate) return

    if (data.updateType === 'force') {
      uni.showModal({
        title: '版本更新',
        content: data.releaseNote || '发现新版本，请立即更新',
        showCancel: false,
        confirmText: '立即更新',
        success() {
          downloadAndInstall(data.downloadUrl)
        }
      })
    } else {
      uni.showModal({
        title: '版本更新',
        content: data.releaseNote || '发现新版本，是否更新？',
        confirmText: '更新',
        cancelText: '跳过',
        success(modalRes) {
          if (modalRes.confirm) {
            downloadAndInstall(data.downloadUrl)
          }
        }
      })
    }
  }).catch(err => {
    console.error('check-update failed:', err)
  })
  // #endif
}

function downloadAndInstall(url) {
  // #ifdef APP-PLUS
  uni.showLoading({ title: '下载中...' })
  uni.downloadFile({
    url,
    success(res) {
      uni.hideLoading()
      if (res.statusCode === 200) {
        plus.runtime.install(res.tempFilePath, { force: true }, () => {
          plus.runtime.restart()
        }, (err) => {
          uni.showToast({ title: '安装失败', icon: 'none' })
          console.error('install failed:', err)
        })
      }
    },
    fail() {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
  // #endif
}
</script>

<style>
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: #333333;
}
</style>
```

- [ ] **Step 3: 提交**

```bash
git add utils/click-id.js App.vue
git commit -m "feat: add click_id parser and App.vue startup logic"
```

---

## Task 8: 登录页面（uni-id-pages 集成 + 自定义样式）

**Files:**
- Modify: `pages.json`（添加 uni-id-pages 路由，已在 Task 1 完成基本配置）
- Modify: `uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue`（自定义样式）

> uni-id-pages 提供了开箱即用的手机号+验证码登录页面。我们主要做样式自定义和登录成功后的回传逻辑。

- [ ] **Step 1: 配置 uni-id-pages**

确保 `pages.json` 的 `uniIdRouter` 配置正确（uni-id-pages 插件导入后会自动添加）：

```json
{
  "uniIdRouter": {
    "loginPage": "uni_modules/uni-id-pages/pages/login/login-withoutpwd",
    "needLogin": [
      "pages/form/index",
      "pages/mine/index"
    ],
    "rpiority": 99
  }
}
```

将上述配置合并到 `pages.json` 的顶层。

- [ ] **Step 2: 配置 uni-id config**

在 `uniCloud-aliyun/cloudfunctions/common/uni-config-center/uni-id/config.json` 中配置：

```json
{
  "passwordSecret": [
    {
      "type": "hmac-sha256",
      "version": 1
    }
  ],
  "tokenSecret": "自行生成一个随机字符串",
  "tokenExpiresIn": 7200,
  "tokenExpiresThreshold": 3600,
  "passwordErrorLimit": 6,
  "passwordErrorRetryTime": 3600,
  "app": {
    "tokenExpiresIn": 2592000,
    "smsCode": {
      "templateId": "你的短信模板ID",
      "codeExpiresIn": 300
    }
  },
  "service": {
    "sms": {
      "name": "DCloud",
      "smsKey": "你的smsKey",
      "smsSecret": "你的smsSecret"
    }
  }
}
```

> 注意：短信模板需在 uniCloud 控制台 → 短信中提前申请。

- [ ] **Step 3: 自定义登录页 Logo 和样式**

修改 `uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue`，在合适位置替换 Logo：

找到模板中的 Logo 部分，替换为自定义 Logo 和标语：

```vue
<!-- 在 logo 区域替换 -->
<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
<text class="app-name">靓人科普</text>
<text class="slogan">发现更美的自己</text>
```

在 `<style>` 中追加自定义样式（不覆盖原有样式，用追加方式）：

```css
.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-top: 20rpx;
}
.slogan {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}
```

- [ ] **Step 4: 添加注册成功后的转化回传 hook**

在登录成功后需要触发巨量引擎"注册"事件回传。修改 `uni_modules/uni-id-pages/common/login-page.mixin.js`（或在登录成功回调中添加）：

在登录/注册成功回调中追加：

```js
// 登录成功后的回传逻辑
async function onLoginSuccess(e) {
  // 如果是新注册用户，触发转化回传
  if (e.isNewUser) {
    const clickId = uni.getStorageSync('click_id')
    const clientId = uni.getStorageSync('client_id')
    if (clickId) {
      uniCloud.callFunction({
        name: 'report-conversion',
        data: {
          event_type: 'register',
          click_id: clickId,
          client_id: clientId
        }
      }).catch(err => {
        console.error('report register conversion failed:', err)
      })
    }
  }
}
```

> 具体 hook 位置取决于 uni-id-pages 版本，查看 `login-withoutpwd.vue` 中的 `loginSuccess` 事件或 `uniIdPageInit` 回调。

- [ ] **Step 5: 准备 Logo 图片**

将 App Logo 放置到 `static/logo.png`（建议尺寸 200x200px）。

准备 TabBar 图标放置到 `static/tab/` 目录：
- `home.png` / `home-active.png`（81x81px）
- `mine.png` / `mine-active.png`（81x81px）

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: integrate uni-id-pages with custom login style and conversion hook"
```

---

## Task 9: 首页 — 科普文章列表

**Files:**
- Create: `pages/index/index.vue`

- [ ] **Step 1: 创建首页 pages/index/index.vue**

```vue
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

function onPrivacyAgree() {
  // 隐私同意后，执行 click_id 获取等初始化逻辑
  console.log('Privacy agreed, init app features')
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
```

- [ ] **Step 2: 提交**

```bash
git add pages/index/index.vue
git commit -m "feat: add homepage with article list and category tabs"
```

---

## Task 10: 文章详情页

**Files:**
- Create: `pages/article/detail.vue`

- [ ] **Step 1: 创建 pages/article/detail.vue**

```vue
<template>
  <view class="page-detail">
    <view v-if="article" class="article-content">
      <text class="article-title">{{ article.title }}</text>
      <view class="article-meta">
        <text class="meta-category">{{ categoryLabel }}</text>
        <text class="meta-time">{{ formatTime(article.create_time) }}</text>
      </view>
      <rich-text class="article-body" :nodes="article.content" />
    </view>

    <view v-else-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部咨询按钮 -->
    <view class="bottom-bar">
      <button class="consult-btn" @click="goForm">免费咨询</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const db = uniCloud.database()

const article = ref(null)
const loading = ref(true)

const categoryMap = {
  double_eyelid: '双眼皮',
  skin_care: '皮肤管理'
}

const categoryLabel = computed(() => {
  return categoryMap[article.value?.category] || '科普'
})

onLoad((options) => {
  if (options.id) {
    loadArticle(options.id)
  }
})

async function loadArticle(id) {
  loading.value = true
  try {
    const res = await db.collection('articles').doc(id).get()
    if (res.result.data && res.result.data.length > 0) {
      article.value = res.result.data[0]
      uni.setNavigationBarTitle({ title: article.value.title })
    }
  } catch (e) {
    console.error('loadArticle failed:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goForm() {
  uni.navigateTo({ url: '/pages/form/index' })
}
</script>

<style scoped>
.page-detail {
  padding-bottom: 130rpx;
}
.article-content {
  background-color: #fff;
  padding: 30rpx;
}
.article-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
}
.article-meta {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 30rpx;
  gap: 20rpx;
}
.meta-category {
  font-size: 22rpx;
  color: #E91E63;
  background-color: #FCE4EC;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
}
.meta-time {
  font-size: 24rpx;
  color: #999;
}
.article-body {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
}
.loading {
  text-align: center;
  padding: 60rpx;
  color: #999;
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.consult-btn {
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/article/detail.vue
git commit -m "feat: add article detail page with rich-text rendering"
```

---

## Task 11: 城市数据和线索表单页

**Files:**
- Create: `utils/city-data.js`
- Create: `pages/form/index.vue`

- [ ] **Step 1: 创建 utils/city-data.js 城市白名单**

```js
export const cityList = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', '重庆',
  '武汉', '西安', '苏州', '南京', '天津', '郑州', '长沙',
  '东莞', '佛山', '宁波', '青岛', '沈阳', '昆明', '大连',
  '厦门', '福州', '无锡', '合肥', '济南', '温州', '哈尔滨',
  '南宁', '长春', '泉州', '石家庄', '贵阳', '南昌', '金华',
  '常州', '惠州', '嘉兴', '徐州', '太原', '珠海', '中山',
  '其他'
]

export const interestOptions = [
  { label: '双眼皮', value: 'double_eyelid' },
  { label: '皮肤管理', value: 'skin_care' }
]

/**
 * 校验城市是否在白名单内
 */
export function isValidCity(city) {
  return cityList.includes(city)
}
```

- [ ] **Step 2: 创建 pages/form/index.vue 线索表单页**

```vue
<template>
  <view class="page-form">
    <view class="form-card">
      <!-- 姓名 -->
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input
          v-model="formData.name"
          class="form-input"
          placeholder="请输入您的姓名"
          maxlength="20"
        />
      </view>

      <!-- 联系方式 -->
      <view class="form-item">
        <text class="form-label">联系方式</text>
        <input
          v-model="formData.phone"
          class="form-input"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>

      <!-- 城市 -->
      <view class="form-item">
        <text class="form-label">所在城市</text>
        <picker :range="cityList" @change="onCityChange">
          <view class="form-picker">
            <text :class="formData.city ? '' : 'placeholder'">
              {{ formData.city || '请选择城市' }}
            </text>
          </view>
        </picker>
      </view>

      <!-- 感兴趣内容 -->
      <view class="form-item">
        <text class="form-label">感兴趣的内容</text>
        <view class="interest-tags">
          <view
            v-for="item in interestOptions"
            :key="item.value"
            :class="['tag', formData.interest.includes(item.value) && 'active']"
            @click="toggleInterest(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 授权勾选 -->
    <view class="consent-row" @click="formData.consent = !formData.consent">
      <view :class="['checkbox', formData.consent && 'checked']" />
      <text class="consent-text">
        我同意将信息分享给合作机构用于咨询服务
      </text>
    </view>

    <!-- 提交按钮 -->
    <button
      class="submit-btn"
      :disabled="submitting"
      @click="handleSubmit"
    >
      {{ submitting ? '提交中...' : '提交咨询' }}
    </button>

    <text class="tip-text">提交后我们将在 24 小时内联系您</text>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { cityList, interestOptions, isValidCity } from '@/utils/city-data.js'

const formData = reactive({
  name: '',
  phone: '',
  city: '',
  interest: [],
  consent: false
})

const submitting = ref(false)

function onCityChange(e) {
  formData.city = cityList[e.detail.value]
}

function toggleInterest(value) {
  const idx = formData.interest.indexOf(value)
  if (idx > -1) {
    formData.interest.splice(idx, 1)
  } else {
    formData.interest.push(value)
  }
}

function validate() {
  if (!formData.name || formData.name.length < 2) {
    uni.showToast({ title: '请输入姓名（至少2个字符）', icon: 'none' })
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }
  if (!formData.city || !isValidCity(formData.city)) {
    uni.showToast({ title: '请选择城市', icon: 'none' })
    return false
  }
  if (formData.interest.length === 0) {
    uni.showToast({ title: '请至少选择一项感兴趣的内容', icon: 'none' })
    return false
  }
  if (!formData.consent) {
    uni.showToast({ title: '请勾选授权同意', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return
  if (submitting.value) return

  submitting.value = true
  try {
    const res = await uniCloud.callFunction({
      name: 'submit-lead',
      data: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        interest: formData.interest,
        click_id: uni.getStorageSync('click_id') || '',
        client_id: uni.getStorageSync('client_id') || '',
        consent_time: Date.now()
      }
    })

    if (res.result.code === 0) {
      uni.redirectTo({ url: '/pages/result/index' })
    } else {
      uni.showToast({ title: res.result.msg || '提交失败', icon: 'none' })
    }
  } catch (e) {
    console.error('submit-lead failed:', e)
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-form {
  padding: 30rpx;
}
.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 10rpx 30rpx;
}
.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.form-item:last-child {
  border-bottom: none;
}
.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;
}
.form-input {
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
}
.form-picker {
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
}
.placeholder {
  color: #999;
}
.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 10rpx;
}
.tag {
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
}
.tag.active {
  color: #E91E63;
  background-color: #FCE4EC;
  border: 1rpx solid #E91E63;
}
.consent-row {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  padding: 0 10rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.checkbox.checked {
  background-color: #E91E63;
  border-color: #E91E63;
}
.consent-text {
  font-size: 24rpx;
  color: #666;
}
.submit-btn {
  margin-top: 40rpx;
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.submit-btn[disabled] {
  opacity: 0.6;
}
.tip-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>
```

- [ ] **Step 3: 提交**

```bash
git add utils/city-data.js pages/form/index.vue
git commit -m "feat: add lead form page with city picker and interest tags"
```

---

## Task 12: 提交成功页

**Files:**
- Create: `pages/result/index.vue`

- [ ] **Step 1: 创建 pages/result/index.vue**

```vue
<template>
  <view class="page-result">
    <view class="result-card">
      <view class="icon-success">✓</view>
      <text class="result-title">提交成功</text>
      <text class="result-desc">感谢您的咨询，我们将在 24 小时内联系您</text>
    </view>
    <button class="back-btn" @click="goHome">返回首页</button>
  </view>
</template>

<script setup>
function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}
.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon-success {
  width: 120rpx;
  height: 120rpx;
  line-height: 120rpx;
  text-align: center;
  font-size: 60rpx;
  color: #fff;
  background-color: #4CAF50;
  border-radius: 60rpx;
}
.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 40rpx;
}
.result-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 16rpx;
}
.back-btn {
  margin-top: 80rpx;
  width: 400rpx;
  background-color: #E91E63;
  color: #fff;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add pages/result/index.vue
git commit -m "feat: add submission success page"
```

---

## Task 13: submit-lead 云函数（线索提交 + 防刷）

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/submit-lead/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/submit-lead/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "submit-lead",
  "dependencies": {}
}
```

- [ ] **Step 2: 创建 submit-lead/index.js**

```js
'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const leadsCollection = db.collection('leads')
const clientsCollection = db.collection('clients')

exports.main = async (event, context) => {
  // 1. Token 校验（必须登录态）
  const { uid, mobile } = context.CLIENTINFO || {}
  // uni-id token 校验
  const payload = await uniCloud.getCloudbaseContext?.(context) || {}
  const userId = uid || payload.uid
  if (!userId) {
    return { code: 401, msg: '请先登录' }
  }

  const { name, phone, city, interest, click_id, client_id, consent_time } = event

  // 2. 参数校验（不信任前端）
  if (!name || name.length < 2 || name.length > 20) {
    return { code: 400, msg: '姓名需 2-20 个字符' }
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { code: 400, msg: '手机号格式不正确' }
  }
  if (!city) {
    return { code: 400, msg: '请选择城市' }
  }
  if (!Array.isArray(interest) || interest.length === 0) {
    return { code: 400, msg: '请至少选择一项感兴趣的内容' }
  }
  const validInterest = ['double_eyelid', 'skin_care']
  if (!interest.every(i => validInterest.includes(i))) {
    return { code: 400, msg: '感兴趣内容参数无效' }
  }
  if (!consent_time) {
    return { code: 400, msg: '请同意授权' }
  }

  // 3. 频率限制
  const clientIP = context.CLIENTIP || ''
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const oneHourAgo = now - 60 * 60 * 1000

  // 3a. 同一 user_id 24 小时内最多 3 次
  const userCount = await leadsCollection
    .where({ user_id: userId, create_time: dbCmd.gte(oneDayAgo) })
    .count()
  if (userCount.result.total >= 3) {
    return { code: 429, msg: '提交过于频繁，请明天再试' }
  }

  // 3b. 同一 phone 全局最多 5 条有效线索
  const phoneCount = await leadsCollection
    .where({ phone, status: dbCmd.neq(3) })
    .count()
  if (phoneCount.result.total >= 5) {
    return { code: 429, msg: '该手机号已达提交上限' }
  }

  // 3c. 同一 IP 1 小时内最多 10 次
  if (clientIP) {
    const ipCount = await leadsCollection
      .where({ submit_ip: clientIP, create_time: dbCmd.gte(oneHourAgo) })
      .count()
    if (ipCount.result.total >= 10) {
      return { code: 429, msg: '操作过于频繁，请稍后再试' }
    }
  }

  // 4. 查询客户信息（冗余存储客户名称）
  let clientName = ''
  if (client_id) {
    const clientRes = await clientsCollection
      .where({ client_id, status: 1 })
      .limit(1)
      .get()
    if (clientRes.result.data.length > 0) {
      clientName = clientRes.result.data[0].client_name
    }
  }

  // 5. 写入 leads 表
  const leadData = {
    user_id: userId,
    user_mobile: mobile || '',
    name: name.trim(),
    phone: phone.trim(),
    city,
    interest,
    click_id: click_id || '',
    client_id: client_id || '',
    client_name: clientName,
    status: 0,
    source: 'oceanengine',
    submit_ip: clientIP,
    consent_time,
    consent_version: 'v1.0',
    follow_note: '',
    create_time: now,
    update_time: now
  }

  const addRes = await leadsCollection.add(leadData)

  // 6. 异步触发企微通知（不阻塞主流程）
  uniCloud.callFunction({
    name: 'notify-wechat',
    data: {
      lead_id: addRes.result.id,
      ...leadData
    }
  }).catch(err => {
    console.error('notify-wechat failed:', err)
  })

  // 7. 异步触发巨量引擎回传（不阻塞主流程）
  if (click_id) {
    uniCloud.callFunction({
      name: 'report-conversion',
      data: {
        event_type: 'form_submit',
        click_id,
        client_id: client_id || '',
        user_id: userId
      }
    }).catch(err => {
      console.error('report-conversion failed:', err)
    })
  }

  return { code: 0, msg: '提交成功' }
}
```

- [ ] **Step 3: 上传云函数**

在 HBuilderX 中：右键 `submit-lead` 目录 → 上传部署。

- [ ] **Step 4: 提交**

```bash
git add uniCloud-aliyun/cloudfunctions/submit-lead/
git commit -m "feat: add submit-lead cloud function with rate limiting"
```

---

## Task 14: notify-wechat 云函数（企微群通知）

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/notify-wechat/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/notify-wechat/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "notify-wechat",
  "dependencies": {}
}
```

- [ ] **Step 2: 创建 notify-wechat/index.js**

```js
'use strict'

const db = uniCloud.database()
const clientsCollection = db.collection('clients')

// 内部总群 Webhook（从环境变量读取）
const INTERNAL_WEBHOOK = process.env.INTERNAL_WEBHOOK_URL || ''

exports.main = async (event) => {
  const {
    lead_id, name, phone, city, interest, client_id, client_name, create_time
  } = event

  const interestMap = {
    double_eyelid: '双眼皮',
    skin_care: '皮肤管理'
  }
  const interestText = (interest || []).map(i => interestMap[i] || i).join('、')
  const timeStr = formatTime(create_time || Date.now())
  const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''

  // 1. 推送到客户企微群（手机号脱敏）
  if (client_id) {
    const clientRes = await clientsCollection
      .where({ client_id, status: 1 })
      .limit(1)
      .get()

    if (clientRes.result.data.length > 0) {
      const client = clientRes.result.data[0]
      if (client.webhook_url) {
        const clientMsg = {
          msgtype: 'markdown',
          markdown: {
            content: [
              `**新线索 — ${client_name || client.client_name}**`,
              `> 姓名：${name}`,
              `> 电话：${maskedPhone}`,
              `> 城市：${city}`,
              `> 感兴趣：${interestText}`,
              `> 时间：${timeStr}`
            ].join('\n')
          }
        }
        await sendWebhook(client.webhook_url, clientMsg)
      }
    }
  }

  // 2. 推送到内部总群（完整手机号）
  if (INTERNAL_WEBHOOK) {
    const internalMsg = {
      msgtype: 'markdown',
      markdown: {
        content: [
          `**新线索 — ${client_name || '未知客户'}**`,
          `> 线索ID：${lead_id}`,
          `> 姓名：${name}`,
          `> 电话：${phone}`,
          `> 城市：${city}`,
          `> 感兴趣：${interestText}`,
          `> 客户：${client_name || client_id || '未归属'}`,
          `> 时间：${timeStr}`
        ].join('\n')
      }
    }
    await sendWebhook(INTERNAL_WEBHOOK, internalMsg)
  }

  return { code: 0, msg: 'ok' }
}

async function sendWebhook(url, data) {
  try {
    const res = await uniCloud.httpclient.request(url, {
      method: 'POST',
      data,
      contentType: 'json',
      dataType: 'json',
      timeout: 5000
    })
    if (res.data?.errcode !== 0) {
      console.error('webhook failed:', res.data)
      // 重试 1 次
      await new Promise(r => setTimeout(r, 5000))
      await uniCloud.httpclient.request(url, {
        method: 'POST',
        data,
        contentType: 'json',
        dataType: 'json',
        timeout: 5000
      })
    }
  } catch (e) {
    console.error('sendWebhook error:', e)
  }
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
```

- [ ] **Step 3: 上传云函数并配置环境变量**

在 HBuilderX 中：右键 `notify-wechat` → 上传部署。

在 uniCloud 控制台 → 云函数 → notify-wechat → 环境变量中添加：
- `INTERNAL_WEBHOOK_URL`: 内部总群的企微机器人 Webhook 地址

- [ ] **Step 4: 提交**

```bash
git add uniCloud-aliyun/cloudfunctions/notify-wechat/
git commit -m "feat: add notify-wechat cloud function for WeCom notification"
```

---

## Task 15: report-conversion 云函数（巨量引擎转化回传）

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/report-conversion/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/report-conversion/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "report-conversion",
  "dependencies": {}
}
```

- [ ] **Step 2: 创建 report-conversion/index.js**

```js
'use strict'

const db = uniCloud.database()
const logsCollection = db.collection('conversion-logs')

// 巨量引擎转化 API 配置（从环境变量读取）
const OE_API_URL = 'https://analytics.oceanengine.com/api/v2/conversion'
const OE_ACCESS_TOKEN = process.env.OE_ACCESS_TOKEN || ''

// 重试间隔（毫秒）：1min → 5min → 30min
const RETRY_INTERVALS = [60000, 300000, 1800000]

exports.main = async (event) => {
  const { event_type, click_id, client_id, user_id } = event

  if (!click_id || !event_type) {
    return { code: 400, msg: 'missing click_id or event_type' }
  }

  // 1. 防重复回传
  const existLog = await logsCollection
    .where({ click_id, event_type, success: true })
    .limit(1)
    .get()

  if (existLog.result.data.length > 0) {
    return { code: 0, msg: 'already reported' }
  }

  // 2. 构造请求
  const eventTypeMap = {
    register: 0,       // 注册
    form_submit: 6     // 表单提交（具体值需与巨量引擎后台配置的转化目标对应）
  }

  const requestBody = {
    event_type: eventTypeMap[event_type] || 0,
    context: {
      ad: {
        callback: click_id
      }
    },
    timestamp: Math.floor(Date.now() / 1000)
  }

  // 3. 调用巨量引擎转化 API
  let success = false
  let responseCode = 0
  let responseBody = {}

  try {
    const res = await uniCloud.httpclient.request(OE_API_URL, {
      method: 'POST',
      data: requestBody,
      contentType: 'json',
      dataType: 'json',
      timeout: 10000,
      headers: {
        'Access-Token': OE_ACCESS_TOKEN
      }
    })
    responseCode = res.status
    responseBody = res.data || {}
    success = responseCode === 200 && responseBody.code === 0
  } catch (e) {
    console.error('report-conversion request failed:', e)
    responseBody = { error: e.message }
  }

  // 4. 记录日志
  const now = Date.now()
  const logData = {
    user_id: user_id || '',
    click_id,
    event_type,
    request_body: requestBody,
    response_code: responseCode,
    response_body: responseBody,
    success,
    retry_count: 0,
    next_retry_time: success ? null : now + RETRY_INTERVALS[0],
    create_time: now
  }

  await logsCollection.add(logData)

  return { code: success ? 0 : -1, msg: success ? 'ok' : 'report failed, will retry' }
}
```

- [ ] **Step 3: 上传并配置环境变量**

在 uniCloud 控制台 → 云函数 → report-conversion → 环境变量：
- `OE_ACCESS_TOKEN`: 巨量引擎 API access_token

> 注意：实际的 event_type 数值映射需要和巨量引擎后台配置的转化目标对应，开发时先用上述默认值，上线前根据实际配置调整。

- [ ] **Step 4: 提交**

```bash
git add uniCloud-aliyun/cloudfunctions/report-conversion/
git commit -m "feat: add report-conversion cloud function for OceanEngine"
```

---

## Task 16: retry-conversion 定时补偿回传

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/retry-conversion/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/retry-conversion/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "retry-conversion",
  "dependencies": {}
}
```

- [ ] **Step 2: 创建 retry-conversion/index.js**

```js
'use strict'

const db = uniCloud.database()
const dbCmd = db.command
const logsCollection = db.collection('conversion-logs')

const OE_API_URL = 'https://analytics.oceanengine.com/api/v2/conversion'
const OE_ACCESS_TOKEN = process.env.OE_ACCESS_TOKEN || ''

// 重试间隔（毫秒）：1min → 5min → 30min
const RETRY_INTERVALS = [60000, 300000, 1800000]
// 最大重试次数
const MAX_RETRY = 3
// 巨量引擎回传时效：7 天
const REPORT_TTL = 7 * 24 * 60 * 60 * 1000

// 内部总群 Webhook（回传失败告警用）
const INTERNAL_WEBHOOK = process.env.INTERNAL_WEBHOOK_URL || ''

exports.main = async () => {
  const now = Date.now()
  const sevenDaysAgo = now - REPORT_TTL

  // 查询待重试记录
  const res = await logsCollection
    .where({
      success: false,
      retry_count: dbCmd.lt(MAX_RETRY),
      next_retry_time: dbCmd.lte(now),
      create_time: dbCmd.gte(sevenDaysAgo)
    })
    .limit(50) // 每次最多处理 50 条
    .get()

  const records = res.result.data || []
  console.log(`retry-conversion: found ${records.length} records to retry`)

  let successCount = 0
  let failCount = 0

  for (const record of records) {
    try {
      const requestBody = record.request_body || {
        event_type: record.event_type === 'register' ? 0 : 6,
        context: { ad: { callback: record.click_id } },
        timestamp: Math.floor(Date.now() / 1000)
      }

      const apiRes = await uniCloud.httpclient.request(OE_API_URL, {
        method: 'POST',
        data: requestBody,
        contentType: 'json',
        dataType: 'json',
        timeout: 10000,
        headers: { 'Access-Token': OE_ACCESS_TOKEN }
      })

      const success = apiRes.status === 200 && apiRes.data?.code === 0
      const newRetryCount = record.retry_count + 1

      const updateData = {
        success,
        retry_count: newRetryCount,
        response_code: apiRes.status,
        response_body: apiRes.data || {}
      }

      if (!success && newRetryCount < MAX_RETRY) {
        updateData.next_retry_time = now + RETRY_INTERVALS[newRetryCount]
      } else {
        updateData.next_retry_time = null
      }

      await logsCollection.doc(record._id).update(updateData)

      if (success) {
        successCount++
      } else {
        failCount++
        // 达到最大重试次数，通知运营
        if (newRetryCount >= MAX_RETRY && INTERNAL_WEBHOOK) {
          await notifyFailure(record)
        }
      }
    } catch (e) {
      console.error(`retry failed for ${record._id}:`, e)
      failCount++
    }
  }

  return {
    total: records.length,
    success: successCount,
    fail: failCount
  }
}

async function notifyFailure(record) {
  const msg = {
    msgtype: 'markdown',
    markdown: {
      content: [
        '**⚠️ 转化回传失败告警**',
        `> click_id: ${record.click_id}`,
        `> event_type: ${record.event_type}`,
        `> 重试次数: ${record.retry_count + 1}/${MAX_RETRY}`,
        `> 最后响应: ${JSON.stringify(record.response_body || {}).slice(0, 200)}`,
        `> 请在 uniCloud 控制台检查并手动处理`
      ].join('\n')
    }
  }
  try {
    await uniCloud.httpclient.request(INTERNAL_WEBHOOK, {
      method: 'POST',
      data: msg,
      contentType: 'json',
      timeout: 5000
    })
  } catch (e) {
    console.error('notifyFailure webhook failed:', e)
  }
}
```

- [ ] **Step 3: 配置定时触发器**

在 uniCloud 控制台 → 云函数 → retry-conversion → 定时触发器：

```json
[
  {
    "name": "hourly-retry",
    "type": "timer",
    "config": "0 0 * * * * *"
  }
]
```

（每小时执行一次）

- [ ] **Step 4: 提交**

```bash
git add uniCloud-aliyun/cloudfunctions/retry-conversion/
git commit -m "feat: add retry-conversion cloud function for scheduled retry"
```

---

## Task 17: 我的页面

**Files:**
- Create: `pages/mine/index.vue`

- [ ] **Step 1: 创建 pages/mine/index.vue**

```vue
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
    // 从 uni-id-users 获取手机号
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
```

- [ ] **Step 2: 提交**

```bash
git add pages/mine/index.vue
git commit -m "feat: add mine page with leads history and account management"
```

---

## Task 18: check-update 云函数（版本检查）

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/check-update/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/check-update/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "check-update",
  "dependencies": {}
}
```

- [ ] **Step 2: 创建 check-update/index.js**

```js
'use strict'

const db = uniCloud.database()

exports.main = async (event) => {
  const { platform, version_code } = event

  if (!platform || !version_code) {
    return { needUpdate: false }
  }

  // 查询该平台最新的启用版本
  const res = await db.collection('app-version')
    .where({
      platform,
      status: 1
    })
    .orderBy('version_code', 'desc')
    .limit(1)
    .get()

  if (res.result.data.length === 0) {
    return { needUpdate: false }
  }

  const latest = res.result.data[0]

  if (latest.version_code > version_code) {
    return {
      needUpdate: true,
      version: latest.version,
      versionCode: latest.version_code,
      updateType: latest.update_type,
      downloadUrl: latest.download_url,
      releaseNote: latest.release_note
    }
  }

  return { needUpdate: false }
}
```

- [ ] **Step 3: 上传云函数**

在 HBuilderX 中：右键 `check-update` → 上传部署。

- [ ] **Step 4: 提交**

```bash
git add uniCloud-aliyun/cloudfunctions/check-update/
git commit -m "feat: add check-update cloud function"
```

---

## Task 19: clean-expired 定时清理云函数

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/clean-expired/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/clean-expired/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "clean-expired",
  "dependencies": {}
}
```

- [ ] **Step 2: 创建 clean-expired/index.js**

```js
'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async () => {
  const now = Date.now()

  // 1. 清理 180 天前的 conversion-logs（匹配巨量引擎回溯期）
  const conversionTTL = 180 * 24 * 60 * 60 * 1000
  const conversionRes = await db.collection('conversion-logs')
    .where({
      create_time: dbCmd.lt(now - conversionTTL)
    })
    .limit(500) // 分批删除，避免超时
    .remove()

  console.log(`cleaned conversion-logs: ${conversionRes.result.deleted} records`)

  // 2. 清理 30 天前的 sms-logs（验证码日志无需长期保存）
  const smsTTL = 30 * 24 * 60 * 60 * 1000
  const smsRes = await db.collection('sms-logs')
    .where({
      create_time: dbCmd.lt(now - smsTTL)
    })
    .limit(500)
    .remove()

  console.log(`cleaned sms-logs: ${smsRes.result.deleted} records`)

  return {
    conversionCleaned: conversionRes.result.deleted,
    smsCleaned: smsRes.result.deleted
  }
}
```

- [ ] **Step 3: 配置定时触发器**

在 uniCloud 控制台 → 云函数 → clean-expired → 定时触发器：

```json
[
  {
    "name": "daily-clean",
    "type": "timer",
    "config": "0 0 3 * * * *"
  }
]
```

（每天凌晨 3 点执行）

- [ ] **Step 4: 提交**

```bash
git add uniCloud-aliyun/cloudfunctions/clean-expired/
git commit -m "feat: add clean-expired cloud function for data cleanup"
```

---

## Task 20: Webview 页面（协议展示）

**Files:**
- Create: `pages/webview/index.vue`
- Modify: `pages.json`（添加 webview 页面路由）

- [ ] **Step 1: 在 pages.json 中添加 webview 页面**

在 `pages` 数组中追加：

```json
{
  "path": "pages/webview/index",
  "style": {
    "navigationBarTitleText": ""
  }
}
```

- [ ] **Step 2: 创建 pages/webview/index.vue**

```vue
<template>
  <web-view :src="url" />
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')

// 协议页面 URL 配置（上线前替换为实际部署地址）
const urlMap = {
  privacy: 'https://你的域名/privacy.html',
  agreement: 'https://你的域名/agreement.html'
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
```

- [ ] **Step 3: 提交**

```bash
git add pages/webview/index.vue pages.json
git commit -m "feat: add webview page for privacy policy and user agreement"
```

---

## Task 21: 种子数据和联调测试

- [ ] **Step 1: 在 uniCloud 控制台插入测试文章数据**

在云数据库 → articles 集合中手动添加数据：

```json
{
  "title": "双眼皮手术全攻略：类型、恢复期、注意事项",
  "summary": "想做双眼皮但不知道该选哪种？本文详细介绍埋线、全切、韩式三点的区别和恢复周期。",
  "content": "<p>双眼皮手术是目前最常见的眼部美容手术之一...</p><h3>一、双眼皮手术的类型</h3><p><strong>1. 埋线法</strong></p><p>适合眼皮薄、无明显松弛的年轻人。手术时间短，恢复快，但可能随时间松脱。</p><p><strong>2. 全切法</strong></p><p>适合眼皮较厚或有松弛的情况。效果持久，但恢复期较长。</p><p><strong>3. 韩式三点</strong></p><p>介于埋线和全切之间，通过三个小切口完成。恢复期适中。</p><h3>二、恢复期注意事项</h3><p>术后 1-3 天冰敷消肿，7 天拆线，1-3 个月基本定型。期间避免用力揉眼、化妆、佩戴隐形眼镜。</p>",
  "category": "double_eyelid",
  "cover_image": "",
  "sort_order": 1,
  "status": 1,
  "create_time": 1744800000000
}
```

```json
{
  "title": "皮肤管理入门：了解你的肤质，选对护理方案",
  "summary": "油皮、干皮、混合皮、敏感肌...不同肤质的科学护理方法全解析。",
  "content": "<p>皮肤管理的第一步是了解自己的肤质...</p><h3>一、如何判断自己的肤质</h3><p><strong>油性皮肤</strong>：T 区明显出油，毛孔粗大。</p><p><strong>干性皮肤</strong>：皮肤紧绷，容易起皮。</p><p><strong>混合性皮肤</strong>：T 区油，两颊干。</p><p><strong>敏感肌</strong>：容易发红、刺痛。</p><h3>二、基础护理步骤</h3><p>清洁 → 爽肤水 → 精华 → 乳液/面霜 → 防晒（白天）。</p>",
  "category": "skin_care",
  "cover_image": "",
  "sort_order": 1,
  "status": 1,
  "create_time": 1744800000000
}
```

- [ ] **Step 2: 插入测试客户数据**

在云数据库 → clients 集合：

```json
{
  "client_id": "test_client",
  "client_name": "测试客户",
  "contact_person": "测试联系人",
  "contact_phone": "13800000000",
  "webhook_url": "",
  "status": 1,
  "create_time": 1744800000000
}
```

- [ ] **Step 3: 在 HBuilderX 中运行到模拟器/真机测试**

测试清单：
1. 首次启动弹出隐私弹窗 → 点同意后正常进入
2. 未登录访问表单页 → 自动跳转登录
3. 手机号注册/登录正常
4. 首页文章列表正常加载，分类切换正常
5. 文章详情页富文本渲染正常
6. 表单填写 + 校验 + 提交成功
7. 提交成功页展示 → 返回首页
8. 我的页面手机号脱敏显示、咨询记录可查看
9. 退出登录、注销账号功能正常

- [ ] **Step 4: 提交所有调整**

```bash
git add -A
git commit -m "feat: add seed data and final adjustments for integration testing"
```

---

## Task 22: 滑动验证码组件（人机验证）

> 设计文档 5.2 要求表单提交前做人机验证（滑动验证码），对接阿里云验证码服务。

**Files:**
- Create: `components/captcha.vue`
- Modify: `pages/form/index.vue`

- [ ] **Step 1: 创建 components/captcha.vue**

阿里云验证码服务通过内嵌 WebView 加载验证码页面（uniCloud 阿里云版原生支持）。这里封装一个通用组件：

```vue
<template>
  <uni-popup ref="popupRef" type="center" :is-mask-click="false">
    <view class="captcha-container">
      <view class="captcha-header">
        <text class="captcha-title">安全验证</text>
        <text class="captcha-close" @click="close">✕</text>
      </view>
      <view class="captcha-body">
        <!-- 简易滑动验证实现（生产环境替换为阿里云验证码 SDK） -->
        <view class="slider-track" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <view class="slider-bg" :style="{ width: sliderLeft + 'rpx' }" />
          <view class="slider-thumb" :style="{ left: sliderLeft + 'rpx' }">
            <text class="thumb-icon">→</text>
          </view>
          <text v-if="sliderLeft === 0" class="slider-hint">滑动验证</text>
        </view>
        <text v-if="verified" class="verify-success">验证通过</text>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['success', 'fail'])
const popupRef = ref(null)
const sliderLeft = ref(0)
const verified = ref(false)
const startX = ref(0)
const trackWidth = 480 // rpx

function open() {
  verified.value = false
  sliderLeft.value = 0
  popupRef.value?.open()
}

function close() {
  popupRef.value?.close()
}

function onTouchStart(e) {
  if (verified.value) return
  startX.value = e.touches[0].clientX
}

function onTouchMove(e) {
  if (verified.value) return
  const diff = (e.touches[0].clientX - startX.value) * 2 // 粗略 px→rpx
  sliderLeft.value = Math.max(0, Math.min(trackWidth - 80, diff))
}

function onTouchEnd() {
  if (verified.value) return
  if (sliderLeft.value >= trackWidth - 120) {
    verified.value = true
    sliderLeft.value = trackWidth - 80
    setTimeout(() => {
      close()
      emit('success')
    }, 500)
  } else {
    sliderLeft.value = 0
    emit('fail')
  }
}

defineExpose({ open, close })
</script>

<style scoped>
.captcha-container {
  width: 580rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.captcha-title {
  font-size: 30rpx;
  font-weight: bold;
}
.captcha-close {
  font-size: 32rpx;
  color: #999;
}
.captcha-body {
  padding: 40rpx 30rpx;
}
.slider-track {
  position: relative;
  height: 80rpx;
  background-color: #f0f0f0;
  border-radius: 40rpx;
  overflow: hidden;
}
.slider-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #E8F5E9;
  border-radius: 40rpx;
}
.slider-thumb {
  position: absolute;
  top: 0;
  width: 80rpx;
  height: 80rpx;
  background-color: #fff;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-icon {
  font-size: 32rpx;
  color: #E91E63;
}
.slider-hint {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 80rpx;
  font-size: 26rpx;
  color: #999;
}
.verify-success {
  text-align: center;
  color: #4CAF50;
  font-size: 26rpx;
  margin-top: 16rpx;
}
</style>
```

> **生产环境替换说明：** 上线前应替换为阿里云验证码 SDK 或接入 uniCloud 的 uni-captcha 插件，这里先用简易滑动验证做功能联调。

- [ ] **Step 2: 在 pages/form/index.vue 中集成验证码**

在模板中添加验证码组件（在 `</view>` 闭合标签前）：

```vue
<!-- 在 submit-btn 之后添加 -->
<captcha ref="captchaRef" @success="onCaptchaSuccess" />
```

在 `<script setup>` 中：

```js
import Captcha from '@/components/captcha.vue'

const captchaRef = ref(null)

// 修改 handleSubmit：先弹出验证码，验证通过后再真正提交
async function handleSubmit() {
  if (!validate()) return
  if (submitting.value) return
  // 弹出验证码
  captchaRef.value?.open()
}

async function onCaptchaSuccess() {
  submitting.value = true
  try {
    const res = await uniCloud.callFunction({
      name: 'submit-lead',
      data: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        interest: formData.interest,
        click_id: uni.getStorageSync('click_id') || '',
        client_id: uni.getStorageSync('client_id') || '',
        consent_time: Date.now()
      }
    })
    if (res.result.code === 0) {
      uni.redirectTo({ url: '/pages/result/index' })
    } else {
      uni.showToast({ title: res.result.msg || '提交失败', icon: 'none' })
    }
  } catch (e) {
    console.error('submit-lead failed:', e)
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add components/captcha.vue pages/form/index.vue
git commit -m "feat: add captcha component and integrate into lead form"
```

---


