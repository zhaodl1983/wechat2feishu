# Track Specification: Feishu Cloud Sync (V1.1)

## Goal
Integrate with Feishu Open Platform to enable the synchronization of locally archived WeChat articles (Markdown) to Feishu Cloud Documents. This enhances the tool from a local archiver to a productivity-connected knowledge base builder.

## Core Features
1.  **Feishu Authentication**:
    - Securely manage App ID and App Secret via `.env`.
    - Automatically fetch and refresh `tenant_access_token`.
2.  **Asset Cloud Migration**:
    - Scan Markdown files for local image references.
    - Upload images to Feishu Drive (`drive:media:upload`).
    - Replace local paths with Feishu-compatible tokens/keys.
3.  **Document Import**:
    - Upload the processed Markdown file to Feishu Drive.
    - Trigger the asynchronous import task to convert Markdown to Feishu Doc (`docx`).
4.  **CLI Command (`wsync`)**:
    - New command to trigger the sync process for a specific article or batch.

## Architecture & Tech Stack
-   **Language**: TypeScript (Node.js)
-   **HTTP Client**: `axios` (Existing dependency)
-   **Config**: `dotenv` (New dependency)
-   **File System**: Node.js `fs/promises`
-   **Feishu API**:
    -   `POST /open-apis/auth/v3/tenant_access_token/internal`
    -   `POST /open-apis/drive/v1/medias/upload_all`
    -   `POST /open-apis/drive/v1/files/upload_all`
    -   `POST /open-apis/drive/v1/import_tasks`
    -   `GET /open-apis/drive/v1/import_tasks/{ticket}`

## Success Criteria
-   [ ] Able to authenticate and get a valid token.
-   [ ] Local images in a Markdown article are successfully uploaded to Feishu.
-   [ ] A new Feishu Document is created containing the article content and images.
-   [ ] The original local files remain intact (non-destructive).
