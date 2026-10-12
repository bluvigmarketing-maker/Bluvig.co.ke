import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

import { readJson } from "@/lib/read-json";

/** Browser-side passkey ceremonies. Each throws an Error with a readable message. */

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json;
}

/** Signs this browser in to the cockpit with a passkey. */
export async function signInWithPasskey() {
  const { ceremonyId, options } = await post(
    "/api/authenticator/unlock/options"
  );
  const response = await startAuthentication({ optionsJSON: options });
  await post("/api/cockpit/passkey", { ceremonyId, response });
}

/** Creates a passkey on this device (and signs in). */
export async function createPasskey(details: {
  name: string;
  password?: string;
  code?: string;
}) {
  const { ceremonyId, options } = await post(
    "/api/authenticator/register/options",
    details
  );
  const response = await startRegistration({ optionsJSON: options });
  await post("/api/authenticator/register/verify", { ceremonyId, response });
}

/** A short device label from the user agent, e.g. "Chrome on Windows". */
export function guessDeviceName() {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X/.test(ua)
            ? "Mac"
            : "Computer";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : null;
  return browser ? `${browser} on ${os}` : os;
}

export function passkeyError(error: unknown) {
  if (error instanceof Error && error.name === "NotAllowedError") {
    return "Cancelled or timed out. Try again.";
  }
  if (error instanceof Error && error.name === "InvalidStateError") {
    return "This device already has a Bluvig passkey. Use Sign in instead.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
