# Implementation Plan: Feishu Cloud Sync (V1.1)

This plan outlines the steps to implement the Feishu synchronization feature.

## Tasks

### Phase 1: Foundation & Auth
- [x] **Task 1.1**: Initialize `lib/feishu.ts`. Implement `FeishuClient` class with configuration loading from `.env`.
- [x] **Task 1.2**: Implement `getTenantAccessToken` method with basic in-memory caching (reuse token until expiry).
- [x] **Task 1.3**: Create a unit test/script `test-auth.ts` to verify token retrieval.

### Phase 2: Asset Management
- [x] **Task 2.1**: Implement `uploadFile` (for MD and Images) using `drive/v1/files/upload_all`.

### Phase 3: Synchronization Logic
- [x] **Task 3.1**: Create `bin/wsync.ts` CLI entry point.
- [x] **Task 3.2**: Implement the sync workflow:
    -   Implemented direct Markdown file upload and import.
    -   Added logic for image upload (experimental).
- [x] **Task 3.3**: Implement `createImportTask` and `pollImportStatus` in `FeishuClient`.

### Phase 4: Integration
- [x] **Task 4.1**: Finalize `wsync` command to accept an article directory, process it, and output the Feishu Cloud Document URL.
- [x] **Task 4.2**: Verify full flow with a real article.
    -   Verified text import works successfully.
    -   Document created: `https://my.feishu.cn/docx/QU2HdCCeDoyV61xET6wc2Ctsnbd`

## Notes
-   Documentation: https://open.feishu.cn/document/server-docs/docs/import-export/import-user-guide