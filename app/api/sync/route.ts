import { NextResponse } from 'next/server';
import { processArticle } from '@/lib/conductor';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    const session = await auth();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 配额检查：仅对登录用户进行检查
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          _count: {
            select: { articles: true }
          }
        }
      });

      if (user) {
        const currentCount = user._count.articles;
        const quota = user.articleQuota;

        if (currentCount >= quota) {
          return NextResponse.json(
            {
              error: '存储配额已满',
              message: `您当前已存储 ${currentCount} 篇文章，已达到免费配额上限（${quota}篇）。请删除部分文章后再试。`,
              quota: {
                current: currentCount,
                limit: quota
              }
            },
            { status: 403 }
          );
        }
      }
    }

    // Pass userId if logged in
    const result = await processArticle(url, session?.user?.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

