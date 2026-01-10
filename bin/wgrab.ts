#!/usr/bin/env node
import { Command } from 'commander';
import { scrapeWeChatArticle } from '../lib/scraper';
import { extractMetadata, extractContent } from '../lib/parser';
import { convertToMarkdown } from '../lib/converter';
import { localizeAssets } from '../lib/assets';
import { getUniqueArticleDir, saveMarkdown } from '../lib/storage';
import chalk from 'picocolors';

const program = new Command();

program
  .name('wgrab')
  .description('Grab WeChat articles and convert to local Markdown')
  .version('1.0.0')
  .argument('<url>', 'WeChat article URL')
  .option('-o, --output <dir>', 'Output base directory', 'output')
  .action(async (url, options) => {
    console.log(chalk.blue(`\n📦 Initializing wgrab for: ${url}\n`));

    try {
      // 1. Scraping
      console.log(`${chalk.blue('🚚')} Scraping article content...`);
      const { html } = await scrapeWeChatArticle(url);

      // 2. Parsing
      console.log(`${chalk.blue('🔍')} Extracting metadata and cleaning content...`);
      const metadata = extractMetadata(html);
      const contentHtml = extractContent(html);

      // 3. Setup Directory
      const articleDir = await getUniqueArticleDir(metadata.title, options.output);
      console.log(`${chalk.blue('📂')} Created article folder: ${chalk.cyan(articleDir)}`);

      // 4. Initial Conversion
      const initialMarkdown = convertToMarkdown(contentHtml, { ...metadata, url });

      // 5. Asset Localization
      console.log(`${chalk.blue('🖼️')} Downloading images and localizing links...`);
      const finalMarkdown = await localizeAssets(initialMarkdown, articleDir);

      // 6. Final Save
      const filePath = await saveMarkdown(finalMarkdown, articleDir);
      
      console.log(`\n${chalk.green('✅')} ${chalk.bold('Success!')}`);
      console.log(`${chalk.green('📄')} Article saved to: ${chalk.underline(filePath)}\n`);

    } catch (error) {
      console.error(`\n${chalk.red('❌')} ${chalk.bold('Error:')} ${error.message}\n`);
      process.exit(1);
    }
  });

program.parse();
