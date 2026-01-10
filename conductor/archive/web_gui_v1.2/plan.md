# Implementation Plan: Web GUI (V1.2)

## Tasks

### Phase 1: Data Schema & API
- [x] **Task 1.1**: Update `prisma/schema.prisma` to add `Article` model for tracking history (Title, Date, URL, Status, FeishuUrl).
- [x] **Task 1.2**: Initialize Prisma and run migrations.
- [x] **Task 1.3**: Implement `GET /api/history` and `POST /api/sync` API routes.

### Phase 2: High-Fidelity UI Implementation
- [x] **Task 2.1**: Implement the **Header** (Logo + Login button).
- [x] **Task 2.2**: Implement the **Hero Section** (Title, Subtitle, and the custom URL Input + Button).
- [x] **Task 2.3**: Implement the **History List** (Table layout matching the design).
- [x] **Task 2.4**: Implement the **Footer**.

### Phase 3: Logic Integration
- [x] **Task 3.1**: Connect the "一键转存" button to the `/api/sync` endpoint.
- [x] **Task 3.2**: In the backend, chain the existing `scraper` and `feishu` logic to complete a full "Grab -> Sync" flow.
- [x] **Task 3.3**: Ensure the History List refreshes after a successful sync.

### Phase 4: Verification
- [x] **Task 4.1**: Test with real WeChat URLs.
- [x] **Task 4.2**: Verify pixel-perfect alignment with `screen.png`.

## Notes
-   For V1.2, we will keep the "Background Process" simple: The API route will trigger the async function but won't wait for it (fire-and-forget), while updating the DB. Next.js serverless functions in a local dev environment usually allow this, but for production (V1.3), we might need a proper queue (BullMQ/Redis). For V1.2 Local, in-memory or loose async is fine.
