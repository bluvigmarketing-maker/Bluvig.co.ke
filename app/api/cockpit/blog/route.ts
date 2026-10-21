import { NextResponse } from "next/server";

import {
  BlogError,
  cleanPost,
  deletePost,
  getBlogForEditing,
  savePost,
} from "@/lib/blog";
import { cockpitAllowed, denied, refreshBlogPages } from "@/lib/blog-cockpit";
import { withStorageErrors } from "@/lib/storage-errors";

/** Create (no id) or update a post. */
export const PUT = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    id?: string;
    post?: unknown;
  } | null;
  if (!(await cockpitAllowed(body?.password))) return denied();

  const { categories } = await getBlogForEditing();
  const cleaned = cleanPost(body?.post, categories);
  if ("error" in cleaned) {
    return NextResponse.json({ error: cleaned.error }, { status: 400 });
  }
  try {
    const post = await savePost(body?.id || undefined, cleaned);
    refreshBlogPages();
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof BlogError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
});

export const DELETE = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    id?: string;
  } | null;
  if (!(await cockpitAllowed(body?.password))) return denied();
  if (!body?.id) {
    return NextResponse.json({ error: "Which post?" }, { status: 400 });
  }
  await deletePost(body.id);
  refreshBlogPages();
  return NextResponse.json({ ok: true });
});
