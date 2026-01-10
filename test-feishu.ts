import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;

async function testFeishuAuth() {
  console.log('--- Feishu API Connection Test ---');
  console.log(`App ID: ${APP_ID}`);
  
  if (!APP_ID || !APP_SECRET) {
    console.error('Error: FEISHU_APP_ID or FEISHU_APP_SECRET not found in .env file.');
    return;
  }

  try {
    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
    const response = await axios.post(url, {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    });

    if (response.data.code === 0) {
      console.log('✅ Authentication successful!');
      console.log(`Tenant Access Token: ${response.data.tenant_access_token.substring(0, 10)}...`);
      console.log('--- Test Passed ---');
    } else {
      console.error('❌ Authentication failed!');
      console.error('Response Code:', response.data.code);
      console.error('Response Message:', response.data.msg);
    }
  } catch (error) {
    console.error('❌ An error occurred during the request:');
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    } else {
      console.error(error);
    }
  }
}

testFeishuAuth();
