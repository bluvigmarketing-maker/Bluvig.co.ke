import { randomBytes } from "node:crypto";

import { readDoc, updateDoc } from "@/lib/storage";

/**
 * Screenshots uploaded through the cockpit. The browser resizes them to WebP
 * first, so each is a few hundred KB at most; they're stored one per document
 * and served (cached for good) from /api/portfolio/image/[id].
 */

interface StoredImage {
  type?: string;
  data?: string; // base64
}

const MAX_BYTES = 1_500_000;
const TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

const keyFor = (id: string) => `portfolio-image:${id}`;

/** Saves a `data:image/...;base64,...` URL. Returns the image's public URL. */
export async function saveImage(dataUrl: string) {
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match || !TYPES.has(match[1])) {
    throw new UploadError("Upload a WebP, JPEG or PNG image.");
  }
  if (Buffer.byteLength(match[2], "base64") > MAX_BYTES) {
    throw new UploadError("That image is too large. Keep it under 1.5 MB.");
  }
  const id = randomBytes(9).toString("base64url");
  await updateDoc<StoredImage, void>(keyFor(id), {}, (doc) => {
    doc.type = match[1];
    doc.data = match[2];
  });
  return `/api/portfolio/image/${id}`;
}

export async function getImage(id: string) {
  if (!/^[\w-]{6,40}$/.test(id)) return null;
  const doc = await readDoc<StoredImage>(keyFor(id), {});
  if (!doc.data || !doc.type) return null;
  return { type: doc.type, bytes: Buffer.from(doc.data, "base64") };
}

export class UploadError extends Error {}
