import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/orders/[id] — get a single order */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { model: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

/** PATCH /api/orders/[id] — update order status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { status, modelUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        // Optionally update the related model's URL
        ...(modelUrl
          ? {
              model: {
                update: {
                  modelUrl,
                  status: "READY",
                },
              },
            }
          : {}),
      },
      include: { model: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order update error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
