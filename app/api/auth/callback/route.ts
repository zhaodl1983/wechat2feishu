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

    /* 
    // Feishu login temporarily disabled in V0.6 cleanup
    // 4. Upsert User in DB
    const user = await prisma.user.upsert({
      where: { feishuUserId: open_id },
      update: {
        name,
        avatarUrl: avatar_url,
        encryptedAccessToken: encrypt(access_token),
        encryptedRefreshToken: encrypt(refresh_token),
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        lastLoginAt: new Date(),
      },
      create: {
        feishuUserId: open_id,
        name,
        avatarUrl: avatar_url,
        encryptedAccessToken: encrypt(access_token),
        encryptedRefreshToken: encrypt(refresh_token),
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        lastLoginAt: new Date(),
      },
    });
    
    // Create session (simple cookie for MVP)
    // In real world, use NextAuth or similar
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("userId", user.id, { httpOnly: true }); 
    */

    return NextResponse.redirect(new URL("/login?error=FeishuLoginDisabled", request.url));

  } catch (error: any) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
