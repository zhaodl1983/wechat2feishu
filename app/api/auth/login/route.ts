import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.FEISHU_APP_ID;
  const redirectUri = process.env.FEISHU_REDIRECT_URI;
  
  // Scopes needed: user info, doc management
  // 'contact:user.base:readonly' or similar for identity
  // 'drive:drive' for docs (user access)
  // 'drive:file:edit' etc.
  // Actually, for user identity, usually 'contact:user.id:readonly' or 'contact:user.base:readonly'
  
  // Let's use a standard set. 
  // IMPORTANT: You must add these scopes in Feishu Console!
  // Scopes: contact:user.id:readonly, contact:user.base:readonly, drive:drive
  
  // Note: Redirect URI must be URL encoded
  const encodedRedirect = encodeURIComponent(redirectUri || '');
  const state = 'random_state_xyz'; // Should be random in prod

  const url = `https://open.feishu.cn/open-apis/authen/v1/index?app_id=${appId}&redirect_uri=${encodedRedirect}&state=${state}`;

  return NextResponse.redirect(url);
}
