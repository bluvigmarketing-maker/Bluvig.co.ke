import { NextResponse } from "next/server";
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

import { addDevice, consumeCeremony } from "@/lib/authenticator";
import { relyingParty, startAuthenticatorSession } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

export const POST = withStorageErrors(async (request: Request) => {
  const { ceremonyId, response } = (await request.json().catch(() => ({}))) as {
    ceremonyId?: string;
    response?: RegistrationResponseJSON;
  };
  if (!ceremonyId || !response) {
    return NextResponse.json(
      { error: "Missing registration data." },
      { status: 400 }
    );
  }

  // One-shot: also burns the enrolment code, so a code can't add two phones.
  const ceremony = await consumeCeremony(ceremonyId, "register");
  if (!ceremony) {
    return NextResponse.json(
      { error: "Setup expired. Please start again." },
      { status: 400 }
    );
  }

  const { origin, rpID } = relyingParty(request);
  try {
    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response,
      expectedChallenge: ceremony.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
    if (!verified) throw new Error("not verified");

    const { credential } = registrationInfo;
    await addDevice({
      id: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports,
      name: ceremony.deviceName ?? "My phone",
    });
    await startAuthenticatorSession(credential.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not verify this passkey." },
      { status: 400 }
    );
  }
});
