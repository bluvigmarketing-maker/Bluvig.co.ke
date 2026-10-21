"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import type { BlogCategory, BlogPost } from "@/lib/blog-shared";
import { scoreColor } from "@/components/admin/blog/seo-panel";

const dateFormat = new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" });

export function PostList({
  posts,
  categories,
  needsPassword,
}: {
  posts: BlogPost[];
  categories: BlogCategory[];
  needsPassword: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  async function remove(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    const password = needsPassword ? (prompt("Admin password") ?? "") : undefined;
    setError(null);
    setDeleting(post.id);
    try {
      const res = await fetch("/api/cockpit/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, password }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Couldn't delete the post.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete the post.");
    } finally {
      setDeleting(null);
    }
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-navy-100 bg-white px-5 py-8 text-center text-sm text-navy-600">
        No posts yet. Write the first one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
        {posts.map((post) => (
          <li key={post.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/cockpit/blog/${post.id}`}
                className="font-semibold text-navy-950 hover:text-gold-700"
              >
                {post.title}
              </Link>
              <p className="mt-0.5 text-xs text-navy-500">
                <span className={post.status === "published" ? "text-emerald-700" : "text-navy-600"}>
                  {post.status === "published" ? "Published" : "Draft"}
                </span>
                {" · "}
                {(post.categoryId && categoryName.get(post.categoryId)) || "No category"}
                {" · "}
                {post.wordCount} words · updated {dateFormat.format(new Date(post.updatedAt))}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-navy-500">
              <span>
                SEO <b className={cn("text-sm", scoreColor(post.seoScore))}>{post.seoScore}</b>
              </span>
              <span>
                Readability{" "}
                <b className={cn("text-sm", scoreColor(post.readabilityScore))}>
                  {post.readabilityScore}
                </b>
              </span>
              <button
                type="button"
                aria-label={`Delete ${post.title}`}
                disabled={deleting === post.id}
                onClick={() => remove(post)}
                className="rounded-lg p-1.5 text-navy-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
