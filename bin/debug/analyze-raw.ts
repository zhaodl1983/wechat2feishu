import fs from 'fs/promises';
import * as cheerio from 'cheerio';

async function analyzeRaw() {
  try {
    const html = await fs.readFile('debug_raw.html', 'utf-8');
    const $ = cheerio.load(html);

    console.log('--- Raw HTML Analysis ---');
    console.log('Total length:', html.length);
    console.log('Title:', $('title').text());
    
    // Check for redirection scripts
    const scripts = $('script').map((i, el) => $(el).html()).get();
    const redirectScript = scripts.find(s => s && (s.includes('location.href') || s.includes('window.location')));
    
    if (redirectScript) {
      console.log('⚠️ Potential Redirect Found in script:', redirectScript.substring(0, 100) + '...');
    }

    // Check content container again
    const content = $('#js_content');
    console.log('#js_content exists:', content.length > 0);
    console.log('#js_content children count:', content.children().length);
    console.log('#js_content text length:', content.text().length);

    if (content.length > 0) {
        console.log('Content preview:', content.text().substring(0, 100));
    } else {
        // If no content, dump body text to see what IS there
        console.log('Body text preview:', $('body').text().substring(0, 200).replace(/\s+/g, ' '));
    }

  } catch (e) {
    console.error(e);
  }
}

analyzeRaw();
