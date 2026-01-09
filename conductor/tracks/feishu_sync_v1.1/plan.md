# Implementation Plan: Feishu Cloud Sync (V1.1)

This plan outlines the steps to implement the Feishu synchronization feature.

## Tasks

### Phase 1: Foundation & Auth
- [ ] **Task 1.1**: Initialize `lib/feishu.ts`. Implement `FeishuClient` class with configuration loading from `.env`.
- [ ] **Task 1.2**: Implement `getTenantAccessToken` method with basic in-memory caching (reuse token until expiry).
- [ ] **Task 1.3**: Create a unit test/script `test-auth.ts` to verify token retrieval.

### Phase 2: Asset Management
- [ ] **Task 2.1**: Implement `uploadImage(filePath, parentType, parentNode)` in `FeishuClient`. Note: For Docs, `parent_type` should be `docx_image` or similar, but for "import", we might just need the `file_token`. Actually, for Markdown import, images usually need to be uploaded first or embedded. *Refinement*: Feishu import often requires uploading the MD file + images. Let's research the best strategy. Strategy: Upload MD file + Upload Images -> Import. Or, if converting MD content to Blocks API.
    *   *Correction*: The simplest "Import" path for Feishu is uploading a file (MD) and calling `import`. However, local images in MD won't automatically work unless they are hosted URLs or packaged correctly.
    *   *Revised Task 2.1*: Implement `uploadFile` (for MD and Images) using `drive/v1/files/upload_all`.

### Phase 3: Synchronization Logic
- [ ] **Task 3.1**: Create `bin/wsync.ts` CLI entry point.
- [ ] **Task 3.2**: Implement the sync workflow:
    1.  Read the local Markdown file.
    2.  (Optional optimization) If Feishu Import supports local path resolution relative to a zip, that's complex.
    3.  *Alternative Strategy*: Use `turndown` or similar to parse, but we are *sending* to Feishu.
    4.  *Selected Strategy*: Upload the `.md` file directly. Feishu Import API supports `.md`.
        -   But what about images? Markdown usually references local `./assets/img.png`. Feishu import might not resolve these.
        -   **Investigation needed in Task 3.2**: If direct MD import fails for images, we will implement "Replace local image links with uploaded Feishu image URLs" before uploading the MD.
- [ ] **Task 3.3**: Implement `createImportTask` and `pollImportStatus` in `FeishuClient`.

### Phase 4: Integration
- [ ] **Task 4.1**: Finalize `wsync` command to accept an article directory, process it, and output the Feishu Cloud Document URL.
- [ ] **Task 4.2**: Verify full flow with a real article.

## Notes
-   Documentation: https://open.feishu.cn/document/server-docs/docs/import-export/import-user-guide
