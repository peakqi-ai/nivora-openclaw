import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/lib/tripo";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  try {
    const status = await getTaskStatus(taskId);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Task poll error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
