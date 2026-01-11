import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
        // 关键：伪造 Referer 以绕过微信防盗链
        'Referer': 'https://mp.weixin.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error: any) {
    console.error('Image Proxy Error:', error.message);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
