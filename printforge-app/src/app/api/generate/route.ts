import { NextRequest, NextResponse } from "next/server";
import {
  uploadImage,
  createImageToModelTask,
  createTextToModelTask,
} from "@/lib/tripo";
import { uploadImage as saveToBlobImage } from "@/lib/blob";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  try {
    // Text prompt (JSON body)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (!body.prompt) {
        return NextResponse.json(
          { error: "prompt is required" },
          { status: 400 }
        );
      }

      const taskId = await createTextToModelTask(body.prompt);
      return NextResponse.json({ task_id: taskId });
    }

    // Image upload (FormData)
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "image file is required" },
        { status: 400 }
      );
    }

    // Save the original image to Vercel Blob for archival
    const blobUrl = await saveToBlobImage(imageFile);

    // Upload to Tripo and create task
    const imageToken = await uploadImage(imageFile);
    const taskId = await createImageToModelTask(imageToken);

    return NextResponse.json({ task_id: taskId, image_url: blobUrl });
  } catch (error) {
    console.error("Generate API error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
