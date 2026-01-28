import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const sqlite = new Database('prod.db'); // Assumes running in dir with prod.db
const mongo = new PrismaClient();

async function migrate() {
    console.log('🚀 Starting Migration: SQLite -> MongoDB');

    // 1. Users
    console.log('--- Migrating Users ---');
    const users = sqlite.prepare('SELECT * FROM User').all();
    const userIdMap = new Map<number, string>(); // Old ID -> New ID

    for (const u of users as any[]) {
        try {
            // Check if exists (upsert logic simulation)
            const existing = await mongo.user.findFirst({ where: { feishuUserId: u.feishuUserId } });
            if (existing) {
                userIdMap.set(u.id, existing.id);
                console.log(`User exists, mapped: ${u.id} -> ${existing.id}`);
                continue;
            }

            const newUser = await mongo.user.create({
                data: {
                    feishuUserId: u.feishuUserId,
                    name: u.name,
                    avatarUrl: u.avatarUrl,
                    encryptedAccessToken: u.encryptedAccessToken,
                    encryptedRefreshToken: u.encryptedRefreshToken,
                    tokenExpiry: u.tokenExpiry ? new Date(u.tokenExpiry) : null,
                    lastLoginAt: new Date(u.lastLoginAt),
                    createdAt: new Date(u.createdAt),
                    updatedAt: new Date(u.updatedAt)
                }
            });
            userIdMap.set(u.id, newUser.id);
            console.log(`User created: ${u.id} -> ${newUser.id} (${u.name})`);
        } catch (e: any) {
            console.error(`Failed to migrate user ${u.name}:`, e.message);
        }
    }

    // 2. Articles
    console.log('--- Migrating Articles ---');
    const articles = sqlite.prepare('SELECT * FROM Article').all();

    for (const a of articles as any[]) {
        try {
            // Check existence by originalUrl (using findFirst as originalUrl is no longer unique)
            const existing = await mongo.article.findFirst({ where: { originalUrl: a.originalUrl } });
            if (existing) {
                console.log(`Article exists: ${a.title}`);
                continue;
            }

            let newUserId = undefined;
            if (a.userId) {
                newUserId = userIdMap.get(a.userId);
            }

            await mongo.article.create({
                data: {
                    title: a.title,
                    author: a.author,
                    accountName: a.accountName,
                    publishDate: a.publishDate ? new Date(a.publishDate) : null,
                    originalUrl: a.originalUrl,
                    localPath: a.localPath,
                    thumbnailPath: a.thumbnailPath,
                    feishuUrl: a.feishuUrl,
                    status: a.status,
                    createdAt: new Date(a.createdAt),
                    updatedAt: new Date(a.updatedAt),
                    userId: newUserId // Link to new User ID
                }
            });
            console.log(`Article migrated: ${a.title}`);
        } catch (e: any) {
            console.error(`Failed to migrate article ${a.title}:`, e.message);
        }
    }

    console.log('✅ Migration Complete!');
}

migrate()
    .catch(e => console.error(e))
    .finally(async () => {
        await mongo.$disconnect();
        sqlite.close();
    });
