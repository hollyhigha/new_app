#!/usr/bin/env node
/**
 * 《软著申请交付包》Markdown → 可打印 HTML 生成器
 *
 * 用法：
 *   node tools/gen-copyright-pdf.js
 *
 * 输出：
 *   docs/软著申请交付包.html
 *
 * 生成后在浏览器中打开 → Cmd/Ctrl + P → 目标：另存为 PDF → 保存。
 * 已内置打印样式（A4、页边距、中文字体、表格、代码块），可直接交付代理公司。
 */

const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

const ROOT = path.resolve(__dirname, '..')
const INPUT = path.join(ROOT, 'docs', '软著申请交付包.md')
const OUTPUT = path.join(ROOT, 'docs', '软著申请交付包.html')

if (!fs.existsSync(INPUT)) {
  console.error(`[ERROR] 源文件不存在：${INPUT}`)
  process.exit(1)
}

const md = fs.readFileSync(INPUT, 'utf8')

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
})

const bodyHtml = marked.parse(md)

const css = `
  @page {
    size: A4;
    margin: 20mm 18mm 20mm 18mm;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
                 "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #222;
    background: #fff;
  }
  .container {
    max-width: 820px;
    margin: 0 auto;
    padding: 32px 28px;
  }
  h1 {
    font-size: 22pt;
    margin: 0 0 12pt 0;
    padding-bottom: 8pt;
    border-bottom: 2px solid #333;
    page-break-after: avoid;
  }
  h2 {
    font-size: 16pt;
    margin: 22pt 0 10pt 0;
    padding-bottom: 4pt;
    border-bottom: 1px solid #999;
    page-break-after: avoid;
    page-break-before: auto;
  }
  h3 {
    font-size: 13pt;
    margin: 16pt 0 8pt 0;
    page-break-after: avoid;
  }
  h4 {
    font-size: 11.5pt;
    margin: 12pt 0 6pt 0;
    page-break-after: avoid;
  }
  p { margin: 6pt 0; }
  ul, ol { padding-left: 24pt; margin: 6pt 0; }
  li { margin: 3pt 0; }
  blockquote {
    margin: 8pt 0;
    padding: 6pt 12pt;
    border-left: 4px solid #E91E63;
    background: #fafafa;
    color: #555;
    page-break-inside: avoid;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8pt 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  table th, table td {
    border: 1px solid #bbb;
    padding: 4pt 6pt;
    text-align: left;
    vertical-align: top;
  }
  table th {
    background: #f0f0f0;
    font-weight: 600;
  }
  code {
    font-family: "SF Mono", Menlo, Consolas, "Courier New", monospace;
    font-size: 9.5pt;
    background: #f4f4f4;
    padding: 1px 4px;
    border-radius: 3px;
  }
  pre {
    background: #f7f7f7;
    border: 1px solid #e1e1e1;
    padding: 8pt 10pt;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.45;
    page-break-inside: avoid;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 9pt;
  }
  hr {
    border: 0;
    border-top: 1px solid #ccc;
    margin: 18pt 0;
  }
  a { color: #0366d6; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .cover {
    text-align: center;
    padding: 140pt 0 40pt 0;
    page-break-after: always;
  }
  .cover .sub-title {
    font-size: 16pt;
    color: #666;
    margin: 20pt 0;
  }
  .cover .meta {
    margin-top: 60pt;
    font-size: 12pt;
    color: #555;
    line-height: 2;
  }
  .print-hint {
    position: fixed;
    top: 8px;
    right: 8px;
    padding: 8px 14px;
    background: #E91E63;
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  @media print {
    .print-hint { display: none; }
    .container { padding: 0; }
  }
`

const today = new Date().toISOString().slice(0, 10)

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>靓人科普医美资讯服务软件 V1.0 —— 软著申请交付包</title>
<style>${css}</style>
</head>
<body>
<div class="print-hint">提示：Cmd/Ctrl + P → 目标选"另存为 PDF"</div>
<div class="container">
  <section class="cover">
    <h1 style="border:none; font-size:26pt;">靓人科普医美资讯服务软件 V1.0</h1>
    <div class="sub-title">软件著作权登记申请 · 交付包</div>
    <div class="meta">
      文档版本：v1.0<br>
      生成日期：${today}<br>
      交付对象：软著代办代理公司
    </div>
  </section>
  ${bodyHtml}
</div>
</body>
</html>`

fs.writeFileSync(OUTPUT, html, 'utf8')

console.log('==============================================')
console.log(' 《软著申请交付包》HTML 已生成')
console.log('==============================================')
console.log(` ✔ 输出文件：${path.relative(ROOT, OUTPUT)}`)
console.log('')
console.log(' 导出 PDF 步骤：')
console.log('   1. 双击打开 docs/软著申请交付包.html（或拖到 Chrome/Safari）')
console.log('   2. 按 Cmd + P （Mac） / Ctrl + P （Win）')
console.log('   3. "目标" 选择 "另存为 PDF"')
console.log('   4. "背景图形" 勾选（可选），保存即可')
console.log('==============================================')
