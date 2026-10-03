import { cookies } from "next/headers";

import { signToken, verifyToken } from "@/lib/admin-auth";
import { findDevice, type Device } from "@/lib/authenticator";

export const RP_NAME = "Bluvig Cockpit";
export const AUTHENTICATOR_USER_NAME = "bluvig-cockpit";

/**
 * Passkeys are bound to a domain. Set WEBAUTHN_ORIGIN (e.g. https://bluvig.co.ke)
 * in production; in development it falls back to the URL the request came in on.
 * Note: passkeys only work over HTTPS or on localhost.
 */
export function relyingParty(request: Request) {
  const origin = process.env.WEBAUTHN_ORIGIN ?? new URL(request.url).origin;
  return { origin, rpID: new URL(origin).hostname };
}

// ── Unlocked-authenticator session (short-lived, per device) ─────────────

export const AUTHENTICATOR_SESSION_COOKIE = "bluvig_authenticator";
const AUTHENTICATOR_SESSION_MAX_AGE = 10 * 60; // re-unlock after 10 minutes

export async function startAuthenticatorSession(deviceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    AUTHENTICATOR_SESSION_COOKIE,
    signToken(`device:${deviceId}`, AUTHENTICATOR_SESSION_MAX_AGE),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: AUTHENTICATOR_SESSION_MAX_AGE,
    }
  );
}

/** The unlocked device, or null. Revoking a device ends its session immediately. */
export async function getAuthenticatorDevice(): Promise<Device | null> {
  const cookieStore = await cookies();
  const payload = verifyToken(
    cookieStore.get(AUTHENTICATOR_SESSION_COOKIE)?.value
  );
  if (!payload?.startsWith("device:")) return null;
  return (await findDevice(payload.slice("device:".length))) ?? null;
}
