import { put } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToBlob(
  filename: string,
  data: File | ArrayBuffer | Buffer | ReadableStream,
  contentType?: string
): Promise<string> {
  const blob = await put(filename, data, {
    access: "public",
    contentType,
  });
  return blob.url;
}

/** Upload a user's image to Vercel Blob. */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return uploadToBlob(filename, file, file.type);
}

/** Upload a generated 3D model (GLB) to Vercel Blob. */
export async function uploadModel(
  buffer: ArrayBuffer,
  taskId: string
): Promise<string> {
  const filename = `models/${taskId}.glb`;
  return uploadToBlob(filename, buffer, "model/gltf-binary");
}
