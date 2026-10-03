import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { hasDevices, startCeremony } from "@/lib/authenticator";
import { relyingParty } from "@/lib/webauthn";

export async function POST(request: Request) {
  if (!hasDevices()) {
    return NextResponse.json({ error: "No device is set up yet." }, { status: 409 });
  }
  const { rpID } = relyingParty(request);
  // No allowCredentials: the phone offers whichever Bluvig passkey it holds.
  const options = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  const ceremonyId = startCeremony("authenticate", options.challenge);
  return NextResponse.json({ ceremonyId, options });
}
