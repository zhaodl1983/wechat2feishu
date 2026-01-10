import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Downloads an image from a URL and saves it as WebP
 * @returns The local relative path to the saved image
 */
export async function downloadImageAsWebP(
  url: string, 
  articleDir: string, 
  assetsSubDir: string = 'assets'
): Promise<string | null> {
  try {
    const assetsPath = path.join(articleDir, assetsSubDir);
    await fs.mkdir(assetsPath, { recursive: true });

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Generate a unique filename
    const filename = `${uuidv4()}.webp`;
    const fullPath = path.join(assetsPath, filename);

    // Convert to WebP using sharp
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(fullPath);

    // Return the relative path for use in Markdown
    return path.join('.', assetsSubDir, filename);
  } catch (error: any) {
    console.error(`\x1b[33m[Asset Warning]\x1b[0m Failed to download image ${url}:`, error.message);
    return null; // Return null to allow caller to handle placeholder
  }
}

/**
 * Processes all image links in Markdown content
 */
export async function localizeAssets(
  markdown: string, 
  articleDir: string
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
        downloadImageAsWebP(originalUrl, articleDir).then(localPath => ({
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
    } else {
      // If download failed, add a warning placeholder
      localizedMarkdown = localizedMarkdown.split(res.original).join('REPLACE_WITH_PLACEHOLDER_FAILED_DOWNLOAD');
    }
  }

  return localizedMarkdown;
}
