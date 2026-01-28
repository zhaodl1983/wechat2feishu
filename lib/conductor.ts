import { scrapeWeChatArticle } from './scraper';
import { extractMetadata, extractContent } from './parser';
import { convertToMarkdown } from './converter';
import { localizeAssets } from './assets';
import { FeishuClient } from './feishu';
import { prisma } from './db';
import { getValidUserAccessToken } from './user-token';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * PHASE 1: Server-First Processing
 * Scrapes, downloads assets to CAS (public/uploads), saves to DB.
 * No longer saves to 'output/' folder.
 */
export async function processArticle(url: string, userId?: string) {
  // 1. Create or Update DB Record (Pending)
  let article = await prisma.article.upsert({
    where: { originalUrl: url },
    update: {
      status: 'crawling',
      userId: userId || null,
      updatedAt: new Date(),
    },
    create: {
      title: 'Processing...',
      originalUrl: url,
      status: 'crawling',
      userId: userId || null,
    },
  });

  try {
    // --- STEP A: SCRAPE ---
    console.log(`[Scrape] Starting: ${url}`);
    const { html } = await scrapeWeChatArticle(url);
    const metadata = extractMetadata(html);
    const contentHtml = extractContent(html);

    // Update Metadata
    article = await prisma.article.update({
      where: { id: article.id },
      data: {
        title: metadata.title,
        author: metadata.author,
        accountName: metadata.accountName,
        publishDate: metadata.publishDate ? new Date(metadata.publishDate) : null,
      },
    });

    const initialMarkdown = convertToMarkdown(contentHtml, { ...metadata, url });

    // --- STEP B: LOCALIZE ASSETS (Server-First) ---
    // Download images to CAS (public/uploads)
    console.log(`[Localize] Downloading assets to CAS storage...`);
    const finalMarkdown = await localizeAssets(initialMarkdown, userId || 'anonymous', article.id);

    // --- STEP C: SAVE SUCCESS ---
    article = await prisma.article.update({
      where: { id: article.id },
      data: {
        localPath: null, // Legacy: no longer used
        content: finalMarkdown,
        status: 'stored',
      },
    });

    console.log(`[Process] Article stored in DB: ${article.id}`);
    return { success: true, articleId: article.id, status: 'stored' };

  } catch (error: any) {
    console.error('[Conductor] Process Error:', error);
    await prisma.article.update({
      where: { id: article.id },
      data: { status: 'error' },
    });
    throw error;
  }
}

/**
 * PHASE 2: Optional Sync
 * Takes a DB-stored article and pushes it to Feishu.
 */
export async function syncArticleToFeishu(articleId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || !article.content) {
    throw new Error('Article not found or has no content');
  }

  // Update status to syncing
  await prisma.article.update({ where: { id: articleId }, data: { status: 'syncing' } });

  try {
    const client = new FeishuClient();
    const userId = article.userId;

    // Determine Token
    let token: string = '';
    if (userId) {
      try {
        token = await getValidUserAccessToken(userId);
      } catch (error) {
        console.log(`[Sync] User ${userId} fallback to Tenant Token.`);
      }
    }
    if (!token) token = await client.getTenantAccessToken();

    // 1. Get Root Folder
    const rootToken = await client.getRootFolderToken(token);

    // 2. Upload Images to Feishu
    let content = article.content;
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    const replacements: { original: string, newUrl: string }[] = [];

    const assetsFolderToken = await client.ensureAssetsFolder(rootToken, token);

    while ((match = imageRegex.exec(content)) !== null) {
      const [fullMatch, alt, imgPath] = match;
      if (imgPath.startsWith('/uploads')) {
        const absImgPath = path.join(process.cwd(), 'public', imgPath);
        if (fs.existsSync(absImgPath)) {
          try {
            const fileToken = await client.uploadFile(absImgPath, assetsFolderToken, 'explorer', token);
            replacements.push({ original: imgPath, newUrl: fileToken });
          } catch (e: any) {
            console.error(`[Sync] Upload failed: ${imgPath}`, e.message);
          }
        }
      }
    }

    for (const r of replacements) {
      content = content.replace(r.original, r.newUrl);
    }

    // 3. Upload MD
    content = content.replace(/^---\n([\s\S]*?)\n---\n/, ''); // Clean frontmatter
    const safeTitle = article.title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);

    // Use System Tmp for sync process
    const tempMdPath = path.join(os.tmpdir(), `feishu_sync_${article.id}_${Date.now()}.md`);
    fs.writeFileSync(tempMdPath, content);

    const mdToken = await client.uploadFile(tempMdPath, rootToken, 'explorer', token);
    const ticket = await client.createImportTask(mdToken, 'md', rootToken, token);

    // 4. Poll
    let feishuUrl = '';
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await client.getImportResult(ticket, token);
      if (status.job_status === 0) {
        feishuUrl = status.url;
        break;
      } else if (status.job_status > 2) {
        throw new Error(`Feishu Import Failed: ${status.job_error_msg}`);
      }
    }

    if (fs.existsSync(tempMdPath)) fs.unlinkSync(tempMdPath);

    // 5. Success
    await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'synced',
        feishuUrl: feishuUrl
      }
    });

    return { success: true, feishuUrl };

  } catch (error: any) {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: 'stored' }
    });
    throw error;
  }
}

// Backward compatibility wrapper
export async function conductorProcess(url: string, userId?: string) {
  const result = await processArticle(url, userId);
  console.log('[Conductor] Auto-syncing for migration compatibility...');
  return await syncArticleToFeishu(result.articleId);
}