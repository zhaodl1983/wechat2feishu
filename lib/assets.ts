import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Downloads an image from a URL, compresses it, and saves it to the user's upload directory
 * @returns The public URL path to the saved image
 */
export async function downloadImageOptimized(
  url: string, 
  userId: string,
  articleId: string
): Promise<string | null> {
  try {
    const publicBase = 'public';
    const uploadBase = 'uploads';
    const relativePath = path.join(uploadBase, userId, articleId);
    const fullUploadPath = path.join(process.cwd(), publicBase, relativePath);
    
    await fs.mkdir(fullUploadPath, { recursive: true });

    const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const buffer = Buffer.from(response.data);

    // Generate a unique filename with .webp extension
    const filename = `${uuidv4()}.webp`;
    const fullPath = path.join(fullUploadPath, filename);

    // Convert to WebP using sharp with optimization
    await sharp(buffer)
      .resize(1200, undefined, { // Max width 1200px, height proportional
          withoutEnlargement: true,
          fit: 'inside'
      })
      .webp({ quality: 80, effort: 6 }) // High compression effort to save space
      .toFile(fullPath);

    // Return the URL path starting from /uploads
    return `/${uploadBase}/${userId}/${articleId}/${filename}`;
  } catch (error: any) {
    console.error(`\x1b[33m[Asset Warning]\x1b[0m Failed to download image ${url}:`, error.message);
    return null;
  }
}

/**
 * Processes all image links in Markdown content
 */
export async function localizeAssets(
  markdown: string, 
  userId: string,
  articleId: string
): Promise<string> {
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  let localizedMarkdown = markdown;
  const downloadPromises: Promise<{ original: string, local: string | null }>[] = [];

  // Find all image links
  while ((match = imgRegex.exec(markdown)) !== null) {
    const originalUrl = match[2];
    if (originalUrl.startsWith('http')) {
      downloadPromises.push(
        downloadImageOptimized(originalUrl, userId, articleId).then(localPath => ({
          original: originalUrl,
          local: localPath
        }))
      );
    }
  }

  // Wait for all downloads to finish
  const results = await Promise.all(downloadPromises);

  // Replace original URLs with local paths
  for (const res of results) {
    if (res.local) {
      localizedMarkdown = localizedMarkdown.split(res.original).join(res.local);
    }
  }

  return localizedMarkdown;
}
