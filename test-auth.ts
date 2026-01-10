import { FeishuClient } from './lib/feishu';

async function main() {
  console.log('Testing FeishuClient Auth...');
  try {
    const client = new FeishuClient();
    const token = await client.getTenantAccessToken();
    console.log('✅ Token received:', token.substring(0, 10) + '...');
    
    // Test caching
    console.log('Testing token caching...');
    const start = Date.now();
    const token2 = await client.getTenantAccessToken();
    const duration = Date.now() - start;
    
    if (token === token2 && duration < 100) { // < 100ms usually means cached
       console.log(`✅ Token cached successfully (took ${duration}ms)`);
    } else {
       console.warn(`⚠️ Token caching might not be working (took ${duration}ms)`);
    }

    // Test Root Folder
    console.log('Testing Root Folder Access...');
    const rootToken = await client.getRootFolderToken();
    console.log('✅ Root Folder Token:', rootToken);
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
