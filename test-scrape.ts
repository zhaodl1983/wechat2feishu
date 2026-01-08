import { scrapeWeChatArticle } from './lib/scraper.ts';
import { extractMetadata, extractContent } from './lib/parser.ts';
import fs from 'fs/promises';

async function test() {
  const url = 'https://mp.weixin.qq.com/s/DkBroLPZgjscatUBmkQ2-A';
  try {
    console.log('Starting scrape...');
    const { html } = await scrapeWeChatArticle(url);
    await fs.writeFile('debug_raw.html', html);
    console.log('📝 Saved debug_raw.html');

    const metadata = extractMetadata(html);
    console.log('\n=== Metadata ===');
    console.log(JSON.stringify(metadata, null, 2));

    try {
      const content = extractContent(html);
      await fs.writeFile('debug_cleaned.html', content);
      console.log('📝 Saved debug_cleaned.html');

      console.log('\n=== Content Snippet (first 500 chars) ===');
      console.log(content.substring(0, 500) + '...');
    } catch (e) {
      console.error('❌ Content extraction failed:', e);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();