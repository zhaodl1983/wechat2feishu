import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  // Format: /api/image-proxy/<ENCODED_URL>/image.jpg
  // params.path[0] is the encoded URL
  const encodedUrl = params.path[0];
  
  if (!encodedUrl) {
    return new NextResponse('Missing url', { status: 400 });
  }

  try {
    const targetUrl = decodeURIComponent(encodedUrl);
    
    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
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
