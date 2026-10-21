import { readJson } from "@/lib/read-json";

/** Resizes an image file in the browser and returns it as a WebP data URL. */
export async function toWebp(file: File, maxWidth: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.8);
}

/** Resizes and uploads an image through the cockpit. Returns its public URL. */
export async function uploadImage(file: File, maxWidth: number, password?: string) {
  const data = await toWebp(file, maxWidth);
  const res = await fetch("/api/cockpit/portfolio/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, password }),
  });
  const body = await readJson(res);
  if (!res.ok) throw new Error(body.error ?? "Upload failed.");
  return String(body.url);
}
