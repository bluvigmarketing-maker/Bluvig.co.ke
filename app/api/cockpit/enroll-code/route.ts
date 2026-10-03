import { NextResponse } from "next/server";

import { isCockpitAuthed } from "@/lib/admin-auth";
import { createEnrollCode } from "@/lib/authenticator";
import { withStorageErrors } from "@/lib/storage-errors";

/** One-time code for adding another phone — only obtainable from inside the cockpit. */
export const POST = withStorageErrors(async () => {
  if (!(await isCockpitAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json(await createEnrollCode());
});
