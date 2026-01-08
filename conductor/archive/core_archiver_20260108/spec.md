# Track Spec: 构建核心本地归档器

## 概述
本轨迹旨在开发 V1.0 的核心功能：一个能够抓取微信公众号文章并将其完美转换为本地 Markdown 文件的系统。

## 核心功能
- **Playwright 渲染：** 使用无头浏览器加载 URL，确保处理图片懒加载。
- **元数据提取：** 捕获标题、作者、发布日期、公众号名称及封面图。
- **内容转换：** 使用 Turndown 将 HTML 转换为 Markdown。
- **资源管理：** 下载 WebP 图片至 `assets/` 目录。
- **文件系统：** 独立文章包结构，支持自动重命名防冲突。

## 技术选型回顾
- **Runtime:** Node.js (Next.js API Routes / CLI)
- **Scraper:** Playwright
- **Converter:** Turndown + Cheerio
- **Database:** SQLite (Prisma)
