/**
 * 一次性清洗脚本：把 utils/mock-data.js 里的所有虚构"医生作者"、假统计数、
 * picsum 随机图、敏感医美用语批量替换为合规版本。
 *
 * 使用：
 *   node tools/clean-mock-data.js
 *
 * 该脚本是幂等的，可重复运行，不会双重替换。
 */

const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../utils/mock-data.js')
let src = fs.readFileSync(file, 'utf8')

const before = src

// 1) 作者字段：所有 xx 医生 / xx 专家 → 统一 编辑部
src = src.replace(/author:\s*'[^']*医生[^']*'/g, "author: '编辑部'")
src = src.replace(/author:\s*'[^']*专家[^']*'/g, "author: '编辑部'")
src = src.replace(/author:\s*'[^']*大夫[^']*'/g, "author: '编辑部'")

// 2) 统计字段：read_count / like_count / comment_count / view_count → 0
src = src.replace(/\bread_count:\s*\d+/g, 'read_count: 0')
src = src.replace(/\blike_count:\s*\d+/g, 'like_count: 0')
src = src.replace(/\bcomment_count:\s*\d+/g, 'comment_count: 0')
src = src.replace(/\bview_count:\s*\d+/g, 'view_count: 0')
src = src.replace(/\bconsult_count:\s*\d+/g, 'consult_count: 0')

// 3) picsum 图片 → 本地占位图（首版上架前请批量替换为自有版权图）
src = src.replace(/https:\/\/picsum\.photos\/[^'"\s]+/g, '/static/placeholder/article-cover.svg')
src = src.replace(/\/static\/placeholder\/article-cover\.png/g, '/static/placeholder/article-cover.svg')

// 4) 医美敏感词批量替换（按《医疗广告管理办法》《广告法》第十六条）
const SENSITIVE_WORD_MAP = [
  // 承诺 / 绝对化用语（不用 \b，因为 JS 正则的 \b 对中文字符无效）
  [/最佳方案/g, '常见方案'],
  [/最佳选择/g, '较合适的选择'],
  [/最佳/g, '常见'],
  [/最好的/g, '较合适的'],
  [/最适合/g, '较适合'],
  [/最新技术/g, '常用术式'],
  [/最新科技/g, '常用方案'],
  [/最新发明/g, '新型方案'],
  [/绝对安全/g, '相对安全'],
  [/100%成功/g, '具有一定成功率'],
  [/终身有效/g, '长期效果'],
  [/永久有效/g, '长期效果'],
  [/根治/g, '改善'],
  [/彻底治愈/g, '有助改善'],
  [/一劳永逸/g, '长期效果'],
  [/神奇效果/g, '相关效果'],
  [/奇效/g, '效果'],
  // 直接点评 / 诱导咨询
  [/免费咨询/g, '在线留言'],
  [/免费面诊/g, '预约面诊'],
  [/免费获取/g, '了解更多'],
  [/免费诊疗/g, '在线留言'],
  [/专业医师1对1解答/g, '平台整理相关资料'],
  [/专业医生/g, '执业医师'],
  [/专家推荐/g, '科普介绍'],
  [/名医亲诊/g, '执业医师面诊'],
  // 疗效 / 疗程承诺
  [/疗效确切/g, '效果因人而异'],
  [/疗效显著/g, '效果因人而异'],
  [/术后快速恢复/g, '术后恢复时间因人而异'],
  [/无痛/g, '微痛'],
  [/无副作用/g, '需关注可能的不良反应']
]
for (const [reg, to] of SENSITIVE_WORD_MAP) {
  src = src.replace(reg, to)
}

// 5) 案例展示里的"真实姓名"清洗：张小姐 / 李女士 / 王先生 等统一改为 匿名用户
src = src.replace(/user_name:\s*'[^']{1,3}(小姐|女士|先生|同学)'/g, "user_name: '匿名用户'")
src = src.replace(/author:\s*'[^']{1,3}(小姐|女士|先生|同学)'/g, "author: '匿名用户'")

// 6) 文件头部补一段声明（幂等：若已有则跳过）
const header = `/**
 * Mock data for the entire app (已按医疗广告合规要求清洗)
 * -----------------------------------------------------------
 * 清洗规则：
 *   - 作者字段一律为 "编辑部"，禁止出现"医生 / 专家 / 大夫"字样
 *   - 阅读 / 点赞等统计字段默认 0，由真实用户行为累计
 *   - 图片为本地占位图，上架前请替换为自有版权图
 *   - 已批量移除"免费咨询 / 最佳 / 根治 / 绝对安全"等违规用语
 * 文件由 tools/clean-mock-data.js 批量清洗生成，如需再次清洗请直接运行该脚本。
 */`

if (!src.startsWith('/**\n * Mock data for the entire app (已按医疗广告合规要求清洗)')) {
  src = src.replace(/^\/\*\*[\s\S]*?\*\/\n?/, '') // 移除旧的文件头注释
  src = header + '\n\n' + src
}

if (src === before) {
  console.log('[clean-mock-data] no changes')
} else {
  fs.writeFileSync(file, src, 'utf8')
  console.log('[clean-mock-data] cleaned mock-data.js (bytes:', src.length, ')')
}
