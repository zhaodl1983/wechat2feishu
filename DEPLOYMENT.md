# Wechat2doc 部署指南

本文档详细记录了项目的服务器部署架构与操作流程。

## 1. 架构概览

- **OS**: Ubuntu 24.04 LTS
- **Runtime**: Node.js v22 (via PM2)
- **Web Server**: Nginx (反向代理 + SSL)
- **Database**: SQLite (生产环境: `prod.db`) / MongoDB (规划中)
- **Security**:
    - **HTTPS**: Certbot (Let's Encrypt)
    - **Port**: App (3001) -> Nginx (80/443) -> Public

## 2. 部署流程

### 本地上传代码
使用 `rsync` 将代码同步至服务器（排除敏感与大文件）。

```bash
rsync -avz -e "ssh -i /path/to/key.pem" \
--exclude 'node_modules' \
--exclude '.git' \
--exclude '.next' \
--exclude 'dev.db' \
--exclude '.env' \
./ user@server_ip:/var/www/wechat2doc/
```

### 服务器端操作

1.  **安装依赖与构建**
    ```bash
    npm install
    # 生成 Prisma Client
    npx prisma migrate deploy
    npx prisma generate
    # 构建 Next.js
    npm run build
    ```

2.  **环境变量 (.env)**
    确保服务器拥有独立的 `.env` 文件，包含以下关键配置：
    ```env
    DATABASE_URL="file:./prod.db"
    FEISHU_REDIRECT_URI=https://your-domain.com/api/auth/callback
    NEXT_PUBLIC_BASE_URL=https://your-domain.com
    # 生产环境密钥
    JWT_SECRET=...
    ENCRYPTION_KEY=...
    ```

3.  **进程管理 (PM2)**
    ```bash
    pm2 start ecosystem.config.cjs
    pm2 save
    ```

4.  **Nginx 配置模板**
    位置: `/etc/nginx/sites-available/wechat2doc`

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

## 3. SSL 证书 (Certbot)

使用 Certbot 自动申请并配置 HTTPS：

```bash
sudo certbot --nginx -d your-domain.com
```

## 4. 故障排查

- **检查服务状态**: `pm2 status`
- **查看日志**: `pm2 logs wechat2doc`
- **重启服务**: `pm2 restart wechat2doc`
- **数据库重置**:
    ```bash
    # 危险操作：清空数据
    npx prisma migrate reset
    ```
