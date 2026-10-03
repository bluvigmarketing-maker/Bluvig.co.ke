import { NextResponse } from "next/server";

import { isCockpitAuthed } from "@/lib/admin-auth";
import { createEnrollCode } from "@/lib/authenticator";

/** One-time code for adding another phone — only obtainable from inside the cockpit. */
export async function POST() {
  if (!(await isCockpitAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json(await createEnrollCode());
}
