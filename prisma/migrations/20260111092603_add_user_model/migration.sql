-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "feishuUserId" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "tokenExpiry" DATETIME,
    "lastLoginAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "accountName" TEXT,
    "publishDate" DATETIME,
    "originalUrl" TEXT NOT NULL,
    "localPath" TEXT,
    "thumbnailPath" TEXT,
    "feishuUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("accountName", "author", "createdAt", "feishuUrl", "id", "localPath", "originalUrl", "publishDate", "status", "thumbnailPath", "title", "updatedAt") SELECT "accountName", "author", "createdAt", "feishuUrl", "id", "localPath", "originalUrl", "publishDate", "status", "thumbnailPath", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_originalUrl_key" ON "Article"("originalUrl");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "User_feishuUserId_key" ON "User"("feishuUserId");
