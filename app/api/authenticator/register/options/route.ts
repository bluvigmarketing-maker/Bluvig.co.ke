import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

import { verifyPassword } from "@/lib/admin-auth";
import { getDevices, isValidEnrollCode, startCeremony } from "@/lib/authenticator";
import { AUTHENTICATOR_USER_NAME, relyingParty, RP_NAME } from "@/lib/webauthn";

/**
 * Enrolling a phone needs one of:
 * - the ADMIN_PASSWORD, but only while no device exists yet (first setup / recovery), or
 * - a one-time code generated inside the cockpit (adding more phones).
 */
export async function POST(request: Request) {
  const { name, password, code } = (await request.json().catch(() => ({}))) as {
    name?: string;
    password?: string;
    code?: string;
  };

  const deviceName = name?.trim().slice(0, 40) || "My phone";
  const devices = getDevices();

  if (devices.length === 0) {
    if (!password || !verifyPassword(password)) {
      return NextResponse.json({ error: "Incorrect setup password." }, { status: 401 });
    }
  } else if (!code || !isValidEnrollCode(code)) {
    return NextResponse.json(
      { error: "That code is invalid or has expired. Generate a new one in the cockpit." },
      { status: 401 }
    );
  }

  const { rpID } = relyingParty(request);
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName: AUTHENTICATOR_USER_NAME,
    userDisplayName: `Bluvig Authenticator — ${deviceName}`,
    attestationType: "none",
    excludeCredentials: devices.map((d) => ({ id: d.id, transports: d.transports })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });

  const ceremonyId = startCeremony("register", options.challenge, {
    deviceName,
    enrollCode: devices.length === 0 ? undefined : code,
  });

  return NextResponse.json({ ceremonyId, options });
}
