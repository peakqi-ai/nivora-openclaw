const TRIPO_KEY = process.env.TRIPO_API_KEY || "";
const TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi";

function headers(contentType?: string): HeadersInit {
  const h: HeadersInit = { Authorization: `Bearer ${TRIPO_KEY}` };
  if (contentType) h["Content-Type"] = contentType;
  return h;
}

/** Upload an image file to Tripo and return the image token. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const resp = await fetch(`${TRIPO_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TRIPO_KEY}` },
    body: form,
  });
  const data = await resp.json();

  if (data.code !== 0 || !data.data?.image_token) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.data.image_token;
}

/** Create an image-to-model task. Returns the task ID. */
export async function createImageToModelTask(
  imageToken: string
): Promise<string> {
  const resp = await fetch(`${TRIPO_BASE}/task`, {
    method: "POST",
    headers: headers("application/json"),
    body: JSON.stringify({
      type: "image_to_model",
      file: { type: "jpg", file_token: imageToken },
    }),
  });
  const data = await resp.json();

  if (data.code !== 0 || !data.data?.task_id) {
    throw new Error(data.message || "Task creation failed");
  }
  return data.data.task_id;
}

/** Create a text-to-model task. Returns the task ID. */
export async function createTextToModelTask(prompt: string): Promise<string> {
  const resp = await fetch(`${TRIPO_BASE}/task`, {
    method: "POST",
    headers: headers("application/json"),
    body: JSON.stringify({ type: "text_to_model", prompt }),
  });
  const data = await resp.json();

  if (data.code !== 0 || !data.data?.task_id) {
    throw new Error(data.message || "Task creation failed");
  }
  return data.data.task_id;
}

export interface TaskStatus {
  status: string;
  progress: number;
  output: { model_url: string } | null;
}

/** Poll the status of a Tripo task. */
export async function getTaskStatus(taskId: string): Promise<TaskStatus> {
  const resp = await fetch(`${TRIPO_BASE}/task/${taskId}`, {
    headers: { Authorization: `Bearer ${TRIPO_KEY}` },
  });
  const data = await resp.json();

  if (data.code !== 0) {
    throw new Error(data.message || "Task poll failed");
  }

  const task = data.data;
  const output =
    task.status === "success" && task.output
      ? { model_url: task.output.model || task.output.pbr_model }
      : null;

  return {
    status: task.status,
    progress: task.progress || 0,
    output,
  };
}

/** Fetch a GLB model binary from a Tripo URL. */
export async function fetchModelBinary(url: string): Promise<ArrayBuffer> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch model: ${resp.status}`);
  }
  return resp.arrayBuffer();
}
