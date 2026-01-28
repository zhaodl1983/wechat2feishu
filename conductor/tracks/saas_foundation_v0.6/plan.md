# Implementation Plan: SaaS Foundation (V0.6)

## Context
- **Infrastructure**: Tencent Cloud Lightweight Server (40GB Disk).
- **Stage**: MVP.
- **Goal**: Transition to self-hosted storage and standard email authentication to reduce dependency on third-party platforms and optimize for limited resources.
- **Spec**: [Technical Specification](./spec.md)

## Tasks

### Phase 1: Authentication System (Email/Password)
- [x] **Task 1.1**: Update `prisma/schema.prisma` `User` model and add `VerificationToken` model based on Spec.
- [x] **Task 1.2**: Implement Registration API (`/api/auth/register`) and Email Verification (`/api/auth/send-code`).
- [x] **Task 1.3**: Implement Login API (`/api/auth/login`) with JWT (NextAuth).
- [x] **Task 1.4**: Create UI for Login/Register pages (switchable with Feishu login).

### Phase 2: Content Storage (MongoDB)
- [x] **Task 2.1**: Update `prisma/schema.prisma` `Article` model to add `content` field.
- [x] **Task 2.2**: Update `conductor.ts` to save Markdown content to the DB.
- [x] **Task 2.3**: Update frontend to fetch content from DB (Download Markdown feature).

### Phase 3: Image Storage Optimization (Local FS)
- [x] **Task 3.1**: Define storage structure and implement Image Compression Service (`sharp`).
- [x] **Task 3.2**: Update `conductor.ts` to use optimized local storage.

### Phase 4: Data Backup & Security
- [x] **Task 4.1**: Create `scripts/backup_db.sh` for MongoDB dump.
- [x] **Task 4.2**: Configure retention policy (7 days).
- [x] **Task 4.3**: Document Cron job setup in `DEPLOYMENT.md`.

### Phase 5: Bug Fixes
- [x] **Task 5.1**: 隐藏飞书同步功能相关的 UI 提示信息（详情页按钮与历史列表预览链接）。
- [x] **Task 5.2**: 修复深色模式下视图切换按钮（网格/列表）不可见的问题。
- [x] **Task 5.3**: 修复首页及公共页面（未登录状态）在切换深色模式后样式不匹配的问题，实现全栈深色模式同步。
- [x] **Task 5.4**: 修复深色模式下“新转存”弹窗背景、输入框及按钮的样式适配问题。
- [x] **Task 5.5**: 优化 Emoji 表情渲染逻辑，通过扩展 URL 特征检测和自定义 Markdown 组件（p/img），彻底解决微信表情显示巨大的问题。

### Phase 6: Storage Strategy Optimization (Smart Cache)
- [x] **Task 6.1**: Update `prisma/schema.prisma` to remove `@unique` from `originalUrl` and add `@@unique([userId, originalUrl])`.
- [x] **Task 6.2**: Refactor `lib/conductor.ts` to implement smart cache logic (check existing stored article -> soft clone -> skip scrape).
- [x] **Task 6.3**: Verify data integrity and execute DB migration.

## Notes
- See `spec.md` for API details and database schema definitions.
- Project successfully transitioned to Wechat2doc.
