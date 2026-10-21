import Image from "next/image";
import Link from "next/link";

import type { PublicPost } from "@/lib/blog";

export const postDate = new Intl.DateTimeFormat("en-KE", { dateStyle: "long" });

/** A blog post on the listing and under "More insights". */
export function PostCard({ post }: { post: PublicPost }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {post.coverImage ? (
        <div className="relative aspect-video overflow-hidden bg-navy-50">
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs font-semibold text-gold-700">
          {post.category?.name ?? "Insights"}
        </p>
        <h2 className="font-heading text-lg leading-snug font-semibold text-navy-950">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-gold-700">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-navy-700">{post.excerpt}</p>
        ) : null}
        <p className="mt-auto pt-2 text-xs text-navy-500">
          {post.publishedAt ? postDate.format(new Date(post.publishedAt)) : null}
          {" · "}
          {post.readingTimeMinutes} min read
        </p>
      </div>
    </article>
  );
}
