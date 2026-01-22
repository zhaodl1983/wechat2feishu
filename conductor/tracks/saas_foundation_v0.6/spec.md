# Technical Specification: SaaS Foundation (V0.6)

## 1. 数据库设计 (Schema)

### User 模型更新
在 `prisma/schema.prisma` 中，`User` 模型需要支持邮箱密码登录，并保留原有的飞书/微信字段作为可选关联。

```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  // 核心认证信息
  email         String?   @unique
  emailVerified DateTime? // 邮箱验证通过的时间戳
  password      String?   // 哈希后的密码 (bcrypt/argon2)
  
  // 社交账号标识 (作为唯一索引)
  phoneNumber   String?   @unique
  wechatUnionId String?   @unique
  wechatOpenId  String?
  feishuUserId  String?   @unique

  // 个人资料
  name          String?
  avatarUrl     String?
  
  // 遗留/OAuth Token (针对飞书)
  encryptedAccessToken  String?
  encryptedRefreshToken String?
  tokenExpiry           DateTime?
  
  // 元数据
  lastLoginAt   DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  articles      Article[]
}
```

### 新增 VerificationToken 模型
用于存储邮箱注册或密码重置时的验证码。

```prisma
model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String   // 邮箱地址或手机号
  token      String   // 6位数字验证码
  expires    DateTime // 过期时间
  type       String   // 枚举: "EMAIL_REGISTER", "PASSWORD_RESET"
  attempts   Int      @default(0) // 验证失败次数
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}
```

## 2. API 接口定义

### Auth 模块
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/send-code` | 发送验证码 (含频率限制) | Public |
| `POST` | `/api/auth/register` | 校验验证码，创建用户 (Hash密码) | Public |
| `POST` | `/api/auth/login` | 校验邮箱/密码，签发 Session/JWT | Public |
| `POST` | `/api/auth/logout` | 清除 Session Cookie | Private |
| `GET` | `/api/auth/me` | 获取当前用户信息 (扩展现有接口) | Private |

### 频率限制 (Rate Limiting)
- **Send Code**:
    - 单 IP/邮箱 60秒内限 1 次。
    - 单 IP/邮箱 1小时内限 5 次。
- **Login**:
    - 连续失败 5 次锁定账号 15 分钟 (可选)。

## 3. 服务端实现细节

### 密码安全
- 算法: 使用 `bcrypt` 或 `argon2` 进行密码哈希。
- 策略: 绝不明文存储密码。

### 邮件服务
- 库: `nodemailer`
- 传输: SMTP (配置于环境变量 `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)

### 验证码生成
- 使用 `crypto.randomInt` 生成 6 位加密安全随机数字。

## 4. 存储迁移 (MongoDB & Local FS)

### Markdown 存储
- `Article` 模型新增字段: `content String?` (存储 Markdown 源码)。
- 迁移策略: 新抓取文章同时写入 DB。旧文章暂不强制迁移，读取时优先读 DB，无则读 FS。

### 图片存储
- 路径规范: `public/uploads/{userId}/{articleId}/{hash}.jpg`
- 处理: 上传前使用 `sharp` 调整尺寸/质量 (WebP 或 JPEG 80%)。
