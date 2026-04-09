import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    // Fetch model from Tripo
    const resp = await fetch(url);
    
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 502 });
    }

    const arrayBuffer = await resp.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': String(arrayBuffer.byteLength),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error: any) {
    console.error('Model proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
