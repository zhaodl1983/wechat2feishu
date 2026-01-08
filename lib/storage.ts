import fs from 'fs/promises';
import path from 'path';

/**
 * Ensures a unique directory name for an article
 * If Title already exists, it creates Title_1, Title_2, etc.
 */
export async function getUniqueArticleDir(title: string, baseDir: string = 'output'): Promise<string> {
  // Sanitize title for file system
  const sanitizedTitle = title.replace(/[\\/:*?"<>|]/g, '_').trim();
  let articleDir = path.join(baseDir, sanitizedTitle);
  let counter = 1;

  await fs.mkdir(baseDir, { recursive: true });

  while (true) {
    try {
      await fs.access(articleDir);
      // Directory exists, try next name
      articleDir = path.join(baseDir, `${sanitizedTitle}_${counter}`);
      counter++;
    } catch {
      // Directory does not exist, safe to use
      break;
    }
  }

  await fs.mkdir(articleDir, { recursive: true });
  return articleDir;
}

/**
 * Saves the final Markdown file to the article directory
 */
export async function saveMarkdown(markdown: string, articleDir: string, filename: string = 'index.md'): Promise<string> {
  const filePath = path.join(articleDir, filename);
  await fs.writeFile(filePath, markdown, 'utf-8');
  return filePath;
}

