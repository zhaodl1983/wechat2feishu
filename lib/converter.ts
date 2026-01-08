import TurndownService from 'turndown';

/**
 * Configure and return a Turndown instance for WeChat articles
 */
export function getTurndownService(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  });

  // Handle WeChat specific components
  // 1. Keep images but ensure they use standard markdown syntax
  turndownService.addRule('wechat-images', {
    filter: 'img',
    replacement: (_content, node) => {
      const img = node as HTMLImageElement;
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || 'image';
      return `![${alt}](${src})`;
    }
  });

  // 2. Handle sections/containers that WeChat uses for formatting
  turndownService.addRule('wechat-sections', {
    filter: ['section', 'div'],
    replacement: (content) => {
      return content + '\n\n';
    }
  });

  // 3. Ensure links are kept but cleaned up
  turndownService.addRule('wechat-links', {
    filter: 'a',
    replacement: (content, node) => {
      const a = node as HTMLAnchorElement;
      const href = a.getAttribute('href') || '';
      return `[${content}](${href})`;
    }
  });

  return turndownService;
}

/**
 * Converts HTML content to Markdown with Frontmatter
 */
export function convertToMarkdown(html: string, metadata: any): string {
  const turndownService = getTurndownService();
  const markdownContent = turndownService.turndown(html);

  // Clean title for frontmatter
  const safeTitle = (metadata.title || '').replace(/"/g, '\\"');

  const frontmatter = [
    '---',
    `title: "${safeTitle}"`, 
    `author: "${metadata.author || ''}"`, 
    `account: "${metadata.accountName || ''}"`, 
    `date: "${metadata.publishDate || ''}"`, 
    `url: "${metadata.url || ''}"`, 
    `thumbnail: "${metadata.coverImage || ''}"`, 
    '---',
    '',
    ''
  ].join('\n');

  return frontmatter + markdownContent;
}
