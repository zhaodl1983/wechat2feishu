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

export async function conductorProcess(url: string, userId?: number) {
  // 1. Create or Update DB Record
  let article = await prisma.article.upsert({
    where: { originalUrl: url },
    update: {
        status: 'pending',
        userId: userId || null, 
        updatedAt: new Date(),
    },
    create: {
      title: 'Processing...',
      originalUrl: url,
      status: 'pending',
      userId: userId || null,
    },
  });

  try {
    // --- STEP A: SCRAPE ---
    console.log(`[Scrape] Starting: ${url}`);
    const { html } = await scrapeWeChatArticle(url);
    const metadata = extractMetadata(html);
    const contentHtml = extractContent(html);

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
    
    // Check if we should use Image Proxy (Production Mode)
    // Relaxed check: Just verify if BASE_URL is present
    const useProxy = !!process.env.NEXT_PUBLIC_BASE_URL;
    console.log(`[Sync] Proxy Check: BASE_URL=${process.env.NEXT_PUBLIC_BASE_URL}, useProxy=${useProxy}`);
    
    let finalMarkdown = initialMarkdown;
    let filePath = '';

    if (useProxy) {
        console.log(`[Sync] Production mode detected. Using Image Proxy, skipping local asset download.`);
        // Just save the markdown with original links for now
        filePath = await saveMarkdown(initialMarkdown, articleDir);
    } else {
        finalMarkdown = await localizeAssets(initialMarkdown, articleDir);
        filePath = await saveMarkdown(finalMarkdown, articleDir);
    }

    article = await prisma.article.update({
      where: { id: article.id },
      data: { localPath: filePath },
    });

    // --- STEP B: SYNC TO FEISHU ---
    const client = new FeishuClient();
    
    // Determine Token
    let token: string;
    if (userId) {
        token = await getValidUserAccessToken(userId);
        console.log(`[Sync] Using User Access Token (ID: ${userId})`);
    } else {
        token = await client.getTenantAccessToken();
        console.log(`[Sync] Using Tenant Token (Anonymous mode)`);
    }
    
    // 1. Get Root Folder
    const rootToken = await client.getRootFolderToken(token);
    console.log(`[Sync] Root Folder Token: ${rootToken}`);
    
    // 1.1 Ensure Assets Folder (Only needed if NOT using proxy)
    let assetsFolderToken = '';
    if (!useProxy) {
        assetsFolderToken = await client.ensureAssetsFolder(rootToken, token);
        console.log(`[Sync] Assets Folder Token: ${assetsFolderToken}`);
    }

    // 2. Upload Images & Replace Links
    let content = fs.readFileSync(filePath, 'utf-8');
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    const replacements: {original: string, newUrl: string}[] = [];
    
    while ((match = imageRegex.exec(content)) !== null) {
        const [fullMatch, alt, imgPath] = match;
        
        // Case A: Remote URL (Proxy Mode)
        if (imgPath.startsWith('http')) {
             if (useProxy) {
                 // Use pseudo-static URL to trick Feishu importer
                 // Format: /api/image-proxy/<ENCODED_URL>/image.jpg
                 const proxyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/image-proxy/${encodeURIComponent(imgPath)}/image.jpg`;
                 replacements.push({ original: imgPath, newUrl: proxyUrl });
             }
             continue;
        }
        
        // Case B: Local File (Upload Mode)
        if (!useProxy) {
            const absImgPath = path.resolve(articleDir, imgPath);
            if (fs.existsSync(absImgPath)) {
                 try {
                     const fileToken = await client.uploadFile(absImgPath, assetsFolderToken, 'explorer', token);
                     replacements.push({ original: imgPath, newUrl: fileToken }); 
                 } catch (e: any) {
                     console.error(`[Sync] Failed to upload image ${imgPath}: ${e.message}`);
                 }
            }
        }
    }
    
    for (const r of replacements) {
        content = content.replace(r.original, r.newUrl);
    }

    // 2.5 Clean Redundant Frontmatter for Feishu
    // Remove the --- ... --- block at the start of the file
    content = content.replace(/^---\n([\s\S]*?)\n---\n/, '');
    
    // 3. Upload MD with Correct Title
    // Sanitize title for filename
    const safeTitle = metadata.title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 100);
    const tempMdPath = path.join(articleDir, `${safeTitle}.md`);
    fs.writeFileSync(tempMdPath, content);
    
    console.log(`[Sync] Uploading processed Markdown: ${safeTitle}.md`);
    const mdToken = await client.uploadFile(tempMdPath, rootToken, 'explorer', token);
    
    // 4. Create Import Task
    console.log(`[Sync] Creating import task...`);
    const ticket = await client.createImportTask(mdToken, 'md', rootToken, token);
    
    // 5. Poll for result
    let feishuUrl = '';
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const status = await client.getImportResult(ticket, token);
        console.log(`[Sync] Polling status: ${status.job_status}`);
        if (status.job_status === 0) {
            feishuUrl = status.url;
            break;
        } else if (status.job_status > 2) {
             throw new Error(`Feishu Import Failed: Status ${status.job_status} - ${status.job_error_msg}`);
        }
    }

    if (fs.existsSync(tempMdPath)) fs.unlinkSync(tempMdPath);
    if (!feishuUrl) throw new Error('Feishu Import Timed Out');

    // 6. Update DB Success
    await prisma.article.update({
      where: { id: article.id },
      data: { 
        status: 'completed',
        feishuUrl: feishuUrl,
      },
    });

    console.log(`[Sync] Success! URL: ${feishuUrl}`);
    return { success: true, articleId: article.id, feishuUrl };

  } catch (error: any) {
    console.error('[Conductor] Process Error:', error);
    await prisma.article.update({
      where: { id: article.id },
      data: { status: 'error' },
    });
    throw error;
  }
}