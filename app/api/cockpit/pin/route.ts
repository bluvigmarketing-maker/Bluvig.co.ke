import { NextResponse } from "next/server";

import { isCockpitAuthed, startCockpitSession } from "@/lib/admin-auth";
import { PIN_PATTERN, removePin, setPin, verifyPin } from "@/lib/cockpit-pin";
import { allow } from "@/lib/rate-limit";
import { withStorageErrors } from "@/lib/storage-errors";

const readPin = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
  return String(body?.pin ?? "").replace(/\s/g, "");
};

const locked = () =>
  NextResponse.json(
    {
      error:
        "Too many wrong PINs. PIN sign-in is paused for a while — use your passkey, or try again later.",
    },
    { status: 429 }
  );

/** Sign in with the 8-digit PIN. */
export const POST = withStorageErrors(async (request: Request) => {
  const pin = await readPin(request);
  if (!PIN_PATTERN.test(pin)) {
    return NextResponse.json(
      { error: "Enter your 8-digit PIN." },
      { status: 400 }
    );
  }
  // Per visitor and across everyone, so the PIN can't be guessed from many IPs.
  if (!(await allow("pin", request)) || !(await allow("pinGlobal"))) return locked();

  if (!(await verifyPin(pin))) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }
  await startCockpitSession();
  return NextResponse.json({ ok: true });
});

/** Set or change the PIN (signed in only). */
export const PUT = withStorageErrors(async (request: Request) => {
  if (!(await isCockpitAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const pin = await readPin(request);
  if (!PIN_PATTERN.test(pin)) {
    return NextResponse.json(
      { error: "The PIN must be exactly 8 digits." },
      { status: 400 }
    );
  }
  await setPin(pin);
  return NextResponse.json({ ok: true });
});

/** Turn PIN sign-in off (signed in only). */
export const DELETE = withStorageErrors(async () => {
  if (!(await isCockpitAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  await removePin();
  return NextResponse.json({ ok: true });
});
