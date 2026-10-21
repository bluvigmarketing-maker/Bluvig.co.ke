import type { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { getActiveCategories, getPublishedPosts } from "@/lib/blog";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { PostCard } from "@/components/site/post-card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on software, websites, SEO and getting found online for businesses in Kenya.",
  alternates: { canonical: "/blog" },
};

/** Posts are written in the cockpit's Blog tab. `?category=<slug>` filters. */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [allPosts, categories] = await Promise.all([
    getPublishedPosts(),
    getActiveCategories(),
  ]);
  const current = categories.find((c) => c.slug === category);
  const posts = current
    ? allPosts.filter((p) => p.categoryId === current.id)
    : allPosts;

  const filter = (href: string, text: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-navy-950 text-white" : "text-navy-700 hover:bg-navy-50"
      )}
    >
      {text}
    </Link>
  );

  return (
    <>
      <PageHero
        title="Insights"
        description="Practical writing on software, websites, SEO and getting found online, for businesses in Kenya."
      />
      <section className="bg-white py-20">
        <Container className="flex flex-col gap-10">
          {categories.length > 1 ? (
            <nav aria-label="Categories" className="flex flex-wrap gap-1">
              {filter("/blog", "All", !current)}
              {categories.map((c) =>
                filter(`/blog?category=${c.slug}`, c.name, current?.id === c.id)
              )}
            </nav>
          ) : null}
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-navy-600">
              New posts are on the way. Check back soon.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
