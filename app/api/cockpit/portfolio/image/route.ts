import { NextResponse } from "next/server";

import { isCockpitAuthed, verifyPassword } from "@/lib/admin-auth";
import { saveImage, UploadError } from "@/lib/portfolio-images";
import { withStorageErrors } from "@/lib/storage-errors";

/** Upload one screenshot (already resized to WebP by the browser). */
export const POST = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    data?: string;
  } | null;

  const allowed =
    (await isCockpitAuthed()) ||
    (body?.password ? verifyPassword(body.password) : false);
  if (!allowed) {
    return NextResponse.json(
      { error: "Incorrect admin password." },
      { status: 401 }
    );
  }
  try {
    const url = await saveImage(String(body?.data ?? ""));
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
});
