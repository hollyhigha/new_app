# 靓人科普 App 设计文档

> 医美资讯科普平台，用于巨量引擎 App 投放获取线索

## 一、项目概述

### 1.1 背景

公司是医美代运营公司，帮助多家医美机构在抖音巨量引擎进行广告投放。巨量引擎最新政策要求通过 App 投放获取精准线索。本 App 作为投放载体，通过"注册获取手机号 + 表单收集线索"的方式为客户获客。

### 1.2 App 定位

**医美资讯/科普平台**，展示通用医美知识内容（双眼皮、皮肤管理等），不展示具体医美机构案例，不使用机构名称或品牌。规避医疗类资质审查风险。

### 1.3 核心信息

| 项目 | 内容 |
|------|------|
| App 名称 | **靓人科普**（避免包含"医美"关键词，降低商店审核触发风险） |
| 技术栈 | uni-app (Vue3) + uniCloud 阿里云版 |
| 目标平台 | Android / iOS / 鸿蒙（鸿蒙优先级低于 Android 和 iOS） |
| 开发者 | 单人开发 |
| 服务模式 | 同一个 App 服务多家医美客户，通过广告链接参数区分客户归属 |

---

## 二、整体架构

```
┌──────────────────────────────────────────────────┐
│                   用户端 App                       │
│             uni-app (Vue3 + 组合式 API)            │
│  ┌────────┬────────┬──────────┬────────┬───────┐ │
│  │注册/登录│  首页   │ 文章详情  │ 线索表单│  我的  │ │
│  └───┬────┴───┬────┴────┬─────┴───┬────┴───┬───┘ │
└──────┼────────┼─────────┼─────────┼────────┼─────┘
       │        │         │         │        │
┌──────┴────────┴─────────┴─────────┴────────┴─────┐
│               uniCloud（阿里云版）                  │
│  ┌─────────────────────────────────────────────┐ │
│  │              云函数 (Cloud Functions)         │ │
│  │  · uni-id-co（注册/登录，uni-id 内置）        │ │
│  │  · submit-lead（提交线索 + 防刷 + 人机验证）  │ │
│  │  · notify-wechat（企微通知，异步调用）         │ │
│  │  · report-conversion（巨量引擎回传 + 重试）   │ │
│  │  · retry-conversion（定时补偿回传）           │ │
│  │  · clean-expired（定时清理过期数据）           │ │
│  │  · check-update（App 版本检查）               │ │
│  └──────────────────┬──────────────────────────┘ │
│  ┌──────────────────┴──────────────────────────┐ │
│  │             云数据库 (MongoDB)                │ │
│  │  · uni-id-users（用户表）                     │ │
│  │  · leads（线索表）                            │ │
│  │  · clients（客户表）                          │ │
│  │  · articles（文章表）                         │ │
│  │  · conversion-logs（转化回传日志）             │ │
│  │  · sms-logs（短信记录）                       │ │
│  │  · app-version（版本管理）                    │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
       │                          │
       ▼                          ▼
┌──────────────┐         ┌──────────────────┐
│  企业微信机器人 │         │  巨量引擎转化API  │
│  (Webhook)    │         │  (S2S 回传)      │
└──────────────┘         └──────────────────┘
```

### 关键技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| 前端框架 | Vue3 + 组合式 API | uni-app 最新推荐，生态完善 |
| 云服务 | uniCloud 阿里云版 | 免费额度大（40万GBs/月），够用 |
| 用户体系 | uni-id + uni-id-pages | 手机号注册/登录开箱即用 |
| 后台管理 | uni-admin | 快速搭建线索和客户管理页 |
| 短信 | uniCloud 内置短信 | 无需额外接入第三方 |
| 通知 | 企业微信群机器人 Webhook | 实时推送线索，按客户分发 |
| 广告追踪 | 监测链接 + S2S API 回传 | 不集成 SDK，App 端更轻量 |
| 热更新 | uni-app wgt 热更新 | 免审核更新前端内容和功能 |

---

## 三、页面结构与用户流程

### 3.1 页面清单

共 6 个页面（含"我的"页面和文章详情页）：

| 页面 | 路径 | 说明 |
|------|------|------|
| 注册/登录 | `pages/login/login` | uni-id-pages 预置，手机号+短信验证码 |
| 首页 | `pages/index/index` | 科普文章列表，分类标签，底部"免费咨询"按钮 |
| 文章详情 | `pages/article/detail` | 科普文章内容展示 |
| 线索表单 | `pages/form/index` | 姓名+联系方式+城市+感兴趣内容+授权勾选 |
| 提交成功 | `pages/result/index` | 成功提示+返回首页 |
| 我的 | `pages/mine/index` | 个人信息、咨询记录、注销账号、协议入口 |

### 3.2 导航结构

底部 TabBar 两个入口：
- **首页**（科普文章列表）
- **我的**（个人中心）

### 3.3 用户核心流程

```
用户点击巨量引擎广告
    │
    ▼
App 启动，解析 click_id + client_id
存入本地缓存 + 同步到云端用户记录
    │
    ▼
首次启动弹出《隐私政策》弹窗
    ├── 同意 → 继续
    └── 不同意 → 退出 App
    │
    ▼
注册/登录页（手机号 + 短信验证码）
    │ 勾选同意《用户协议》和《隐私政策》
    │
    ▼ 注册成功 → 云函数回传"注册"事件给巨量引擎
    │
    ▼
首页（浏览科普文章）
    │
    ├── 点击文章 → 文章详情页
    ├── 点击"免费咨询" → 线索表单页
    └── 点击"我的" → 个人中心
    │
    ▼
线索表单页
    │ 填写：姓名、联系方式、城市、感兴趣内容
    │ 勾选：□ 我同意将信息分享给合作机构用于咨询服务
    │
    ▼ 提交
    │
    ├──▶ 线索入库（leads 表）
    ├──▶ 企微通知（推送到对应客户群 + 内部总群）
    ├──▶ 巨量引擎回传"表单提交"事件
    │
    ▼
提交成功页
    └── 返回首页
```

### 3.4 页面原型

#### 注册/登录页
- 顶部：App Logo + 名称"靓人科普" + slogan"发现更美的自己"
- 中部：手机号输入框（+86）+ 验证码输入框 + 获取验证码按钮
- 底部：注册/登录按钮 + 协议勾选"我已阅读并同意《用户协议》和《隐私政策》"

#### 首页
- 顶部：App 名称
- Banner：品牌宣传图
- 分类标签：双眼皮 | 皮肤管理（后续可扩展）
- 文章列表：卡片式布局，左图右文（标题+摘要）
- 底部悬浮按钮："免费咨询"→ 跳转表单页

#### 线索表单页
- 返回按钮 + 标题"预约咨询"
- 表单字段：姓名、联系方式、城市（选择器）、感兴趣的内容（标签多选）
- 授权勾选框："我同意将信息分享给合作机构用于咨询服务"
- 提交按钮
- 底部说明："提交后我们将在 24 小时内联系您"

#### 我的页面
- 头像 + 手机号（脱敏显示）
- 我的咨询记录（已提交线索的状态）
- 注销账号 / 删除个人数据
- 用户协议 / 隐私政策 / 意见反馈
- 当前版本号

---

## 四、数据库设计

### 4.1 集合总览

| 集合 | 说明 | 数据量预估（年） |
|------|------|----------------|
| uni-id-users | 用户表（uni-id 内置） | 18K~72K |
| leads | 线索表 | 7.2K~36K |
| clients | 客户表 | <100 |
| articles | 文章表 | <200 |
| conversion-logs | 转化回传日志 | 18K~72K |
| sms-logs | 短信发送记录 | 18K~108K |
| app-version | App 版本管理 | <50 |

### 4.2 uni-id-users（用户表）

uni-id 自动管理，扩展以下字段：

```json
{
  "_id": "用户ID",
  "mobile": "13800001234",
  "mobile_confirmed": 1,
  "register_env": {
    "appid": "__UNI__xxx",
    "uni_platform": "app",
    "os_name": "android",
    "channel": "oceanengine"
  },
  "click_id": "巨量引擎 click_id",
  "click_id_source": "url_scheme | universal_link | clipboard",
  "client_id": "关联客户标识",
  "last_click_time": 1681363200000,
  "register_ip": "注册IP",
  "register_date": 1681363200000,
  "last_login_date": 1681363200000
}
```

**索引：**

| 索引 | 字段 | 类型 | 用途 |
|------|------|------|------|
| 内置 | `mobile` | 唯一 | 手机号查重、登录 |
| 新增 | `click_id` | 普通 | 转化回传查询 |
| 新增 | `register_date` | 普通 | 按时间范围查询、统计 |

### 4.3 leads（线索表）

```json
{
  "_id": "线索ID",
  "user_id": "关联用户ID",
  "user_mobile": "用户注册手机号（冗余，减少联表）",
  "name": "张女士",
  "phone": "13800001234",
  "city": "北京",
  "interest": ["double_eyelid"],
  "click_id": "巨量引擎 click_id",
  "client_id": "yuemei",
  "client_name": "悦美医疗（冗余存储）",
  "status": 0,
  "source": "oceanengine",
  "submit_ip": "提交请求IP",
  "consent_time": 1681363200000,
  "consent_version": "v1.0",
  "create_time": 1681363200000,
  "update_time": 1681363200000,
  "follow_note": ""
}
```

**字段规范：**

| 字段 | 类型 | 规则 |
|------|------|------|
| `interest` | `Array<string>` | 枚举：`double_eyelid`、`skin_care` |
| `status` | `int` | `0`=待跟进、`1`=已联系、`2`=已转化、`3`=无效 |
| `create_time` | `timestamp` | 毫秒级时间戳 |
| `phone` | `string` | 正则校验 `/^1[3-9]\d{9}$/` |
| `name` | `string` | 长度限制 2-20 字符 |
| `city` | `string` | 白名单校验（预设城市列表） |

**索引（精简为 4 个核心索引）：**

| 索引名 | 字段 | 用途 |
|--------|------|------|
| `idx_client_status_time` | `{ client_id: 1, status: 1, create_time: -1 }` | 最高频查询：某客户的待跟进线索按时间倒序 |
| `idx_status_createtime` | `{ status: 1, create_time: -1 }` | 全局线索查询（不分客户） |
| `idx_phone` | `{ phone: 1 }` | 防重复提交 |
| `idx_click_id` | `{ click_id: 1 }`（稀疏） | 转化回传查询 |

### 4.4 clients（客户表）

```json
{
  "_id": "自动生成",
  "client_id": "yuemei",
  "client_name": "悦美医疗",
  "contact_person": "王经理",
  "contact_phone": "13900001234",
  "webhook_url": "企微群机器人 Webhook（加密存储）",
  "status": 1,
  "create_time": 1681363200000
}
```

**索引：**

| 索引 | 字段 | 类型 | 用途 |
|------|------|------|------|
| `idx_client_id` | `client_id` | 唯一 | 通过标识查找客户 |
| `idx_status` | `status` | 普通 | 筛选启用/停用 |

### 4.5 articles（文章表）

```json
{
  "_id": "自动生成",
  "title": "双眼皮手术全攻略",
  "summary": "类型、恢复期、注意事项一篇讲清楚",
  "content": "文章正文（富文本）",
  "category": "double_eyelid",
  "cover_image": "封面图 URL",
  "sort_order": 1,
  "status": 1,
  "create_time": 1681363200000
}
```

**索引：**

| 索引 | 字段 | 用途 |
|------|------|------|
| `idx_category_sort` | `{ category: 1, sort_order: 1 }` | 按分类排序展示 |
| `idx_status` | `{ status: 1 }` | 筛选上架/下架文章 |

### 4.6 conversion-logs（转化回传日志）

```json
{
  "_id": "自动生成",
  "user_id": "关联用户ID",
  "click_id": "巨量引擎 click_id",
  "event_type": "register | form_submit",
  "request_body": {},
  "response_code": 200,
  "response_body": {},
  "success": true,
  "retry_count": 0,
  "next_retry_time": null,
  "create_time": 1681363200000
}
```

**索引：**

| 索引 | 字段 | 用途 |
|------|------|------|
| `idx_clickid_event` | `{ click_id: 1, event_type: 1 }` | 查回传记录、防重复回传 |
| `idx_success_time` | `{ success: 1, create_time: -1 }` | 筛选失败记录进行重试 |
| `idx_next_retry` | `{ next_retry_time: 1 }`（稀疏） | 定时补偿任务查询待重试记录 |

**TTL 策略：180 天清理**（匹配巨量引擎广告数据回溯期）。

### 4.7 sms-logs（短信记录）

```json
{
  "_id": "自动生成",
  "phone": "13800001234",
  "code": "123456",
  "ip": "发送请求IP",
  "used": false,
  "verify_count": 0,
  "create_time": 1681363200000,
  "expire_time": 1681363500000
}
```

**索引：**

| 索引 | 字段 | 用途 |
|------|------|------|
| `idx_phone_time` | `{ phone: 1, create_time: -1 }` | 频率限制 |
| `idx_ip_time` | `{ ip: 1, create_time: -1 }` | IP 维度防刷 |
| `idx_expire` | `{ expire_time: 1 }`（TTL 索引） | 自动清理过期验证码 |

**防刷规则：**
- 同一手机号：60 秒 1 次，1 小时 5 次，24 小时 10 次
- 同一 IP：1 小时 20 次
- 验证码有效期：5 分钟
- 单个验证码最多尝试验证 5 次，超过作废

### 4.8 app-version（版本管理）

```json
{
  "_id": "自动生成",
  "platform": "android | ios | harmony",
  "version": "1.0.1",
  "version_code": 101,
  "update_type": "force | optional",
  "download_url": "wgt 包下载地址",
  "release_note": "更新说明",
  "status": 1,
  "create_time": 1681363200000
}
```

### 4.9 DB Schema 权限控制

| 集合 | 客户端读 | 客户端写 | 说明 |
|------|---------|---------|------|
| uni-id-users | 仅自己 | 仅自己 | uni-id 内置权限 |
| leads | 仅自己 | 仅登录用户 | 用户只能看自己的线索 |
| clients | 不可 | 不可 | 仅云函数和管理员操作 |
| articles | 所有人 | 不可 | 文章公开可读，仅管理员可写 |
| conversion-logs | 不可 | 不可 | 仅云函数操作 |
| sms-logs | 不可 | 不可 | 仅云函数操作 |
| app-version | 所有人 | 不可 | 客户端只读，管理员可写 |

---

## 五、核心业务逻辑

### 5.1 巨量引擎对接

#### click_id 获取方案（多渠道兜底）

```
广告链接携带参数：?click_id=xxx&client_id=yuemei
    │
    ▼
App 启动时尝试获取 click_id：
    │
    ├── 方案1：URL Scheme / Intent 参数（Android 优先）
    │       通过 plus.runtime.arguments 解析
    │
    ├── 方案2：Universal Link（iOS）
    │       需配置 AASA 文件 + Associated Domains
    │
    └── 方案3：剪切板方案（兜底，iOS/Android 通用）
            用户点击广告时，广告落地页将 click_id 写入剪切板
            App 启动后读取剪切板内容
            匹配特定格式（如 ##LIANGREN_click_id_client_id##）
            读取后立即清除剪切板内容
    │
    ▼
click_id + client_id 存储：
    ├── 本地缓存（uni.setStorageSync）— 即时可用
    └── 云端用户记录（uni-id-users 扩展字段）— 持久可靠
```

记录 `click_id_source` 字段追踪各渠道获取成功率。

#### 转化回传流程

```
事件触发（注册成功 / 表单提交）
    │
    ▼
云函数 report-conversion
    │
    ├── 查 conversion-logs 防重复回传
    ├── 调用巨量引擎转化 API
    ├── 记录回传结果到 conversion-logs
    │
    ├── 成功 → 完成
    └── 失败 → 设置重试
            retry_count + 1
            next_retry_time = 当前时间 + 重试间隔
            重试间隔：1min → 5min → 30min（最多 3 次）
```

#### 定时补偿回传

```
定时云函数 retry-conversion（每小时执行一次）
    │
    ▼
查询 conversion-logs：
    success == false
    AND retry_count < 3
    AND next_retry_time <= 当前时间
    AND create_time > 7天前（巨量引擎回传时效）
    │
    ▼
逐条重试回传
    ├── 成功 → 更新 success = true
    └── 失败 → retry_count + 1，更新 next_retry_time
            │
            └── retry_count >= 3 → 企微通知运营人员
```

### 5.2 线索表单提交

#### 防刷策略

```
用户点击"提交咨询"
    │
    ▼
前端校验
    ├── 姓名：2-20 字符
    ├── 手机号：/^1[3-9]\d{9}$/
    ├── 城市：白名单校验
    ├── 感兴趣内容：至少选一项
    └── 授权勾选：必须勾选
    │
    ▼
人机验证（滑动验证码）
    │ 对接阿里云验证码服务（uniCloud 阿里云版原生支持）
    │
    ▼
云函数 submit-lead 校验
    │
    ├── Token 校验（必须登录态）
    ├── 参数格式二次校验（不信任前端）
    ├── 频率限制：同一 user_id 24 小时内最多 3 次
    ├── 手机号防重复：同一 phone 全局最多 5 条有效线索（status != 3）
    ├── IP 限制：同一 submit_ip 1 小时内最多 10 次
    │
    ▼ 校验通过
    │
    ├──▶ 写入 leads 表
    ├──▶ 异步调用 notify-wechat（通知失败不影响线索入库）
    └──▶ 异步调用 report-conversion（回传"表单提交"事件）
```

### 5.3 企微通知

#### 通知流程

```
云函数 notify-wechat（异步调用，不阻塞主流程）
    │
    ├── 通过 client_id 查 clients 表
    │   获取该客户的 webhook_url（解密）
    │
    ├── 推送到客户企微群
    │   消息内容：
    │   ┌──────────────────────────────┐
    │   │ 新线索 — 悦美医疗              │
    │   │ 姓名：张女士                   │
    │   │ 电话：138****1234（脱敏）      │
    │   │ 城市：北京                     │
    │   │ 感兴趣：双眼皮                 │
    │   │ 时间：2026-04-13 15:30        │
    │   └──────────────────────────────┘
    │
    ├── 推送到内部总群（完整手机号，便于运营）
    │
    ├── 发送失败 → 延迟 5 秒重试 1 次
    └── 仍然失败 → 记录日志，后台可手动重发
```

**企微 Webhook 限制应对：**
- 每分钟 20 条消息限制
- 如 1 分钟内超过 20 条线索，合并为一条汇总消息

### 5.4 App 热更新

```
App 启动时
    │
    ▼
云函数 check-update
    ├── 查 app-version 表，比对当前版本
    │
    ├── 有强制更新 → 弹窗提示，必须更新后才能使用
    ├── 有可选更新 → 弹窗提示，可跳过
    └── 无更新 → 正常使用
```

使用 uni-app 的 wgt 热更新机制，前端内容和功能更新无需重新走应用商店审核。

---

## 六、合规设计

### 6.1 隐私合规

| 要求 | 实现方式 |
|------|---------|
| 首次启动隐私弹窗 | App.vue 中 onLaunch 检测，未同意前不初始化任何 SDK |
| 注册勾选协议 | 注册页底部勾选框，未勾选不可注册 |
| 表单单独授权 | 表单页独立勾选"同意将信息分享给合作机构" |
| 合规凭证 | leads 表记录 consent_time 和 consent_version |
| 数据删除 | "我的"页面提供注销账号/删除数据入口 |
| 脱敏展示 | 企微通知中手机号脱敏，后台管理需权限查看完整号码 |

### 6.2 需要准备的文档

| 文档 | 说明 |
|------|------|
| 《隐私政策》 | 列明收集的信息、用途、第三方接收方（巨量引擎、企微）、存储期限、用户权利 |
| 《用户协议》 | 约定用户与平台的权责 |

两份文档需提供**网页版 URL**（各商店审核要求），可部署在 uniCloud 云存储或公司官网。

### 6.3 App 内容规范

| 规范 | 说明 |
|------|------|
| 不使用"医美"作为 App 名称或一级分类 | 使用"美容知识"、"皮肤护理"等中性表述 |
| 不展示具体机构名称/品牌 | 文章内容为通用科普知识 |
| 不使用真实术前术后对比照 | 使用正规图库素材图 |
| 表单不写"医美项目" | 改为"感兴趣的内容"或"想了解的话题" |

---

## 七、上架策略

### 7.1 所需资质

| 资质 | 说明 |
|------|------|
| 企业营业执照 | 代运营公司的营业执照 |
| 软件著作权 | 需提前申请，加急约 1-2 周 |
| ICP 备案 | 通过阿里云备案系统提交 |
| 隐私政策 URL | 可访问的网页版隐私政策 |

### 7.2 各平台开发者账号

| 平台 | 费用 | 审核周期 |
|------|------|---------|
| 华为应用市场 | 免费 | 1-3 工作日 |
| 小米应用商店 | 免费 | 1-3 工作日 |
| OPPO 应用商店 | 免费 | 1-3 工作日 |
| vivo 应用商店 | 免费 | 1-3 工作日 |
| 应用宝 | 免费 | 1-3 工作日 |
| Apple App Store | 688 元/年 | 1-2 周 |
| 鸿蒙应用市场 | 免费 | 1-3 工作日 |

### 7.3 上架顺序

```
第 1 步（与开发并行）：准备资质
    ├── 申请软著
    ├── 注册各平台企业开发者账号
    ├── ICP 备案
    ├── 准备隐私政策和用户协议网页版
    └── 准备医美机构合作授权文件（备用）

第 2 步：Android 先行
    ├── 华为应用市场
    └── 应用宝

第 3 步：iOS
    └── Apple App Store

第 4 步：补齐 Android
    ├── 小米 / OPPO / vivo

第 5 步：鸿蒙（视 uni-app 适配成熟度）
    └── 鸿蒙应用市场

第 6 步：巨量引擎配置
    └── 各商店下载链接 + 监测链接
```

---

## 八、项目结构

```
liangren-app/
├── pages/
│   ├── login/login.vue            # 注册/登录
│   ├── index/index.vue            # 首页（文章列表）
│   ├── article/detail.vue         # 文章详情
│   ├── form/index.vue             # 线索表单
│   ├── result/index.vue           # 提交成功
│   └── mine/index.vue             # 我的
├── components/
│   ├── privacy-popup.vue          # 隐私政策弹窗
│   └── captcha.vue                # 滑动验证码组件
├── uni_modules/
│   ├── uni-id-pages/              # 官方登录组件
│   └── ...
├── utils/
│   ├── click-id.js                # click_id 获取工具（多渠道）
│   └── city-data.js               # 城市白名单数据
├── uniCloud-aliyun/
│   ├── cloudfunctions/
│   │   ├── uni-id-co/             # 用户认证（uni-id 内置）
│   │   ├── submit-lead/           # 线索提交（含防刷）
│   │   ├── notify-wechat/         # 企微通知
│   │   ├── report-conversion/     # 巨量引擎回传
│   │   ├── retry-conversion/      # 定时补偿回传
│   │   ├── clean-expired/         # 定时清理过期数据
│   │   └── check-update/          # 版本检查
│   └── database/
│       ├── uni-id-users.schema.json
│       ├── leads.schema.json
│       ├── clients.schema.json
│       ├── articles.schema.json
│       ├── conversion-logs.schema.json
│       ├── sms-logs.schema.json
│       └── app-version.schema.json
├── static/
├── App.vue                        # 启动参数解析 + 隐私弹窗
├── main.js
├── manifest.json
├── pages.json
└── uni.scss
```

后台管理（uni-admin）为独立项目：

```
liangren-admin/
├── pages/
│   ├── leads/                     # 线索管理（列表、筛选、状态更新、导出）
│   ├── clients/                   # 客户管理（CRUD、Webhook 配置）
│   ├── articles/                  # 文章管理（CRUD、富文本编辑）
│   ├── dashboard/                 # 数据看板
│   └── app-version/               # 版本管理
└── ...
```

---

## 九、开发阶段

| 阶段 | 内容 | 预估工期 |
|------|------|---------|
| 1. 基础框架 | 初始化项目、配置 uniCloud、集成 uni-id-pages、短信配置、隐私弹窗 | 2 天 |
| 2. 核心页面 | 首页、文章详情、表单页、成功页、我的页面、页面导航 | 2-3 天 |
| 3. 后端业务 | 数据库 Schema、submit-lead 云函数（含防刷）、企微通知、数据清理 | 2-3 天 |
| 4. 巨量引擎 | click_id 获取（多渠道）、report-conversion、retry-conversion | 2 天 |
| 5. 后台管理 | uni-admin 搭建、客户管理、线索管理、文章管理、数据看板 | 2-3 天 |
| 6. 热更新与合规 | wgt 热更新、版本检查、隐私政策/用户协议页面、注销功能 | 1 天 |
| 7. 测试与上架 | 真机测试、打包签名、提交审核、巨量引擎配置 | 3-5 天 |

**总计预估：14-19 天**

---

## 十、注意事项

| 项目 | 说明 |
|------|------|
| 鸿蒙适配 | uni-app 对鸿蒙支持持续更新中，先完成 Android + iOS，后适配鸿蒙 |
| 短信模板 | 需提前申请并通过审核，阶段 1 就提交 |
| 企微 Webhook | 每个客户群创建机器人，URL 加密存储到 clients 表 |
| 剪切板方案 | iOS 14+ 读取剪切板会弹出系统提示，需在隐私政策中说明 |
| 内容合规 | 科普文章避免出现夸大宣传、虚假承诺等违规内容 |
| 数据备份 | 定期备份 leads 表数据，防止数据丢失 |
