import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SITE } from "@/lib/site";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/blog";
import { Container } from "@/components/site/container";
import { JsonLd } from "@/components/site/json-ld";
import { PostCard, postDate } from "@/components/site/post-card";
import { FinalCta } from "@/components/home/final-cta";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  const image = post.ogImage || post.coverImage;
  return {
    // The SEO title is written whole; skip the "| Bluvig" template.
    title: post.metaTitle ? { absolute: post.metaTitle } : post.title,
    description,
    keywords: [post.focusKeyword, ...post.secondaryKeywords].filter(Boolean),
    alternates: { canonical: post.canonicalUrl || `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);
  const url = `${SITE.url}/blog/${post.slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": post.schemaType,
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverImage ? [`${SITE.url}${post.coverImage}`] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    wordCount: post.wordCount,
    keywords: [post.focusKeyword, ...post.secondaryKeywords].filter(Boolean).join(", ") || undefined,
    articleSection: post.category?.name,
    author:
      post.author === SITE.name
        ? { "@id": `${SITE.url}/#organization` }
        : { "@type": "Person", name: post.author },
    publisher: { "@id": `${SITE.url}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  const faq =
    post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Insights", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 2, name: post.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={article} />
      {faq ? <JsonLd data={faq} /> : null}
      <JsonLd data={breadcrumbs} />

      <article>
        <header className="bg-navy-950 py-16 text-white sm:py-20">
          <Container className="flex max-w-3xl flex-col items-center gap-5 text-center">
            {post.category ? (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-xs font-semibold text-gold-300 hover:text-gold-200"
              >
                {post.category.name}
              </Link>
            ) : null}
            <h1 className="font-heading text-3xl font-bold text-balance sm:text-5xl">
              {post.title}
            </h1>
            <span className="h-px w-16 bg-gold-400" />
            <p className="text-sm text-navy-200">
              {post.author}
              {post.publishedAt ? (
                <>
                  {" · "}
                  <time dateTime={post.publishedAt}>
                    {postDate.format(new Date(post.publishedAt))}
                  </time>
                </>
              ) : null}
              {" · "}
              {post.readingTimeMinutes} min read
            </p>
          </Container>
        </header>

        <Container className="max-w-3xl py-16 sm:py-20">
          {post.coverImage ? (
            <div className="relative mb-12 aspect-video overflow-hidden rounded-2xl bg-navy-50">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div
            className="prose prose-bluvig max-w-none"
            // Rendered on the server from the post's Tiptap JSON (lib/blog.ts).
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {post.faq.length > 0 ? (
            <section className="mt-16">
              <h2 className="font-heading text-2xl font-semibold text-navy-950">
                Frequently asked questions
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                {post.faq.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-xl border border-navy-100 p-4 open:bg-navy-50"
                  >
                    <summary className="cursor-pointer font-semibold text-navy-950">
                      {item.question}
                    </summary>
                    <p className="mt-2.5 leading-relaxed whitespace-pre-line text-navy-700">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {post.tags.length > 0 ? (
            <p className="mt-12 text-sm text-navy-500">Tagged: {post.tags.join(", ")}</p>
          ) : null}
        </Container>
      </article>

      {related.length > 0 ? (
        <section className="bg-navy-50 py-20">
          <Container className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-semibold text-navy-950 sm:text-3xl">
                More insights
              </h2>
              <Link href="/blog" className="text-sm font-semibold text-gold-700 hover:underline">
                All posts
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <FinalCta />
    </>
  );
}
