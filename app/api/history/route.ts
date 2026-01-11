import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    const where = session ? { userId: session.userId } : { userId: null };

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ data: articles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
