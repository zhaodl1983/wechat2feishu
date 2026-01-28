import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    // Case 1: Trending (Open Access)
    if (mode === 'trending') {
      // Include all successful statuses: completed, stored, synced
      const successStatuses = ['completed', 'stored', 'synced'];

      const trending = await prisma.article.groupBy({
        by: ['originalUrl', 'title'],
        where: { status: { in: successStatuses } },
        _count: { originalUrl: true },
        orderBy: {
          _count: { originalUrl: 'desc' }
        },
        take: 10
      });

      const articles = trending.map((item, index) => ({
        id: `rank-${index}`,
        originalUrl: item.originalUrl,
        title: item.title,
        count: item._count.originalUrl,
        publishDate: new Date().toISOString(),
        status: 'completed',
        isTrending: true
      }));

      return NextResponse.json({ data: articles });
    }

    // Case 2: Personal History
    const session = await auth();
    const userId = session?.user?.id;
    const where = userId ? { userId: userId } : { userId: null };

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Verify ownership
    const article = await prisma.article.findUnique({
      where: { id: id }
    });

    if (!article || article.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.article.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
