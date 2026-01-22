# Wechat2doc 部署指南

本文档详细记录了项目的服务器部署架构与操作流程。

## 1. 架构概览

- **OS**: Ubuntu 24.04 LTS
- **Runtime**: Node.js v22 (via PM2)
- **Web Server**: Nginx (反向代理 + SSL)
- **Database**: MongoDB (via Docker or Native)
- **Security**:
    - **HTTPS**: Certbot (Let's Encrypt)
    - **Auth**: NextAuth.js (Email/Password + OAuth)
    - **Port**: App (3001) -> Nginx (80/443) -> Public

## 2. 部署流程 (从本地到服务器)

### 2.1 代码同步
使用 `rsync` 将代码增量同步至服务器（排除敏感与大文件）。

```bash
rsync -avz -e "ssh -i /path/to/key.pem" \
--exclude 'node_modules' \
--exclude '.git' \
--exclude '.next' \
--exclude '.env' \
--exclude '*.db' \
--exclude 'output/' \
./ user@server_ip:/var/www/wechat2doc/
```

### 2.2 服务器端构建与启动

1.  **安装依赖与同步数据库**
    ```bash
    cd /var/www/wechat2doc
    npm install
    # 生成 Prisma Client 并推送到 MongoDB
    npx prisma generate
    npx prisma db push
    ```

2.  **环境变量配置 (.env)**
    确保服务器拥有独立的 `.env` 文件，包含以下关键配置：
    ```ini
    # Database
    DATABASE_URL="mongodb://127.0.0.1:27017/wechat2doc"
    
    # Auth (NextAuth)
    AUTH_SECRET="your_generated_secret_string" # 使用 `openssl rand -base64 32` 生成
    
    # Feishu Integration
    FEISHU_APP_ID=...
    FEISHU_APP_SECRET=...
    FEISHU_REDIRECT_URI=https://your-domain.com/api/auth/callback
    
    # App Config
    NEXT_PUBLIC_BASE_URL=https://your-domain.com
    ENCRYPTION_KEY=... # 32字节十六进制字符串
    ```

3.  **构建 (Build)**
    *注意：`NEXT_PUBLIC_` 开头的环境变量是在构建时注入的。如果修改了域名，必须重新构建。*
    ```bash
    npm run build
    ```

4.  **进程管理 (PM2)**
    ```bash
    # 首次启动
    pm2 start ecosystem.config.cjs
    
    # 重启服务
    pm2 restart wechat2doc
    
    # 保存状态
    pm2 save
    ```

## 3. 域名迁移与 SSL 配置 (实战经验)

### 3.1 目录迁移 (如 wechat2feishu -> wechat2doc)
1.  停止旧进程: `pm2 stop wechat2feishu && pm2 delete wechat2feishu`
2.  重命名目录: `mv /var/www/wechat2feishu /var/www/wechat2doc`
3.  更新代码中的引用（如 `ecosystem.config.js` 中的名称）。

### 3.2 Nginx 与 SSL 重签发
1.  **重命名配置**: `mv /etc/nginx/sites-available/old_conf /etc/nginx/sites-available/wechat2doc`
2.  **修改域名**: 编辑配置文件中的 `server_name` 为新域名。
3.  **更新软链**: `ln -s ...` 并重载 Nginx。
4.  **申请新证书**: `certbot --nginx -d new-domain.com`。

## 4. 数据库备份与维护

为了确保数据安全，项目包含了一个自动备份脚本 `scripts/backup_db.sh`。

### 设置定时备份 (Cron)
建议每日凌晨 2 点执行备份：

```bash
chmod +x scripts/backup_db.sh
crontab -e
# 添加:
0 2 * * * /var/www/wechat2doc/scripts/backup_db.sh >> /var/www/wechat2doc/scripts/backup.log 2>&1
```

## 5. 故障排查 (Troubleshooting)

- **Next.js 构建报错**: 
    - 检查 `tsconfig.json` 是否排除了非必要的测试文件 (`test-*.ts`)。
    - 检查 `.env` 中的密钥格式是否正确（不能换行）。
    - 确保 `ecosystem.config.js` 在 `"type": "module"` 项目中重命名为 `.cjs`。
- **502 Bad Gateway**: 检查 PM2 进程是否启动 (`pm2 list`)。
- **SSL 警告 (Mixed Content)**: 检查 `NEXT_PUBLIC_BASE_URL` 是否已更新为 `https` 并重新构建。