import { NextResponse } from "next/server";
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

import { consumeCeremony, findDevice, touchDevice } from "@/lib/authenticator";
import { relyingParty, startAuthenticatorSession } from "@/lib/webauthn";
import { withStorageErrors } from "@/lib/storage-errors";

export const POST = withStorageErrors(async (request: Request) => {
  const { ceremonyId, response } = (await request.json().catch(() => ({}))) as {
    ceremonyId?: string;
    response?: AuthenticationResponseJSON;
  };
  if (!ceremonyId || !response) {
    return NextResponse.json(
      { error: "Missing unlock data." },
      { status: 400 }
    );
  }

  const ceremony = await consumeCeremony(ceremonyId, "authenticate");
  if (!ceremony) {
    return NextResponse.json(
      { error: "Unlock expired. Try again." },
      { status: 400 }
    );
  }

  const device = await findDevice(response.id);
  if (!device) {
    return NextResponse.json(
      { error: "This passkey isn't registered (it may have been revoked)." },
      { status: 401 }
    );
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
    await startAuthenticatorSession(device.id);
    return NextResponse.json({ ok: true, deviceName: device.name });
  } catch {
    return NextResponse.json(
      { error: "Could not verify your passkey." },
      { status: 401 }
    );
  }
});
