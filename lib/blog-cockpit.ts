import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isCockpitAuthed, verifyPassword } from "@/lib/admin-auth";

/** Pages that show blog posts, refreshed after every change. */
export function refreshBlogPages() {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

/** Needs a cockpit session or, while cockpit sign-in is switched off, the ADMIN_PASSWORD. */
export async function cockpitAllowed(password: unknown) {
  return (
    (await isCockpitAuthed()) ||
    (typeof password === "string" && password ? verifyPassword(password) : false)
  );
}

export const denied = () =>
  NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
