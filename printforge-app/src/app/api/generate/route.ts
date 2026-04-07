import { NextRequest, NextResponse } from 'next/server';

const TRIPO_KEY = process.env.TRIPO_API_KEY || '';
const TRIPO_BASE = 'https://api.tripo3d.ai/v2/openapi';

export async function POST(request: NextRequest) {
  if (!TRIPO_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const contentType = request.headers.get('content-type') || '';

  try {
    // Text prompt (JSON body)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.prompt) {
        return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
      }

      const taskResp = await fetch(`${TRIPO_BASE}/task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TRIPO_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text_to_model',
          prompt: body.prompt,
        }),
      });
      const taskData = await taskResp.json();

      if (taskData.code !== 0) {
        return NextResponse.json({ error: taskData.message || 'Task creation failed' }, { status: 400 });
      }

      return NextResponse.json({ task_id: taskData.data.task_id });
    }

    // Image upload (FormData)
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'image file is required' }, { status: 400 });
    }

    // Step 1: Upload image to Tripo
    const uploadForm = new FormData();
    uploadForm.append('file', imageFile);

    const uploadResp = await fetch(`${TRIPO_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TRIPO_KEY}` },
      body: uploadForm,
    });
    const uploadData = await uploadResp.json();

    if (uploadData.code !== 0) {
      return NextResponse.json({ error: uploadData.message || 'Upload failed' }, { status: 400 });
    }

    // Step 2: Create image_to_model task
    const taskResp = await fetch(`${TRIPO_BASE}/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'image_to_model',
        file: { type: 'jpg', file_token: uploadData.data.image_token },
      }),
    });
    const taskData = await taskResp.json();

    if (taskData.code !== 0) {
      return NextResponse.json({ error: taskData.message || 'Task creation failed' }, { status: 400 });
    }

    return NextResponse.json({ task_id: taskData.data.task_id });

  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
