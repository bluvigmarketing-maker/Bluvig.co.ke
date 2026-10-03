import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "bluvig_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD is not set — add it to .env.local to enable /cockpit."
    );
  }
  return secret;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Signs `payload` with an expiry: `<payload>.<expiresAtSeconds>.<hmac>`.
 * Stateless — the HMAC key is ADMIN_PASSWORD, so changing it logs everyone out.
 */
export function signToken(payload: string, maxAgeSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const body = `${payload}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

/** Returns the payload if the token is authentic and unexpired, else null. */
export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const lastDot = token.lastIndexOf(".");
    const body = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expected = createHmac("sha256", getSecret()).update(body).digest("hex");
    if (!safeEqual(sig, expected)) return null;
    const expDot = body.lastIndexOf(".");
    const exp = Number(body.slice(expDot + 1));
    if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
    return body.slice(0, expDot);
  } catch {
    return null;
  }
}

export function createSessionToken(): string {
  return signToken("cockpit", ADMIN_SESSION_MAX_AGE);
}

export function verifySessionToken(token: string | undefined): boolean {
  return verifyToken(token) === "cockpit";
}

/** Used only to enrol the first authenticator device (see lib/authenticator.ts). */
export function verifyPassword(candidate: string): boolean {
  return safeEqual(candidate, getSecret());
}

export async function isCockpitAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
