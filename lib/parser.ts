import * as cheerio from 'cheerio';

export interface ArticleMetadata {
  title: string;
  author: string;
  accountName: string;
  publishDate: string;
  coverImage: string;
}

/**
 * Extracts metadata from WeChat article HTML
 */
export function extractMetadata(html: string): ArticleMetadata {
  const $ = cheerio.load(html);

  // WeChat usually stores metadata in specific variables or tags
  const title = $('#activity-name').text().trim() || $('meta[property="og:title"]').attr('content') || '';
  const author = $('#js_name').text().trim() || $('#author').text().trim() || '';
  const accountName = $('#js_name').text().trim() || $('meta[property="og:site_name"]').attr('content') || '';
  
  // Publish date is often found in scripts or specific meta tags
  // For a reliable extraction, we look for common patterns
  let publishDate = '';
  const dateMatch = html.match(/var\s+publish_time\s*=\s*"([^"]+)"/) || html.match(/ct\s*=\s*"([^"]+)"/);
  if (dateMatch && dateMatch[1]) {
    // Convert Unix timestamp if necessary
    const timestamp = parseInt(dateMatch[1]);
    if (!isNaN(timestamp)) {
      publishDate = new Date(timestamp * 1000).toISOString();
    }
  }

  // Cover image / Thumbnail
  const coverImage = $('meta[property="og:image"]').attr('content') || '';

  return {
    title,
    author,
    accountName,
    publishDate,
    coverImage,
  };
}

/**
 * Extracts and cleans the main content of the article
 */
export function extractContent(html: string): string {
  const $ = cheerio.load(html);
  const contentSelector = '#js_content';
  const $content = $(contentSelector);

  if (!$content.length) {
    throw new Error('Could not find article content (#js_content)');
  }

  // Smart Cleanup: Remove common distractive elements
  // 1. Remove scripts and styles
  $content.find('script, style').remove();

  // 2. Remove bottom components (Ad zones, QR codes, "Read More" links)
  // WeChat often uses specific classes or structures for these
  $content.find('.qr_code_pc_outer, .qr_code_pc, .js_official_account_container').remove();
  
  // 3. Remove "Like/Share" button groups
  $content.find('#js_view_source, .tool_area, .rich_media_tool').remove();

  // 4. Conservative cleanup for Ads/Recommendations
  // Only remove elements that are LIKELY to be just headers or dividers
  // Heuristic: If it contains trigger words AND is relatively short (< 100 chars), remove it.
  $content.find('*').each((_, el) => {
    const $el = $(el);
    // Skip if it's already removed
    if (!$el.parent().length) return;

    // Skip high-level containers to avoid deleting the whole article
    if (['section', 'div', 'article'].includes(el.name) && $el.text().length > 200) {
      return;
    }

    const text = $el.text().trim();
    const isTrigger = /^(往期推荐|阅读更多|点个赞|分享|收藏)/.test(text); // Check if it STARTS with these (more likely a header)
    
    if (isTrigger && text.length < 50) {
       // console.log('Removing distractive element:', text); 
       $el.remove();
    }
  });

  // Handle data-src for lazy-loaded images (critical for Turndown later)
  $content.find('img').each((_, el) => {
    const $img = $(el);
    const dataSrc = $img.attr('data-src');
    if (dataSrc) {
      $img.attr('src', dataSrc);
    }
  });

  return $content.html() || '';
}
