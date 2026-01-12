# Implementation Plan: Architecture Upgrade (V0.5)

## Tasks

### Phase 1: Schema & Type Refactoring (Local)
- [ ] **Task 1.1**: Update `prisma/schema.prisma` to use `provider = "mongodb"` and `String @id @default(auto()) @map("_id") @db.ObjectId`.
- [ ] **Task 1.2**: Refactor TypeScript interfaces (`Article`, `User`) to use `string` for IDs.
- [ ] **Task 1.3**: Audit and update all API routes (`app/api/...`) to handle String IDs (remove `parseInt`).
- [ ] **Task 1.4**: Audit and update frontend components (`HistoryList.tsx`) to handle String IDs.

### Phase 2: Data Migration (Scripting)
- [ ] **Task 2.1**: Create a migration script `bin/migrate-sqlite-to-mongo.ts`.
    -   Step 1: Read from SQLite (using raw `sqlite3` or a temporary Prisma client).
    -   Step 2: Write to MongoDB (using the new Prisma client).
    -   Step 3: Handle ID mapping (Int -> ObjectId is tricky, maybe keep Int as a legacy field or just create new ObjectIds and update logic?).
    -   *Strategy*: Create new ObjectIds. The old Int IDs are internal only and not exposed in URLs (except history API).

### Phase 3: Infrastructure & Deployment
- [ ] **Task 3.1**: Local verification: Spin up a local MongoDB (Docker or system) to test.
- [ ] **Task 3.2**: Prepare server: Ensure MongoDB auth is configured (optional but recommended) or connection string is ready.
- [ ] **Task 3.3**: Deploy code and run migration script on server.

## Notes
-   **Breaking Change**: This upgrade fundamentally changes the ID structure.
-   **Backup**: Must backup `prod.db` on server before starting.
