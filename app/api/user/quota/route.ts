import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                _count: {
                    select: { articles: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const current = user._count.articles;
        const limit = user.articleQuota;
        // 计算剩余配额，不小于0
        const remaining = Math.max(0, limit - current);
        const percentage = Math.min(100, Math.round((current / limit) * 100));

        return NextResponse.json({
            current,
            limit,
            remaining,
            percentage
        });
    } catch (error) {
        console.error('Fetch Quota Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
