import { chromium, Browser, Page } from 'playwright';

export interface ScrapeResult {
  html: string;
  url: string;
}

/**
 * Playwright Service to render WeChat article pages
 */
export async function scrapeWeChatArticle(url: string): Promise<ScrapeResult> {
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // Use a real desktop User-Agent
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page: Page = await context.newPage();

  try {
    console.log(`\x1b[34m[Scraper]\x1b[0m Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Explicitly wait for the content container
    try {
      await page.waitForSelector('#js_content', { timeout: 10000 });
    } catch (e) {
      console.warn('\x1b[33m[Scraper Warning]\x1b[0m #js_content not found immediately, page might be unusual.');
    }

    // Scroll to the bottom to trigger all lazy-loaded images
    await autoScroll(page);

    // Wait for a short duration to ensure all content is rendered
    await page.waitForTimeout(3000);

    const html = await page.content();
    
    await browser.close();
    return { html, url };
  } catch (error) {
    await browser.close();
    console.error(`\x1b[31m[Scraper Error]\x1b[0m Failed to scrape:`, error);
    throw error;
  }
}

/**
 * Helper function to scroll through the page
 */
async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
