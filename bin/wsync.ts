#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'picocolors';
import path from 'path';
import fs from 'fs';
import { FeishuClient } from '../lib/feishu.ts';

const program = new Command();

program
  .name('wsync')
  .description('Sync local article to Feishu Cloud Doc')
  .argument('<dir>', 'Article directory path')
  .action(async (dir) => {
    try {
      const client = new FeishuClient();
      console.log(chalk.blue('🚀 Starting Feishu Sync...'));
      
      const absDir = path.resolve(dir);
      if (!fs.existsSync(absDir)) {
          throw new Error(`Directory not found: ${absDir}`);
      }
      
      // Find MD file
      const files = fs.readdirSync(absDir);
      const mdFile = files.find(f => f.endsWith('.md') && !f.startsWith('feishu_'));
      if (!mdFile) throw new Error('No Markdown file found.');
      
      const mdPath = path.join(absDir, mdFile);
      console.log(chalk.blue(`📄 Found article: ${mdFile}`));

      // 1. Authenticate & Get Root
      const rootToken = await client.getRootFolderToken();
      console.log(chalk.green(`✅ Authenticated. Root Folder: ${rootToken}`));

      // 2. Upload Images (Experimental)
      let content = fs.readFileSync(mdPath, 'utf-8');
      const imageRegex = /!\(.*?\]\((.*?)\)/g;
      let match;
      const replacements: {original: string, newUrl: string}[] = [];
      
      while ((match = imageRegex.exec(content)) !== null) {
          const [fullMatch, alt, imgPath] = match;
          if (imgPath.startsWith('http')) continue;
          
          const absImgPath = path.resolve(absDir, imgPath);
          if (fs.existsSync(absImgPath)) {
             console.log(chalk.yellow(`🖼️ Uploading image: ${imgPath}`));
             try {
                 // Uploading to root folder for now
                 const fileToken = await client.uploadFile(absImgPath, rootToken, 'explorer');
                 replacements.push({ original: imgPath, newUrl: fileToken }); 
             } catch (e: any) {
                 console.error(chalk.red(`Failed to upload ${imgPath}: ${e.message}`));
             }
          }
      }
      
      // Replace images in content (Naive replacement)
      // Note: This replaces the file path with the file_token. 
      // It is unsure if Feishu Import recognizes this.
      for (const r of replacements) {
          content = content.replace(r.original, r.newUrl);
      }
      
      // Write temp file
      const tempMdPath = path.join(absDir, `feishu_${mdFile}`);
      fs.writeFileSync(tempMdPath, content);
      
      // 3. Upload MD
      console.log(chalk.blue('📤 Uploading Markdown file...'));
      const mdToken = await client.uploadFile(tempMdPath, rootToken, 'explorer');
      console.log(chalk.green(`✅ Markdown uploaded. Token: ${mdToken}`));
      
      // 4. Import
      console.log(chalk.blue('🔄 Creating Import Task...'));
      const ticket = await client.createImportTask(mdToken, 'md', rootToken);
      console.log(chalk.blue(`🎫 Import Ticket: ${ticket}`));
      
      // 5. Poll
      console.log(chalk.blue('⏳ Polling for result...'));
      let result;
      for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const status = await client.getImportResult(ticket);
          console.log(`   Status: ${status.job_status} (${status.job_error_msg || 'No error'})`);
          
          if (status.job_status === 0) { // Success
              result = status;
              break;
          } else if (status.job_status !== 1 && status.job_status !== 2) {
              // 1=init, 2=processing.
              // If it failed
              if (status.job_status > 2) {
                   console.error(chalk.red(`Import failed with status ${status.job_status}`));
                   break;
              }
          }
      }
      
      if (result) {
          console.log(chalk.green('\n✅ Import Complete!'));
          // Retrieve URL if available, or construct it.
          // result usually contains token, url, type...
          console.log(chalk.green(`🔗 Document Token: ${result.token}`));
          console.log(chalk.green(`🔗 Document URL: ${result.url}`));
      } else {
          console.error(chalk.red('\n❌ Import timed out or failed.'));
      }
      
      // Cleanup temp file
      fs.unlinkSync(tempMdPath);

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
