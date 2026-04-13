import { NextRequest, NextResponse } from 'next/server';

const NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, phone, email, address, orderNumber, material, color, size, total } = body;

    if (!name || !phone || !email || !address) {
      return NextResponse.json({ error: '請填寫所有必填欄位' }, { status: 400 });
    }

    const order = {
      orderNumber: orderNumber || `PF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      customer: { name, phone, email, address },
      product: { material, color, size, total },
      createdAt: new Date().toISOString(),
    };

    // Log order for server-side tracking
    console.log('[PrintForge Order]', JSON.stringify(order, null, 2));

    // If a notification webhook is configured, send it
    const webhookUrl = process.env.ORDER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📦 新訂單 ${order.orderNumber}\n客戶：${name}\n電話：${phone}\nEmail：${email}\n材質：${material}\n金額：${total}`,
          ...order,
        }),
      }).catch(err => console.error('Webhook notification failed:', err));
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      message: '訂單已送出',
    });

  } catch (error: any) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
