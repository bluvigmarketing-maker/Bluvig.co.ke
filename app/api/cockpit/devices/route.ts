import { NextResponse } from "next/server";

import { isCockpitAuthed } from "@/lib/admin-auth";
import { removeDevice } from "@/lib/authenticator";
import { withStorageErrors } from "@/lib/storage-errors";

/** Revoke an authenticator device. Its unlocked session stops working immediately. */
export const DELETE = withStorageErrors(async (request: Request) => {
  if (!(await isCockpitAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id || !(await removeDevice(id))) {
    return NextResponse.json({ error: "Device not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
});
