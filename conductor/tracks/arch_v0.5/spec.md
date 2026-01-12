# Track Specification: Architecture Upgrade (V0.5)

## Goal
Migrate the underlying database from SQLite (local file) to MongoDB (server-hosted service) to support scalability, concurrency, and advanced aggregation features required for future community updates.

## Core Features
1.  **Database Migration**:
    -   Switch Prisma provider from `sqlite` to `mongodb`.
    -   Update `schema.prisma` to map IDs to MongoDB `ObjectId` format.
2.  **Data Migration Script**:
    -   Develop a utility to read data from `prod.db` (SQLite) and write to MongoDB.
    -   Preserve `User` and `Article` relationships.
3.  **Connection Management**:
    -   Configure robust connection pooling for MongoDB.
    -   Ensure server environment variables (`DATABASE_URL`) are updated.
4.  **Verification**:
    -   Ensure existing login (OAuth) and scrape (Conductor) flows work without code changes in logic.

## Technical Requirements
-   **ORM**: Continue using Prisma Client, but switch provider.
-   **Database**: MongoDB 7.0 (Existing on server).
-   **Schema Changes**:
    -   `id`: `Int` (autoincrement) -> `String` (ObjectId) @map("_id").
    -   Relations: Update foreign keys to String type.

## Risks & Mitigation
-   **ID Type Change**: SQLite uses Int IDs, MongoDB uses String ObjectIds.
    -   *Mitigation*: We must update all frontend/backend code that expects `number` IDs to expect `string`. This is a significant refactor.
    -   *Alternative*: Keep using Int IDs in MongoDB? Not recommended (no autoincrement support). We must bite the bullet and refactor to String IDs.

## Success Criteria
-   [ ] Prisma schema updated for MongoDB.
-   [ ] All API routes updated to handle String IDs.
-   [ ] Data migration script successfully transfers existing users and articles.
-   [ ] Application deploys and connects to MongoDB successfully.
