# Track Plan: 修复正文提取缺失问题

## Phase 1: 问题复现与诊断
- [x] Task: 修改 `test-scrape.ts` 以保存中间状态的 HTML 文件 (raw_html, cleaned_html) 用于分析
- [x] Task: 运行测试并分析生成的 HTML，确定是 Parser 删除了内容还是 Converter 丢弃了内容
- [x] Task: Conductor - User Manual Verification '诊断结果' (Protocol in workflow.md)

## Phase 2: 修复与验证
- [x] Task: 优化 `lib/scraper.ts`：更新 User-Agent，增加视口大小，优化滚动逻辑，确保加载完整内容
- [x] Task: 重新运行 `test-scrape.ts`，验证 `debug_raw.html` 大小和内容
- [x] Task: 验证最终 Markdown 生成
- [x] Task: Conductor - User Manual Verification '修复验证' (Protocol in workflow.md)
