import { cookies } from "next/headers";
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

import { signToken, verifyToken } from "@/lib/admin-auth";
import {
  consumeCeremony,
  findDevice,
  touchDevice,
  type Device,
} from "@/lib/authenticator";

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

// ── Passkey check (shared by cockpit sign-in and authenticator unlock) ───

export type PasskeyResult =
  | { ok: true; device: Device }
  | { ok: false; error: string; status: number };

/**
 * Verifies a passkey assertion against a challenge from
 * /api/authenticator/unlock/options. One-shot: the challenge is burned.
 */
export async function verifyPasskey(
  request: Request,
  body: { ceremonyId?: string; response?: AuthenticationResponseJSON }
): Promise<PasskeyResult> {
  const { ceremonyId, response } = body;
  if (!ceremonyId || !response) {
    return { ok: false, error: "Missing passkey data.", status: 400 };
  }

  const ceremony = await consumeCeremony(ceremonyId, "authenticate");
  if (!ceremony) {
    return { ok: false, error: "Sign-in expired. Try again.", status: 400 };
  }

  const device = await findDevice(response.id);
  if (!device) {
    return {
      ok: false,
      error: "This passkey isn't registered (it may have been revoked).",
      status: 401,
    };
  }

  const { origin, rpID } = relyingParty(request);
  try {
    const { verified, authenticationInfo } = await verifyAuthenticationResponse(
      {
        response,
        expectedChallenge: ceremony.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
        credential: {
          id: device.id,
          publicKey: isoBase64URL.toBuffer(device.publicKey),
          counter: device.counter,
          transports: device.transports,
        },
      }
    );
    if (!verified) throw new Error("not verified");
    await touchDevice(device.id, authenticationInfo.newCounter);
    return { ok: true, device };
  } catch {
    return { ok: false, error: "Could not verify your passkey.", status: 401 };
  }
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
