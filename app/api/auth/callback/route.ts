import { NextResponse } from 'next/server';
import { FeishuClient } from '@/lib/feishu';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { createSession } from '@/lib/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const client = new FeishuClient();
    
    // 1. Exchange code for tokens
    const tokenData = await client.getUserAccessToken(code);
    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // 2. Get User Info
    const userInfo = await client.getUserInfo(access_token);
    const { name, avatar_url } = userInfo;

    // 3. Encrypt Tokens
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = encrypt(refresh_token);
    const tokenExpiry = new Date(Date.now() + expires_in * 1000);

    // 4. Upsert User in DB
    const user = await prisma.user.upsert({
      where: { feishuUserId: open_id },
      update: {
        name,
        avatarUrl: avatar_url,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiry,
        lastLoginAt: new Date(),
      },
      create: {
        feishuUserId: open_id,
        name,
        avatarUrl: avatar_url,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiry,
      },
    });

    // 5. Create Session (Cookie)
    await createSession(user.id);

    // 6. Redirect to Home
    // Derive base URL from FEISHU_REDIRECT_URI to ensure correct production redirect
    let baseUrl = new URL('/', request.url).origin;
    if (process.env.FEISHU_REDIRECT_URI) {
        try {
            const redirectUrl = new URL(process.env.FEISHU_REDIRECT_URI);
            baseUrl = redirectUrl.origin;
        } catch (e) {
            console.error('Invalid FEISHU_REDIRECT_URI', e);
        }
    }
    
    return NextResponse.redirect(new URL('/', baseUrl));

  } catch (error: any) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
