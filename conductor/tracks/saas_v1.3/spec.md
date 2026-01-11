# Track Specification: SaaS Service (V1.3)

## Goal
Transform the local tool into a multi-user SaaS platform by integrating Feishu OAuth 2.0. This allows users to login with their own accounts and save articles directly to their own Feishu space with full ownership.

## Core Features
1.  **Feishu OAuth 2.0 Login**:
    -   Implement "Login with Feishu" flow.
    -   Fetch user identity (Name, Avatar, UserID).
    -   Maintain user session via secure HTTP-only cookies.
2.  **Token Management & Encryption**:
    -   Store `user_access_token` and `refresh_token` in SQLite (for now).
    -   Encrypt tokens using AES-256-GCM before saving to disk.
    -   Automatic token refresh logic in background.
3.  **Ownership-based Archiving**:
    -   When a user is logged in, use their `user_access_token` for all Feishu API calls.
    -   New documents will be owned by the user, not the bot.
4.  **UI Enhancements**:
    -   Update Header to show user avatar and name.
    -   Implement a logout dropdown menu.
    -   Filter history list by `userId`.

## Technical Requirements
-   **Authentication**: Custom JWT-based session management or `next-auth`.
-   **Encryption**: Node.js `crypto` module (AES-256-GCM).
-   **Database Model**:
    -   `User`: id, feishuUserId, name, avatar, encryptedAccessToken, encryptedRefreshToken, lastLoginAt.
    -   `Article`: Add `userId` field to establish relation.
-   **Feishu APIs**:
    -   OAuth endpoints: `/authen/v1/index` (authorization) and `/authen/v1/access_token`.
    -   User info: `/authen/v1/user_info`.

## Success Criteria
-   [ ] User can successfully login via Feishu scan.
-   [ ] User avatar and name appear in the top right.
-   [ ] Saved documents appear in the user's "My Space" and can be deleted by the user.
-   [ ] Tokens are stored in an encrypted format in the database.
-   [ ] User can log out, which clears the session and tokens.
