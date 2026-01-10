import { scrapeWeChatArticle } from './scraper';
import { extractMetadata, extractContent } from './parser';
import { convertToMarkdown } from './converter';
import { localizeAssets } from './assets';
import { getUniqueArticleDir, saveMarkdown } from './storage';
import { FeishuClient } from './feishu';
import { prisma } from './db';
import path from 'path';
import fs from 'fs';

export async function conductorProcess(url: string) {
  // 1. Create DB Record
  let article = await prisma.article.create({
    data: {
      title: 'Processing...',
      originalUrl: url,
      status: 'pending',
    },
  });

  try {
    // --- STEP A: SCRAPE ---
    const { html } = await scrapeWeChatArticle(url);
    const metadata = extractMetadata(html);
    const contentHtml = extractContent(html);

    // Update DB with title
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
    const finalMarkdown = await localizeAssets(initialMarkdown, articleDir);
    const filePath = await saveMarkdown(finalMarkdown, articleDir);

    // Update DB with local path
    article = await prisma.article.update({
      where: { id: article.id },
      data: { localPath: filePath },
    });

    // --- STEP B: SYNC TO FEISHU ---
    const client = new FeishuClient();
    const rootToken = await client.getRootFolderToken();

    // Upload Images & Replace Links (Simple Regex Approach)
    let content = fs.readFileSync(filePath, 'utf-8');
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    const replacements: {original: string, newUrl: string}[] = [];
    
    // Scan for images to upload
    while ((match = imageRegex.exec(content)) !== null) {
        const [fullMatch, alt, imgPath] = match;
        if (imgPath.startsWith('http')) continue;
        
        const absImgPath = path.resolve(articleDir, imgPath);
        if (fs.existsSync(absImgPath)) {
             try {
                 const fileToken = await client.uploadFile(absImgPath, rootToken, 'explorer');
                 replacements.push({ original: imgPath, newUrl: fileToken }); 
             } catch (e) {
                 console.error(`Failed to upload image: ${imgPath}`);
             }
        }
    }
    
    for (const r of replacements) {
        content = content.replace(r.original, r.newUrl);
    }
    
    const tempMdPath = path.join(articleDir, `feishu_sync_${Date.now()}.md`);
    fs.writeFileSync(tempMdPath, content);
    
    const mdToken = await client.uploadFile(tempMdPath, rootToken, 'explorer');
    const ticket = await client.createImportTask(mdToken, 'md', rootToken);
    
    // Poll for result
    let feishuUrl = '';
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const status = await client.getImportResult(ticket);
        if (status.job_status === 0) {
            feishuUrl = status.url;
            break;
        } else if (status.job_status > 2) {
             throw new Error(`Feishu Import Failed: Status ${status.job_status}`);
        }
    }

    // Cleanup
    if (fs.existsSync(tempMdPath)) fs.unlinkSync(tempMdPath);

    if (!feishuUrl) throw new Error('Feishu Import Timed Out');

    // Update DB Success
    await prisma.article.update({
      where: { id: article.id },
      data: { 
        status: 'completed',
        feishuUrl: feishuUrl,
      },
    });

    return { success: true, articleId: article.id, feishuUrl };

  } catch (error: any) {
    console.error('Conductor Process Error:', error);
    await prisma.article.update({
      where: { id: article.id },
      data: { status: 'error' },
    });
    throw error;
  }
}
