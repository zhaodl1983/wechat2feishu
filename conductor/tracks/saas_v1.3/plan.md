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
- [ ] **Task 5.1**: **标题修复**：解决转存后飞书文档标题错误的问题（可能与 HTML 提取或飞书导入参数有关）。
- [ ] **Task 5.2**: **图片还原**：排查并修复飞书文档中图片不显示的问题（检查图片 Token 替换逻辑和上传状态）。
- [ ] **Task 5.3**: **冗余清洗**：剔除文档头部的多余 head 信息（如元数据 JSON 或原始 HTML 残留），保持文档整洁。
- [ ] **Task 5.4**: **回归测试**：确保多用户模式下，不同类型的文章都能高保真还原。

## Notes
-   Encryption key should be stored in `.env` as `ENCRYPTION_KEY`.
-   Feishu Redirect URL needs to be set in the Developer Console.
