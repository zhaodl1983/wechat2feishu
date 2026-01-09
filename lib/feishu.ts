import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export class FeishuClient {
  private appId: string;
  private appSecret: string;
  private axiosInstance: AxiosInstance;
  private tenantAccessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.appId = process.env.FEISHU_APP_ID || '';
    this.appSecret = process.env.FEISHU_APP_SECRET || '';

    if (!this.appId || !this.appSecret) {
      throw new Error('Feishu App ID or Secret not found in environment variables.');
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://open.feishu.cn/open-apis',
      timeout: 10000,
    });
  }

  async getTenantAccessToken(): Promise<string> {
    if (this.tenantAccessToken && Date.now() < this.tokenExpiry) {
      return this.tenantAccessToken;
    }

    try {
      const response = await this.axiosInstance.post('/auth/v3/tenant_access_token/internal', {
        app_id: this.appId,
        app_secret: this.appSecret,
      });

      if (response.data.code !== 0) {
        throw new Error(`Failed to get access token: ${response.data.msg}`);
      }

      this.tenantAccessToken = response.data.tenant_access_token;
      // Set expiry to slightly less than the returned seconds (e.g., subtract 5 minutes buffer)
      // response.data.expire is in seconds
      this.tokenExpiry = Date.now() + (response.data.expire - 300) * 1000;

      return this.tenantAccessToken!;
    } catch (error: any) {
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Feishu Auth Error: ${msg}`);
    }
  }
}
