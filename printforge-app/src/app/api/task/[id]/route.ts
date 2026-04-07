import { NextRequest, NextResponse } from 'next/server';

const TRIPO_KEY = process.env.TRIPO_API_KEY || '';
const TRIPO_BASE = 'https://api.tripo3d.ai/v2/openapi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!TRIPO_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const { id: taskId } = await params;

  try {
    const resp = await fetch(`${TRIPO_BASE}/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${TRIPO_KEY}` },
    });
    const data = await resp.json();

    if (data.code !== 0) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    const task = data.data;
    const output = task.status === 'success' && task.output
      ? { model_url: task.output.model || task.output.pbr_model }
      : null;

    return NextResponse.json({
      status: task.status,
      progress: task.progress || 0,
      output,
    });

  } catch (error: any) {
    console.error('Task poll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
