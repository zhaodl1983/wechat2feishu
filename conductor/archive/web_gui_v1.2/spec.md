# Track Specification: Web GUI (V1.2)

## Goal
Implement the "Wechat2doc" web interface based on the approved Apple-style minimalist design. This interface serves as the primary entry point for users to grab and sync articles.
    -   Logo: "Wechat2doc" with a custom icon (as shown in design).
    -   Action: "登录飞书" (Login with Feishu) button, pill-shaped, outline/light gray.
2.  **Hero Section**:
    -   Headline: "瞬间将微信文章保存到飞书" (Save WeChat articles to Feishu instantly).
    -   Sub-headline: "一键归档你喜欢的微信内容到飞书工作区。高保真保留图像和文本。"
    -   **Main Input Area**: A combined component with a URL link icon, an input field ("在此粘贴微信文章链接..."), and a black "一键转存" button.
3.  **Transfer History (转存历史)**:
    -   A minimalist table with columns: "文章标题" (Article Title), "日期" (Date), and "状态" (Status).
    -   Status: Display "已保存" (Saved) with a green checkmark icon.
    -   Action: "清除历史" (Clear History) link in the section header.
4.  **Footer**:
    -   Links: 隐私政策, 服务条款, 文档, 支持.
    -   Copyright: "© 2024 Wechat2doc. 为生产力而生。"

## Technical Requirements
-   **Framework**: Next.js (App Router).
-   **Styling**: Tailwind CSS + `shadcn/ui`.
-   **Font**: System sans-serif (Inter/PingFang SC).
-   **API Integration**: 
    -   `POST /api/sync`: Receives URL, triggers scraping/syncing logic, returns result.
    -   `GET /api/history`: Fetches recent articles from SQLite.
-   **Database**: Update Prisma schema to support history display.

## Success Criteria
-   [ ] The web page pixel-perfectly matches the provided design image.
-   [ ] Clicking "一键转存" triggers the existing `lib/scraper.ts` and `lib/feishu.ts` logic.
-   [ ] New successful transfers automatically appear in the "Transfer History" list.
