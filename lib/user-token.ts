import { prisma } from './db';
import { decrypt, encrypt } from './encryption';
import { FeishuClient } from './feishu';

export async function getValidUserAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.encryptedAccessToken || !user.encryptedRefreshToken) {
    throw new Error('User not found or tokens missing');
  }

  // Check if expired (with 5 min buffer)
  if (user.tokenExpiry && user.tokenExpiry.getTime() - 5 * 60 * 1000 > Date.now()) {
    return decrypt(user.encryptedAccessToken);
  }

  // Refresh Token
  console.log(`Refreshing token for user ${userId}...`);
  const refreshToken = decrypt(user.encryptedRefreshToken);
  const client = new FeishuClient();
  
  try {
      const data = await client.refreshUserAccessToken(refreshToken);
      const { access_token, refresh_token: new_refresh_token, expires_in } = data;

      // Update DB
      await prisma.user.update({
          where: { id: userId },
          data: {
              encryptedAccessToken: encrypt(access_token),
              encryptedRefreshToken: encrypt(new_refresh_token),
              tokenExpiry: new Date(Date.now() + expires_in * 1000)
          }
      });

      return access_token;

  } catch (error: any) {
      console.error('Refresh logic failed:', error);
      throw error;
  }
}
