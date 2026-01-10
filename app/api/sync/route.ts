import { NextResponse } from 'next/server';
import { conductorProcess } from '@/lib/conductor';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Trigger the process
    // In V1.2 MVP, we await it. In V1.3, this should be a background job.
    const result = await conductorProcess(url);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
