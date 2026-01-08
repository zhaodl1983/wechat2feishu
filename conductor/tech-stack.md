# 技术栈

## 核心框架与运行环境
- **全栈框架:** Next.js (App Router) - 利用其 API Routes 处理抓取逻辑，前端展示进度。
- **语言:** TypeScript - 确保全栈开发过程中的类型安全，特别是在处理飞书 API 时。
- **浏览器自动化:** Playwright - 用于渲染微信公众号页面，解决图片懒加载 (Lazy Load) 问题。

## 数据持久化
- **数据库:** SQLite (通过 Prisma ORM) - 用于记录抓取历史、文章元数据和同步状态。
- **文件存储:** 本地文件系统 (Node.js `fs` 模块) - 存储生成的 Markdown 文件及下载的图片资源。

## 内容处理
- **转换引擎:** Turndown - 将 Playwright 渲染后的 HTML 转换为干净的 Markdown 格式。
- **HTML 解析:** Cheerio - 在转换前后进行细粒度的 DOM 操作（如智能裁剪广告、提取元数据）。

## UI 与交互 (Web 端)
- **样式:** Tailwind CSS - 快速构建响应式界面。
- **组件库:** shadcn/ui - 提供现代、美观且易于定制的 UI 组件。
- **进度展示:** 基于 React 状态或 Server-Sent Events (SSE) 展示实时抓取进度。

## 外部集成
- **飞书 API:** 使用飞书开放平台文档 API 进行 V2.0 的云端同步。
