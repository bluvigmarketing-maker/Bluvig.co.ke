import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { canViewCockpit, isCockpitAuthed } from "@/lib/admin-auth";
import { getBlogForEditing } from "@/lib/blog";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { CategoryEditor } from "@/components/admin/blog/category-editor";
import { PostList } from "@/components/admin/blog/post-list";

export const dynamic = "force-dynamic";

export default async function BlogCockpitPage() {
  if (!(await canViewCockpit())) redirect("/cockpit/login");

  let blog: Awaited<ReturnType<typeof getBlogForEditing>> | null = null;
  let error: string | null = null;
  try {
    blog = await getBlogForEditing();
  } catch (e) {
    console.error("[cockpit/blog]", e);
    error = describeStorageError(e);
  }
  const needsPassword = !(await isCockpitAuthed());
  const posts = [...(blog?.posts ?? [])].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">Blog</h1>
            <p className="text-sm text-navy-600">
              Posts on the{" "}
              <Link href="/blog" className="underline">
                Insights page
              </Link>
              . Each one is scored live for SEO, readability, AEO and GEO as you write.
            </p>
          </div>
          <CockpitNav />
        </div>
        {blog ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="flex flex-col gap-4">
              <Link
                href="/cockpit/blog/new"
                className="flex w-fit items-center gap-1.5 rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gold-700"
              >
                <Plus className="size-4" aria-hidden="true" /> New post
              </Link>
              <PostList posts={posts} categories={blog.categories} needsPassword={needsPassword} />
            </div>
            <CategoryEditor initial={blog.categories} needsPassword={needsPassword} />
          </div>
        ) : (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
