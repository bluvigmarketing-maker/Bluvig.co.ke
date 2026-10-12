import { NextResponse } from "next/server";

import { startAuthenticatorSession, verifyPasskey } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

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
  await startAuthenticatorSession(result.device.id);
  return NextResponse.json({ ok: true, deviceName: result.device.name });
});
