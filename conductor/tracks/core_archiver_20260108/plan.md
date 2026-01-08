# Track Plan: 构建核心本地归档器

## Phase 1: 环境初始化
- [ ] Task: 初始化 Next.js 项目并配置 TypeScript
- [ ] Task: 设置 Prisma 并初始化 SQLite 数据库
- [ ] Task: 安装核心依赖 (Playwright, Turndown, Cheerio, Lucide-React)
- [ ] Task: Conductor - User Manual Verification '环境初始化' (Protocol in workflow.md)

## Phase 2: 抓取与解析核心逻辑
- [ ] Task: 实现 Playwright 服务以渲染微信文章页面
- [ ] Task: 编写元数据提取逻辑 (标题, 日期, 封面图等)
- [ ] Task: 编写正文内容提取逻辑 (智能裁剪非正文元素)
- [ ] Task: Conductor - User Manual Verification '抓取与解析核心逻辑' (Protocol in workflow.md)

## Phase 3: Markdown 转换与资源处理
- [ ] Task: 配置 Turndown 转换规则以适配微信特有标签
- [ ] Task: 实现图片下载器 (支持 WebP 格式并本地重定向链接)
- [ ] Task: 实现原子化文件夹保存逻辑与重名冲突处理
- [ ] Task: Conductor - User Manual Verification 'Markdown 转换与资源处理' (Protocol in workflow.md)

## Phase 4: CLI 接口实现
- [ ] Task: 使用 `commander` 或原生 `process.argv` 实现 `wgrab <url>` 命令
- [ ] Task: 集成抓取流并添加 Emoji 风格的控制台进度反馈
- [ ] Task: Conductor - User Manual Verification 'CLI Interface' (Protocol in workflow.md)
