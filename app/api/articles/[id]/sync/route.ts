
import { NextResponse } from 'next/server';
import { syncArticleToFeishu } from '@/lib/conductor';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ param handling
) {
    try {
        const session = await auth();
        // In a real app, you might check if the user IS the owner of the article
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Trigger Sync
        const result = await syncArticleToFeishu(id);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('API Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
