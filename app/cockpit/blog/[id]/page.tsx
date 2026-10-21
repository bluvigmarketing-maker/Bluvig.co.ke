import { notFound, redirect } from "next/navigation";

import { canViewCockpit, isCockpitAuthed } from "@/lib/admin-auth";
import { getBlogForEditing } from "@/lib/blog";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { PostForm } from "@/components/admin/blog/post-form";

export const dynamic = "force-dynamic";

/** /cockpit/blog/new writes a new post; /cockpit/blog/<id> edits one. */
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await canViewCockpit())) redirect("/cockpit/login");
  const { id } = await params;

  let blog: Awaited<ReturnType<typeof getBlogForEditing>> | null = null;
  let error: string | null = null;
  try {
    blog = await getBlogForEditing();
  } catch (e) {
    console.error("[cockpit/blog]", e);
    error = describeStorageError(e);
  }
  const post = id === "new" ? undefined : blog?.posts.find((p) => p.id === id);
  if (blog && id !== "new" && !post) notFound();
  const needsPassword = !(await isCockpitAuthed());

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-2xl font-semibold text-navy-950">
            {post ? "Edit post" : "New post"}
          </h1>
          <CockpitNav />
        </div>
        {blog ? (
          <PostForm
            // A fresh form per post, so moving between posts resets it.
            key={post?.id ?? "new"}
            post={post}
            categories={blog.categories}
            otherFocusKeywords={blog.posts
              .filter((p) => p.id !== post?.id && p.focusKeyword)
              .map((p) => p.focusKeyword)}
            needsPassword={needsPassword}
          />
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
