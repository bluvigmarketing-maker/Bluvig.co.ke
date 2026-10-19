import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { updateDoc } from "@/lib/storage";

/**
 * Per-visitor rate limits, kept in the document store so they hold across
 * serverless instances. IPs are stored hashed. Low traffic only — every
 * check is one small write.
 */

export const LIMITS = {
  /** Get Started call-backs and the legacy contact form. */
  lead: { max: 5, windowMs: 10 * 60_000 },
  /** Saved quotations. */
  estimate: { max: 10, windowMs: 10 * 60_000 },
  /** Cockpit password tries per visitor. */
  login: { max: 5, windowMs: 15 * 60_000 },
  /** Cockpit password tries from everyone combined — stops guessing from many IPs. */
  loginGlobal: { max: 30, windowMs: 60 * 60_000 },
} as const;

type Bucket = keyof typeof LIMITS;

const KEY = "rate-limits";
const LONGEST_WINDOW = Math.max(...Object.values(LIMITS).map((l) => l.windowMs));

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Records one attempt. Returns false if over the limit. With a request the
 * limit is per visitor (IP); without one it's shared by everyone.
 */
export async function allow(bucket: Bucket, request?: Request): Promise<boolean> {
  const { max, windowMs } = LIMITS[bucket];
  const id = request
    ? `${bucket}:${createHash("sha256").update(clientIp(request)).digest("hex").slice(0, 32)}`
    : `${bucket}:all`;
  const now = Date.now();

  return updateDoc<Record<string, number[]>, boolean>(KEY, {}, (doc) => {
    // Drop everything too old to matter for any bucket.
    for (const key of Object.keys(doc)) {
      doc[key] = doc[key].filter((t) => now - t < LONGEST_WINDOW);
      if (!doc[key].length) delete doc[key];
    }
    const recent = (doc[id] ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return false;
    doc[id] = [...recent, now];
    return true;
  });
}

export function tooManyRequests() {
  return NextResponse.json(
    {
      error:
        "Too many attempts from your connection. Please wait a few minutes and try again — or reach us on WhatsApp.",
    },
    { status: 429 }
  );
}
