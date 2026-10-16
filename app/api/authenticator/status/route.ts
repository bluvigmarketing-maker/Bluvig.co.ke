import { NextResponse } from "next/server";

import { hasDevices } from "@/lib/authenticator";
import { hasPin } from "@/lib/cockpit-pin";
import { getAuthenticatorDevice } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

export const GET = withStorageErrors(async () => {
  const device = await getAuthenticatorDevice();
  return NextResponse.json({
    hasDevices: await hasDevices(),
    hasPin: await hasPin(),
    unlocked: Boolean(device),
    deviceName: device?.name ?? null,
  });
});
