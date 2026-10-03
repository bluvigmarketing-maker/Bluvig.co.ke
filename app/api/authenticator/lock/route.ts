import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTHENTICATOR_SESSION_COOKIE } from "@/lib/webauthn";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTHENTICATOR_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
