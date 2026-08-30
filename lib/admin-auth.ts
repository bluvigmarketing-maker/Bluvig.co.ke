import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "bluvig_admin_session";

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD is not set — add it to .env.local to enable /admin."
    );
  }
  return secret;
}

/** Derives a session token from the shared admin password — no session store needed. */
export function createSessionToken(): string {
  return createHmac("sha256", getSecret()).update("bluvig-admin-session").digest("hex");
}

export function verifyPassword(candidate: string): boolean {
  const secret = getSecret();
  const a = Buffer.from(candidate);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const expected = createSessionToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
