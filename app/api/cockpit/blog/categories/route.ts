import { NextResponse } from "next/server";

import { cleanCategories, saveCategories } from "@/lib/blog";
import { cockpitAllowed, denied, refreshBlogPages } from "@/lib/blog-cockpit";
import { withStorageErrors } from "@/lib/storage-errors";

/** Save the whole category list. */
export const PUT = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    categories?: unknown;
  } | null;
  if (!(await cockpitAllowed(body?.password))) return denied();

  const cleaned = cleanCategories(body?.categories);
  if ("error" in cleaned) {
    return NextResponse.json({ error: cleaned.error }, { status: 400 });
  }
  const categories = await saveCategories(cleaned);
  refreshBlogPages();
  return NextResponse.json({ categories });
});
