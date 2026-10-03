import { NextResponse } from "next/server";

import { hasDevices } from "@/lib/authenticator";
import { getAuthenticatorDevice } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

export const GET = withStorageErrors(async () => {
  const device = await getAuthenticatorDevice();
  return NextResponse.json({
    hasDevices: await hasDevices(),
    unlocked: Boolean(device),
    deviceName: device?.name ?? null,
  });
});
