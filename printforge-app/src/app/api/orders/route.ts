import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/pricing";

/** GET /api/orders — list orders for the current user */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { model: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

/** POST /api/orders — create a new order */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      material,
      color,
      size,
      totalPrice,
      customerName,
      phone,
      email,
      address,
      // Optional: link to a generated model
      tripoTaskId,
      sourceType,
      sourceUrl,
      prompt,
      modelUrl,
    } = body;

    if (!material || !color || !size || !totalPrice) {
      return NextResponse.json(
        { error: "material, color, size, totalPrice are required" },
        { status: 400 }
      );
    }

    if (!customerName || !phone || !email || !address) {
      return NextResponse.json(
        { error: "customerName, phone, email, address are required" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        material,
        color,
        size: String(size),
        totalPrice: Math.round(Number(totalPrice)),
        customerName,
        phone,
        email,
        address,
        // Create related model record if provided
        ...(tripoTaskId
          ? {
              model: {
                create: {
                  sourceType: sourceType || "IMAGE",
                  sourceUrl: sourceUrl || null,
                  prompt: prompt || null,
                  tripoTaskId,
                  modelUrl: modelUrl || null,
                  status: modelUrl ? "READY" : "GENERATING",
                },
              },
            }
          : {}),
      },
      include: { model: true },
    });

    // Fire-and-forget webhook notification
    const webhookUrl = process.env.ORDER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `📦 新訂單 ${orderNumber}\n客戶：${customerName}\n材質：${material}\n金額：NT$ ${totalPrice}`,
        }),
      }).catch((err) => console.error("Webhook failed:", err));
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
