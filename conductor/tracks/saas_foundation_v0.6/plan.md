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

## Notes
- See `spec.md` for API details and database schema definitions.
- Project successfully transitioned to Wechat2doc.
