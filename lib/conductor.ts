import { scrapeWeChatArticle } from './scraper';
import { extractMetadata, extractContent } from './parser';
import { convertToMarkdown } from './converter';
import { localizeAssets } from './assets';
import { getUniqueArticleDir, saveMarkdown } from './storage';
import { FeishuClient } from './feishu';
import { prisma } from './db';
import { getValidUserAccessToken } from './user-token';
import path from 'path';
import fs from 'fs';



/**
 * PHASE 1: Server-First Processing
 * Scrapes, downloads assets locally (CAS), saves to DB/Filesystem.
 * Does NOT sync to Feishu automatically anymore.
 */
export async function processArticle(url: string, userId?: string) {
  // 1. Create or Update DB Record (Pending)
  let article = await prisma.article.upsert({
    where: { originalUrl: url },
    update: {
      status: 'crawling', // New status for clarity
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

    const articleDir = await getUniqueArticleDir(metadata.title, 'output');
    const initialMarkdown = convertToMarkdown(contentHtml, { ...metadata, url });

    // --- STEP B: LOCALIZE ASSETS (Server-First) ---
    // Always download images to local server using CAS
    // This ensures we own the data.
    console.log(`[Localize] Downloading assets to server...`);

    // localizeAssets now uses downloadImageCAS internally from our previous refactor
    // userId is needed for the function signature but effectively ignored by CAS logic if we changed it,
    // lets double check assets.ts. Actually we updated downloadImageOptimized to call downloadImageCAS. 
    // localizeAssets calls downloadImageOptimized. So we are good.
    const finalMarkdown = await localizeAssets(initialMarkdown, userId || 'anonymous', article.id);
    const filePath = await saveMarkdown(finalMarkdown, articleDir);

    // --- STEP C: SAVE SUCCCESS ---
    article = await prisma.article.update({
      where: { id: article.id },
      data: {
        localPath: filePath,
        content: finalMarkdown, // Save full markdown to DB for search/reader
        status: 'stored',       // New status: Ready on server
      },
    });

    console.log(`[Process] Article stored locally: ${article.id}`);
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
 * Takes a locally stored article and pushes it to Feishu.
 */
export async function syncArticleToFeishu(articleId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || !article.localPath || !article.content) {
    throw new Error('Article not found or not locally stored');
  }

  // Update status to syncing
  await prisma.article.update({ where: { id: articleId }, data: { status: 'syncing' } });

  try {
    const client = new FeishuClient();
    const userId = article.userId;

    // Determine Token (Logic preserved)
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

    // 2. Upload Images (We need to upload local CAS images to Feishu)
    // Parse the markdown stored in DB/File
    let content = article.content;
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    const replacements: { original: string, newUrl: string }[] = [];

    // Ensure Assets Folder in Feishu
    const assetsFolderToken = await client.ensureAssetsFolder(rootToken, token);

    while ((match = imageRegex.exec(content)) !== null) {
      const [fullMatch, alt, imgPath] = match;

      // If it's a local path (starts with /uploads), we need to resolve it
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
      } else if (imgPath.startsWith('http')) {
        // Should not happen if fully localized, but keep just in case
      }
    }

    for (const r of replacements) {
      content = content.replace(r.original, r.newUrl);
    }

    // 3. Upload MD
    content = content.replace(/^---\n([\s\S]*?)\n---\n/, ''); // Clean frontmatter
    const safeTitle = article.title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 100);
    // We need a temp file for upload
    const tempMdPath = path.join(path.dirname(article.localPath), `${safeTitle}_feishu.md`);
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
        status: 'synced', // New status
        feishuUrl: feishuUrl
      }
    });

    return { success: true, feishuUrl };

  } catch (error: any) {
    // Revert status to stored if sync fails
    await prisma.article.update({
      where: { id: articleId },
      data: { status: 'stored' } // Back to stored, not error
    });
    throw error;
  }
}

// Backward compatibility wrapper (deprecated but keeps existing unrelated routes working if any)
export async function conductorProcess(url: string, userId?: string) {
  const result = await processArticle(url, userId);
  // Auto-trigger sync for backward compatibility test?
  // For now, let's Auto-sync to minimize disruption for the USER testing
  // But in the final vision, this line will be removed.
  console.log('[Conductor] Auto-triggering sync for migration compatibility...');
  return await syncArticleToFeishu(result.articleId);
}