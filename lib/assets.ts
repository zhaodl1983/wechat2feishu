import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Downloads an image from a URL, compresses it, and saves it to the user's upload directory
 * @returns The public URL path to the saved image
 */
import crypto from 'crypto';

/**
 * Downloads an image from a URL, compresses it, and saves it using CAS (Content-Addressable Storage)
 * Path format: public/uploads/{YYYY}/{MM}/{hash}.webp
 * @returns The public URL path to the saved image
 */
export async function downloadImageCAS(
  url: string
): Promise<string | null> {
  try {
    // 1. Download Buffer
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const buffer = Buffer.from(response.data);

    // 2. Calculate Hash (SHA-256)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 32);

    // 3. Determine Directory (YYYY/MM)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const publicBase = 'public';
    const uploadBase = 'uploads';
    const relativeDir = path.join(uploadBase, String(year), month);
    const fullUploadDir = path.join(process.cwd(), publicBase, relativeDir);

    await fs.mkdir(fullUploadDir, { recursive: true });

    // 4. Check if exists (Deduplication)
    const filename = `${hash}.webp`;
    const fullPath = path.join(fullUploadDir, filename);
    const publicUrl = `/${uploadBase}/${year}/${month}/${filename}`;

    try {
      await fs.access(fullPath);
      // Exists! Return immediately
      return publicUrl;
    } catch {
      // Doesn't exist, proceed to save
    }

    // 5. Convert & Save
    await sharp(buffer)
      .resize(1200, undefined, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80, effort: 6 })
      .toFile(fullPath);

    return publicUrl;

  } catch (error: any) {
    console.error(`\x1b[33m[Asset Warning]\x1b[0m Failed to download image ${url}:`, error.message);
    return null;
  }
}

// Deprecated: kept for backward compatibility if needed, but we should switch to CAS
export async function downloadImageOptimized(
  url: string,
  userId: string,
  articleId: string
): Promise<string | null> {
  return downloadImageCAS(url);
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
        downloadImageCAS(originalUrl).then(localPath => ({
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
