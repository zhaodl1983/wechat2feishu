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
      },
      validateStatus: () => true // Allow non-200 to be handled manually
    });

    if (response.status !== 200) {
        console.error(`[Proxy] Upstream Error ${response.status}: ${targetUrl}`);
        return new NextResponse('Upstream Error', { status: 502 });
    }

    const buffer = Buffer.from(response.data);
    const size = buffer.length;
    
    // Debug Log
    const lastSegment = params.path[params.path.length - 1]; 
    console.log(`[Proxy] Fetch: ${size} bytes. Target: ${targetUrl.substring(0, 50)}... Ext: ${lastSegment}`);

    // Check for suspicious small response (anti-hotlink page?)
    if (size < 1000) {
         console.warn(`[Proxy] Suspicious small response (${size} bytes). Might be anti-hotlink block.`);
    }

    let contentType = response.headers['content-type'];
    
    // Force Content-Type based on URL extension to help Feishu
    if (lastSegment) {
        if (lastSegment.endsWith('.gif')) contentType = 'image/gif';
        else if (lastSegment.endsWith('.png')) contentType = 'image/png';
        else if (lastSegment.endsWith('.jpg') || lastSegment.endsWith('.jpeg')) contentType = 'image/jpeg';
    }

    // Fallback
    if (!contentType) contentType = 'image/jpeg';
    
    return new NextResponse(buffer, {
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
