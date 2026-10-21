/**
 * Turns an uploaded logo or signature into a small PNG/JPEG data URL the PDF
 * engine can embed (it can't read SVG or WebP directly). Browser only.
 */
export async function fileToDataUrl(
  file: File,
  maxSide = 600,
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("unreadable"));
      el.src = url;
    });
    const w = img.naturalWidth || 600;
    const h = img.naturalHeight || 200;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Photos stay small as JPEG; anything that may have transparency stays PNG.
    return file.type === "image/jpeg"
      ? canvas.toDataURL("image/jpeg", 0.9)
      : canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Crops a drawn signature to its ink, with a little breathing room. */
export function trimCanvas(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let top = height,
    left = width,
    right = 0,
    bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right <= left || bottom <= top) return "";
  const pad = 8;
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(width, right + pad);
  bottom = Math.min(height, bottom + pad);
  const out = document.createElement("canvas");
  out.width = right - left;
  out.height = bottom - top;
  out
    .getContext("2d")
    ?.drawImage(
      canvas,
      left,
      top,
      out.width,
      out.height,
      0,
      0,
      out.width,
      out.height,
    );
  return out.toDataURL("image/png");
}
