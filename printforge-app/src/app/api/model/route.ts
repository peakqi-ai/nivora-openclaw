import { NextRequest, NextResponse } from "next/server";
import { fetchModelBinary } from "@/lib/tripo";
import { uploadModel } from "@/lib/blob";

export async function POST(request: NextRequest) {
  try {
    const { url, taskId } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Fetch the GLB binary from Tripo
    const buffer = await fetchModelBinary(url);

    // Save to Vercel Blob for permanent storage
    let blobUrl: string | null = null;
    if (taskId) {
      blobUrl = await uploadModel(buffer, taskId);
    }

    // Return the binary to the client (for immediate 3D viewer use)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Length": String(buffer.byteLength),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
        ...(blobUrl ? { "X-Blob-Url": blobUrl } : {}),
      },
    });
  } catch (error) {
    console.error("Model proxy error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
