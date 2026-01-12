# Implementation Plan: SaaS Service (V1.3)

## Tasks

### Phase 1: Identity & Session Foundation
- [x] **Task 1.1**: Update `prisma/schema.prisma` to include `User` model and link it to `Article`.
- [x] **Task 1.2**: Implement Feishu OAuth Callback API Route (`/api/auth/callback/feishu`).
- [x] **Task 1.3**: Implement JWT session utility and middleware to protect routes.

### Phase 2: Secure Token Management
- [x] **Task 2.1**: Implement `Encryption` utility class (AES-256-GCM).
- [x] **Task 2.2**: Refactor `FeishuClient` to support `user_access_token` and automatic refreshing.
- [x] **Task 2.3**: Implement background refresh logic for active sessions.

### Phase 3: UI Implementation
- [x] **Task 3.1**: Update `Header` component to display user profile and a logout menu.
- [x] **Task 3.2**: Add `me` API to fetch current user's profile info.
- [x] **Task 3.3**: Filter `HistoryList` based on the authenticated user.

### Phase 4: Workflow Migration
- [x] **Task 4.1**: Update `lib/conductor.ts` to use the logged-in user's token for syncing.
- [x] **Task 4.2**: Verify ownership: Check if the user can delete the created document in Feishu.

### Phase 5: Content Quality & Bug Fixes
- [x] **Task 5.1**: **标题修复**：解决转存后飞书文档标题错误的问题。
- [x] **Task 5.2**: **图片还原**：通过 Image Proxy 彻底解决图片裂图问题，实现高保真内嵌。
- [x] **Task 5.3**: **冗余清洗**：剔除文档头部的多余 YAML Frontmatter。
- [ ] **Task 5.4**: **动图与视频支持**：
    -   **GIF**: 目前 Proxy 可能对 GIF 的 Content-Type 处理有误，或飞书导入对大体积 GIF 有限制，需排查。
    -   **Video**: 微信视频号/腾讯视频卡片目前可能被过滤或仅显示封面，需评估是否解析为视频链接或内嵌播放器。

### Phase 6: Final Polish & Community (V0.5)

## Notes
-   Encryption key should be stored in `.env` as `ENCRYPTION_KEY`.
-   Feishu Redirect URL needs to be set in the Developer Console.
