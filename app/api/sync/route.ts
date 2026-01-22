import { NextResponse } from 'next/server';
import { conductorProcess } from '@/lib/conductor';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    const session = await auth();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Pass userId if logged in
    const result = await conductorProcess(url, session?.user?.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
