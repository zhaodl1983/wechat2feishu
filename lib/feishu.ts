import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

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
      this.tokenExpiry = Date.now() + (response.data.expire - 300) * 1000;

      return this.tenantAccessToken!;
    } catch (error: any) {
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Feishu Auth Error: ${msg}`);
    }
  }

  async uploadFile(filePath: string, parentNode: string, parentType: string = 'explorer'): Promise<string> {
    const token = await this.getTenantAccessToken();
    const stats = await fs.promises.stat(filePath);
    const stream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const form = new FormData();
    form.append('file_name', fileName);
    form.append('parent_type', parentType);
    form.append('parent_node', parentNode);
    form.append('size', stats.size.toString());
    form.append('file', stream);

    try {
      const response = await this.axiosInstance.post('/drive/v1/files/upload_all', form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders(),
        },
      });

      if (response.data.code !== 0) {
        throw new Error(`Upload failed: ${response.data.msg}`);
      }

      return response.data.data.file_token;
    } catch (error: any) {
       const msg = error.response?.data?.msg || error.message;
       throw new Error(`Feishu Upload Error: ${msg}`);
    }
  }

  async createImportTask(fileToken: string, fileExtension: string, folderToken: string): Promise<string> {
      const token = await this.getTenantAccessToken();
      try {
          const response = await this.axiosInstance.post('/drive/v1/import_tasks', {
              file_extension: fileExtension,
              file_token: fileToken,
              type: 'docx',
              point: {
                  mount_type: 1, // 1: mount to folder
                  mount_key: folderToken
              }
          }, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.data.code !== 0) {
            throw new Error(`Import task creation failed: ${response.data.msg}`);
          }
          
          return response.data.data.ticket;
      } catch (error: any) {
          const msg = error.response?.data?.msg || error.message;
          throw new Error(`Feishu Import Error: ${msg}`);
      }
  }

  async getImportResult(ticket: string): Promise<any> {
      const token = await this.getTenantAccessToken();
      try {
          const response = await this.axiosInstance.get(`/drive/v1/import_tasks/${ticket}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

           if (response.data.code !== 0) {
            throw new Error(`Get import result failed: ${response.data.msg}`);
          }
          
          return response.data.data.result;
      } catch (error: any) {
          const msg = error.response?.data?.msg || error.message;
          throw new Error(`Feishu Poll Error: ${msg}`);
      }
  }

  async getRootFolderToken(): Promise<string> {
       const token = await this.getTenantAccessToken();
       try {
         const response = await this.axiosInstance.get('/drive/explorer/v2/root_folder/meta', {
             headers: { Authorization: `Bearer ${token}` }
         });
         if (response.data.code !== 0) throw new Error(response.data.msg);
         return response.data.data.token;
       } catch (error: any) {
         const msg = error.response?.data?.msg || error.message;
         throw new Error(`Get Root Folder Error: ${msg}`);
       }
  }
}