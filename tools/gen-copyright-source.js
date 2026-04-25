#!/usr/bin/env node
/**
 * 软著源代码抽取脚本
 *
 * 按《软著申请交付包》§6.1 白名单从仓库抽取源代码，
 * 自动脱敏敏感信息（AccessKey / Webhook / 手机号等），
 * 按 50 行 / 页的规则输出"前 30 页"和"后 30 页"两份文本，
 * 供代理公司直接排版提交中国版权保护中心。
 *
 * 用法：
 *   node tools/gen-copyright-source.js
 *
 * 输出：
 *   docs/软著-源代码-前30页.txt
 *   docs/软著-源代码-后30页.txt
 *   docs/软著-源代码-完整.txt
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'docs')

const LINES_PER_PAGE = 50
const TOTAL_PAGES_EACH_SIDE = 30
const LINES_EACH_SIDE = LINES_PER_PAGE * TOTAL_PAGES_EACH_SIDE // 1500

// ============ 白名单：前 30 页（业务入口 + 页面层 + 组件） ============
const FRONT_FILES = [
  'App.vue',
  'main.js',
  'manifest.json',
  'pages.json',
  'pages/index/index.vue',
  'pages/article/detail.vue',
  'pages/discover/index.vue',
  'pages/search/index.vue',
  'pages/mine/index.vue',
  'pages/favorites/index.vue',
  'pages/history/index.vue',
  'pages/settings/index.vue',
  'pages/feedback/index.vue',
  'pages/form/index.vue',
  'pages/result/index.vue',
  'pages/about/index.vue',
  'pages/guide/index.vue',
  'pages/webview/index.vue',
  'components/privacy-popup/privacy-popup.vue',
  'components/float-consult/float-consult.vue',
  'components/captcha/captcha.vue',
]

// ============ 白名单：后 30 页（云函数 + 工具 + 数据库 schema） ============
const BACK_FILES = [
  'uniCloud-aliyun/cloudfunctions/get-content/index.js',
  'uniCloud-aliyun/cloudfunctions/submit-feedback/index.js',
  'uniCloud-aliyun/cloudfunctions/submit-lead/index.js',
  'uniCloud-aliyun/cloudfunctions/report-conversion/index.js',
  'uniCloud-aliyun/cloudfunctions/retry-conversion/index.js',
  'uniCloud-aliyun/cloudfunctions/notify-wechat/index.js',
  'uniCloud-aliyun/cloudfunctions/check-update/index.js',
  'uniCloud-aliyun/cloudfunctions/clean-expired/index.js',
  'uniCloud-aliyun/cloudfunctions/import-seeds/index.js',
  'utils/content-api.js',
  'utils/login-hook.js',
  'utils/click-id.js',
  'utils/mock-data.js',
  'utils/city-data.js',
  'uniCloud-aliyun/database/articles.schema.json',
  'uniCloud-aliyun/database/qa.schema.json',
  'uniCloud-aliyun/database/tips.schema.json',
  'uniCloud-aliyun/database/feedbacks.schema.json',
  'uniCloud-aliyun/database/leads.schema.json',
  'uniCloud-aliyun/database/clients.schema.json',
  'uniCloud-aliyun/database/sms-logs.schema.json',
  'uniCloud-aliyun/database/conversion-logs.schema.json',
  'uniCloud-aliyun/database/app-version.schema.json',
  'tools/gen-seed-data.js',
  'tools/clean-mock-data.js',
]

// ============ 脱敏规则 ============
const SANITIZE_RULES = [
  // 阿里云 AccessKey（LTAI 开头 + 20~30 位）
  { pattern: /LTAI[A-Za-z0-9]{16,30}/g, replacement: '<ALIYUN_ACCESS_KEY_ID>' },
  // AccessKey Secret（30 位字母数字）
  { pattern: /"(accessKeySecret|secretKey|secret)"\s*:\s*"[^"]{20,}"/gi, replacement: '"$1": "<ALIYUN_ACCESS_KEY_SECRET>"' },
  // 企业微信群机器人 webhook
  { pattern: /https?:\/\/qyapi\.weixin\.qq\.com\/cgi-bin\/webhook\/send\?key=[A-Za-z0-9-]+/g, replacement: '<WECHAT_BOT_WEBHOOK_URL>' },
  // 巨量引擎转化回传 token
  { pattern: /"(convert_access_token|access_token|event_token)"\s*:\s*"[^"]+"/gi, replacement: '"$1": "<TOUTIAO_CONVERSION_TOKEN>"' },
  // uniCloud spaceId / clientSecret
  { pattern: /"(spaceId|clientSecret)"\s*:\s*"[^"]+"/gi, replacement: '"$1": "<UNICLOUD_PLACEHOLDER>"' },
  // 国内手机号（13/14/15/16/17/18/19 开头的 11 位）
  { pattern: /\b1[3-9]\d{9}\b/g, replacement: '138****0000' },
  // 邮箱（非 example.com）
  { pattern: /\b([A-Za-z0-9._%+-]+)@(?!example\.com)([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, replacement: 'user@example.com' },
  // Bearer Token / JWT（eyJ 开头的 3 段 base64）
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, replacement: '<JWT_TOKEN>' },
  // 身份证号
  { pattern: /\b[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g, replacement: '<ID_CARD_NUMBER>' },
]

function sanitize(text) {
  let result = text
  for (const { pattern, replacement } of SANITIZE_RULES) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function readFileSafe(relPath) {
  const fullPath = path.join(ROOT, relPath)
  if (!fs.existsSync(fullPath)) {
    console.warn(`[WARN] 文件不存在，已跳过：${relPath}`)
    return null
  }
  return fs.readFileSync(fullPath, 'utf8')
}

function buildBlock(relPath, content) {
  const header = [
    '/* ========================================================================= */',
    `/* 文件：${relPath}`,
    `/* 软件：靓人科普医美资讯服务软件 V1.0`,
    '/* ========================================================================= */',
    '',
  ].join('\n')
  return header + content.replace(/\r\n/g, '\n').trimEnd() + '\n\n'
}

function collectBlocks(fileList) {
  const blocks = []
  for (const rel of fileList) {
    const raw = readFileSafe(rel)
    if (raw == null) continue
    const cleaned = sanitize(raw)
    blocks.push(buildBlock(rel, cleaned))
  }
  return blocks.join('')
}

function toPagedLines(text) {
  // 去除完全空白行以外的无效字符；保留所有代码/注释行
  return text.split('\n')
}

function slicePages(text, maxLines) {
  const lines = toPagedLines(text)
  return lines.slice(0, maxLines).join('\n')
}

function statLines(text) {
  return text.split('\n').length
}

function writeWithPageFooter(filePath, text, title) {
  const lines = text.split('\n')
  const totalLines = lines.length
  const totalPages = Math.ceil(totalLines / LINES_PER_PAGE)

  const output = []
  output.push(`# ${title}`)
  output.push(`# 软件名称：靓人科普医美资讯服务软件 V1.0`)
  output.push(`# 提取时间：${new Date().toISOString().replace('T', ' ').slice(0, 19)}`)
  output.push(`# 总行数：${totalLines}   总页数（50 行/页）：${totalPages}`)
  output.push(`# 说明：本文件仅供软著登记申请使用，敏感信息已脱敏`)
  output.push('')
  output.push('=============================================================================')
  output.push('')

  for (let p = 0; p < totalPages; p++) {
    const start = p * LINES_PER_PAGE
    const end = Math.min(start + LINES_PER_PAGE, totalLines)
    const pageLines = lines.slice(start, end)
    output.push(...pageLines)
    output.push('')
    output.push(`---------- 第 ${p + 1} 页 / 共 ${totalPages} 页 ----------`)
    output.push('')
  }

  fs.writeFileSync(filePath, output.join('\n'), 'utf8')
  return { totalLines, totalPages }
}

function main() {
  console.log('==============================================')
  console.log(' 软著源代码抽取 —— 靓人科普医美资讯服务软件 V1.0')
  console.log('==============================================\n')

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }

  console.log('▶ 抽取前 30 页文件（页面层 + 组件）...')
  const frontRaw = collectBlocks(FRONT_FILES)
  const frontTrimmed = slicePages(frontRaw, LINES_EACH_SIDE)
  const frontPath = path.join(OUT_DIR, '软著-源代码-前30页.txt')
  const frontStat = writeWithPageFooter(frontPath, frontTrimmed, '软著登记 —— 源程序文档（前 30 页）')
  console.log(`  ✔ 写入：${path.relative(ROOT, frontPath)}`)
  console.log(`    原始行数：${statLines(frontRaw)}，截取 ${frontStat.totalLines} 行，共 ${frontStat.totalPages} 页\n`)

  console.log('▶ 抽取后 30 页文件（云函数 + 工具 + 数据库）...')
  const backRaw = collectBlocks(BACK_FILES)
  const backTrimmed = slicePages(backRaw, LINES_EACH_SIDE)
  const backPath = path.join(OUT_DIR, '软著-源代码-后30页.txt')
  const backStat = writeWithPageFooter(backPath, backTrimmed, '软著登记 —— 源程序文档（后 30 页）')
  console.log(`  ✔ 写入：${path.relative(ROOT, backPath)}`)
  console.log(`    原始行数：${statLines(backRaw)}，截取 ${backStat.totalLines} 行，共 ${backStat.totalPages} 页\n`)

  console.log('▶ 生成完整版（供代理公司核对用，可不提交版权中心）...')
  const fullPath = path.join(OUT_DIR, '软著-源代码-完整.txt')
  const fullText = frontRaw + '\n\n/* ================ 后 30 页分界 ================ */\n\n' + backRaw
  fs.writeFileSync(fullPath, fullText, 'utf8')
  console.log(`  ✔ 写入：${path.relative(ROOT, fullPath)}\n`)

  console.log('▶ 脱敏校验（扫描输出文件中是否仍含敏感信息）...')
  const warnings = []
  const checkText = frontTrimmed + '\n' + backTrimmed
  const checkRules = [
    { name: '阿里云 AccessKey', pattern: /LTAI[A-Za-z0-9]{16,}/ },
    { name: '手机号', pattern: /\b1[3-9]\d{9}\b/ },
    { name: '企业微信 webhook', pattern: /qyapi\.weixin\.qq\.com\/cgi-bin\/webhook/ },
    { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_-]{30,}\./ },
  ]
  for (const rule of checkRules) {
    if (rule.pattern.test(checkText)) {
      warnings.push(`  ⚠ 仍检测到 ${rule.name}，请人工检查！`)
    }
  }
  if (warnings.length === 0) {
    console.log('  ✔ 未检测到明显敏感信息\n')
  } else {
    console.log(warnings.join('\n') + '\n')
  }

  console.log('==============================================')
  console.log(' 完成！请代理公司按以下文件排版：')
  console.log('   1. docs/软著-源代码-前30页.txt')
  console.log('   2. docs/软著-源代码-后30页.txt')
  console.log('==============================================\n')
}

main()
