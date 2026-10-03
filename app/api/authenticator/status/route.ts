import { NextResponse } from "next/server";

import { hasDevices } from "@/lib/authenticator";
import { getAuthenticatorDevice } from "@/lib/webauthn";

export async function GET() {
  const device = await getAuthenticatorDevice();
  return NextResponse.json({
    hasDevices: await hasDevices(),
    unlocked: Boolean(device),
    deviceName: device?.name ?? null,
  });
}
