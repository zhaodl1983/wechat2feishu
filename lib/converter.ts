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
      let alt = img.getAttribute('alt') || 'image';

      // Detect WeChat Emojis via multiple URL patterns
      const emojiPatterns = [
        'wx_fed/wechat_emotion',  // 微信表情包 (官方)
        '/emoji/',                // 通用 emoji 路径
        '/we-emoji/',             // 新版微信表情
        '/emotion/',              // emotion 目录
        'res.wx.qq.com.*expression',  // 表情资源
        'mpres/htmledition/images/icon/emotion',  // 旧版表情
      ];

      const isEmoji = emojiPatterns.some(pattern =>
        pattern.includes('*')
          ? new RegExp(pattern).test(src)
          : src.includes(pattern)
      );

      // Also check for small image dimensions (typical for inline emojis)
      const dataW = img.getAttribute('data-w');
      const dataRatio = img.getAttribute('data-ratio');
      const isSmallEmojiSize = dataW && parseInt(dataW) <= 120;

      if (isEmoji || isSmallEmojiSize) {
        alt = `wx_emoji_${alt}`;
      }

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

  // Return only the markdown content, as metadata is stored in DB/State
  return markdownContent;
}
