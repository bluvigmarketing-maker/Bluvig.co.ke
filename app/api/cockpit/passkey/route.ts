import { NextResponse } from "next/server";

import { startCockpitSession } from "@/lib/admin-auth";
import { verifyPasskey } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

/**
 * One-tap cockpit sign-in: a passkey on this device (fingerprint, Face ID,
 * Windows Hello) or on a phone via the browser's QR-code prompt.
 * Challenge comes from /api/authenticator/unlock/options.
 */
export const POST = withStorageErrors(async (request: Request) => {
  const result = await verifyPasskey(
    request,
    await request.json().catch(() => ({}))
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }
  await startCockpitSession();
  return NextResponse.json({ ok: true });
});
