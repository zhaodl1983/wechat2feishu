import { scrapeWeChatArticle } from './lib/scraper.ts';
import { extractMetadata, extractContent } from './lib/parser.ts';
import { convertToMarkdown } from './lib/converter.ts';
import { localizeAssets } from './lib/assets.ts';
import { getUniqueArticleDir, saveMarkdown } from './lib/storage.ts';

async function testE2E() {
  const url = 'https://mp.weixin.qq.com/s/DkBroLPZgjscatUBmkQ2-A';
  console.log('🚀 Starting End-to-End Test for:', url);

  try {
    // 1. Scrape
    const { html } = await scrapeWeChatArticle(url);
    
    // 2. Parse
    const metadata = extractMetadata(html);
    const contentHtml = extractContent(html);
    
    // 3. Convert to Markdown (initial)
    const initialMarkdown = convertToMarkdown(contentHtml, { ...metadata, url });
    
    // 4. Create Directory
    const articleDir = await getUniqueArticleDir(metadata.title);
    console.log('📂 Created directory:', articleDir);
    
    // 5. Localize Assets
    console.log('🖼️  Downloading and localizing images...');
    const finalMarkdown = await localizeAssets(initialMarkdown, articleDir);
    
    // 6. Save
    const filePath = await saveMarkdown(finalMarkdown, articleDir);
    console.log('✅ Success! Markdown saved to:', filePath);
    
  } catch (error) {
    console.error('❌ E2E Test failed:', error);
  }
}

testE2E();
