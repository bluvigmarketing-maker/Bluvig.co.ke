import { NextResponse } from "next/server";

import { startCockpitSession, verifyPassword } from "@/lib/admin-auth";
import { allow } from "@/lib/rate-limit";
import { withStorageErrors } from "@/lib/storage-errors";

/** Sign in to the cockpit with ADMIN_PASSWORD. */
export const POST = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 });
  }

  // Per visitor and across everyone, so it can't be guessed from many IPs.
  if (!(await allow("login", request)) || !(await allow("loginGlobal"))) {
    return NextResponse.json(
      { error: "Too many wrong passwords. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  await startCockpitSession();
  return NextResponse.json({ ok: true });
});
