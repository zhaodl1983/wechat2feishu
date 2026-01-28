# Technical Specification: Community & Media (V0.7)

## 1. Overview
Version 0.7 focuses on transforming Wechat2doc from a personal utility into a structured knowledge base with community features. It introduces folder management, enhanced media support, and social sharing capabilities.

## 2. Core Features

### 2.1 Structure Management (Folders & Inbox)
-   **Philosophy**: "Physical Singleton, Logical Organization". Articles are physically unique per user but can be logically organized.
-   **Inbox**: Default view for all newly captured articles (`folderId: null`).
-   **Folders**:
    -   Two-level hierarchy limit (Root -> Child -> Article).
    -   User-defined folders with CRUD operations.
    -   Virtual folders: "Favorites" and "Trash" (Soft delete).
-   **Interaction**: Drag-and-drop support in Sidebar for organizing articles into folders.

### 2.2 Lightweight Video Support
-   **Strategy**: "Embed & Placeholder" (No physical storage).
-   **Tencent Video**: Detect iframe/vid and render the official Tencent player.
-   **Native MP4**: Detect video tags, extract poster/thumbnail, and render a placeholder with a "View Original" link.

### 2.3 Value Micro-feedback
-   **Location**: Top of Dashboard (above the article list).
-   **Content**: "Welcome back, [User]. You have guarded [Count] articles, accumulating [WordCount] words of knowledge."
-   **Visual**: Minimalist, text-centric design with subtle emphasis on numbers.

### 2.4 Anonymous Sharing (Share Snapshot)
-   **Mechanism**: Generate a unique, time-limited public link for an article.
-   **URL Structure**: `/s/[hash]` (e.g., `w2d.chat/s/abc123xyz`).
-   **Expiry**: Links expire automatically after 7 days to conserve resources.
-   **Access**: Public read-only access; images proxy-served to bypass hotlink protection.
-   **Branding**: Footer contains "Powered by Wechat2doc" to drive growth.

### 2.5 Data Export
-   **Markdown**: Download ZIP containing `.md` file and local assets.
-   **PDF**: Browser-native print styling (`@media print`) for pixel-perfect PDF generation.
-   **Docx**: Client-side conversion (e.g., `html-docx-js`) for offline editing.

## 3. Data Model Changes

### 3.1 Folder Model
New model to manage user-defined organization.

```prisma
model Folder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  parentId  String?  @db.ObjectId // For 2-level hierarchy
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  articles  Article[]
  
  // Self-relation for hierarchy
  parent    Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children  Folder[] @relation("FolderHierarchy")

  @@index([userId])
}
```

### 3.2 Article Model Updates
Add fields for organization and sharing.

```prisma
model Article {
  // ... existing fields ...
  folderId      String?   @db.ObjectId
  isFavorite    Boolean   @default(false)
  isDeleted     Boolean   @default(false) // Soft delete for Trash
  deletedAt     DateTime? // For auto-cleanup policy
  
  // Sharing
  shareHash     String?   @unique // The unique slug for sharing
  shareExpires  DateTime? // Expiry timestamp

  folder        Folder?   @relation(fields: [folderId], references: [id])
  
  // ... relations ...
}
```

## 4. API Design

### 4.1 Folder Management
-   `GET /api/folders`: List all folders for current user (tree structure).
-   `POST /api/folders`: Create new folder.
-   `PATCH /api/folders/[id]`: Rename or move folder.
-   `DELETE /api/folders/[id]`: Delete folder (articles move to Inbox).

### 4.2 Article Organization
-   `PATCH /api/articles/[id]/move`: Move article to folder (or Inbox).
-   `PATCH /api/articles/[id]/favorite`: Toggle favorite status.
-   `PATCH /api/articles/[id]/trash`: Soft delete / Restore.

### 4.3 Sharing
-   `POST /api/articles/[id]/share`: Generate/Renew share link (sets hash & expiry).
-   `DELETE /api/articles/[id]/share`: Revoke share link.
-   `GET /api/share/[hash]`: Public endpoint to fetch shared article content (middleware protected for rate limits).

### 4.4 Stats
-   `GET /api/user/stats`: Fetch personal "value feedback" stats (count, word count).

## 5. UI/UX Requirements

### 5.1 Sidebar
-   **System Section**: Inbox (Badge), Favorites, Trash.
-   **Folders Section**: Collapsible tree view. Support drag-over to open.
-   **Droppable Areas**: All folders and system lists should accept dropped articles.

### 5.2 Article View
-   **Share Toggle**: Switch in header to enable/disable sharing.
-   **Export Menu**: Dropdown for MD/PDF/Docx export actions.
-   **Video Player**: Adaptive rendering for detected video content.

## 6. Implementation Phases

### Phase 1: Database & Backend (Structure)
-   Update Prisma Schema.
-   Implement Folder API.
-   Update Article API for organization fields.

### Phase 2: Sidebar & Drag-and-Drop (Frontend)
-   Refactor Sidebar to support Folders.
-   Implement `dnd-kit` for drag interactions.
-   Build Folder management modals (Create/Rename).

### Phase 3: Sharing & Export (Features)
-   Implement Share API & Public View (`/s/[hash]`).
-   Implement Export logic (Client-side).

### Phase 4: Video & Feedback (Polish)
-   Implement Video placeholder/embed logic.
-   Add Value Feedback to Dashboard.
