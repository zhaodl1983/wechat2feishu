import fs from 'fs/promises';
import * as cheerio from 'cheerio';

async function analyze() {
  const html = await fs.readFile('debug_cleaned.html', 'utf-8');
  const $ = cheerio.load(html);

  console.log('Total length:', html.length);
  console.log('Text length:', $.text().length);
  
  const textNodes = $('*').contents().filter((i, el) => el.type === 'text' && el.data.trim().length > 0);
  console.log('Number of text nodes:', textNodes.length);
  
  console.log('\nTop 5 longest text nodes:');
  textNodes.each((i, el) => {
    if (i < 5) {
      console.log(`[${i}] (${el.data.length} chars): ${el.data.substring(0, 50).trim()}...`);
    }
  });

  console.log('\nStructure analysis:');
  console.log('Section count:', $('section').length);
  console.log('Paragraph count:', $('p').length);
  console.log('Span count:', $('span').length);
}

analyze();
