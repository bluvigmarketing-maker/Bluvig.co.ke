/**
 * Blog types and helpers that are safe in the browser (no storage): the
 * cockpit editor uses these. Storage and HTML rendering live in lib/blog.ts.
 */

import { slugify } from "@/lib/portfolio-shared";

export { slugify };

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Primary JSON-LD type. FAQ items are always added as FAQPage alongside it. */
export const SCHEMA_TYPES = [
  { value: "BlogPosting", label: "Blog posting" },
  { value: "Article", label: "Article" },
  { value: "TechArticle", label: "Technical article (how-tos, guides)" },
] as const;
export type BlogSchemaType = (typeof SCHEMA_TYPES)[number]["value"];

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Rendered on the server from contentJson; what the public page prints. */
  contentHtml: string;
  /** Tiptap's own document, reopened in the editor. */
  contentJson: unknown;
  coverImage?: string;
  categoryId?: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  /** Set the first time the post is published. */
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;

  focusKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaType: BlogSchemaType;
  faq: FaqItem[];

  /** Cached from the editor's analyzer so the cockpit list can show them. */
  seoScore: number;
  readabilityScore: number;
  wordCount: number;
  readingTimeMinutes: number;
}

/** The cockpit's existing WordPress categories, until it saves its own. */
export const DEFAULT_CATEGORIES: BlogCategory[] = [
  { id: "website-development", name: "Website Development", slug: "website-development" },
  { id: "seo", name: "SEO", slug: "seo" },
  { id: "marketing", name: "Marketing", slug: "marketing" },
  { id: "ai-marketing", name: "AI Marketing", slug: "ai-marketing" },
];

/* ------------------------------------------------------------------ */
/* Validation                                                          */

export const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const list = (v: unknown, maxItems: number, max: number) =>
  Array.isArray(v)
    ? v.map((s) => text(s, max)).filter(Boolean).slice(0, maxItems)
    : [];
const score = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(0, Math.min(100, Math.round(v)))
    : 0;
const count = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;

/** Uploaded cockpit images (or the site's own /work files). */
export function isOwnImage(v: string) {
  return /^\/(work\/[\w.-]+|api\/portfolio\/image\/[\w-]+)$/.test(v);
}
const imagePath = (v: unknown) => {
  const s = text(v, 300);
  return isOwnImage(s) ? s : undefined;
};

/** Links allowed in post bodies: web, mail, phone, and on-site paths. */
export function isSafeHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href.trim());
}
/** Images allowed in post bodies: uploaded ones or any https image. */
export function isSafeImageSrc(src: string) {
  return isOwnImage(src) || /^https:\/\/\S+$/i.test(src);
}

export type CleanPostInput = Omit<BlogPost, "id" | "contentHtml" | "createdAt" | "updatedAt" | "publishedAt">;

/**
 * Cleans a post from the cockpit (everything but its HTML, which the server
 * renders). Returns an error message instead when something required is missing.
 */
export function cleanPost(
  input: unknown,
  categories: BlogCategory[]
): CleanPostInput | { error: string } {
  const p = (input ?? {}) as Record<string, unknown>;
  const title = text(p.title, 160);
  if (!title) return { error: "Give the post a title." };
  const slug = slugify(text(p.slug, 80) || title);
  if (!slug) return { error: "The URL slug needs at least one letter or number." };
  const status: BlogStatus = p.status === "published" ? "published" : "draft";

  const json = p.contentJson as { type?: unknown } | null;
  if (!json || json.type !== "doc") {
    return { error: "The post content couldn't be read. Reload the page and try again." };
  }

  const categoryId = text(p.categoryId, 60);
  const schemaType = SCHEMA_TYPES.some((s) => s.value === p.schemaType)
    ? (p.schemaType as BlogSchemaType)
    : "BlogPosting";
  const canonical = text(p.canonicalUrl, 500);
  if (canonical && !/^https:\/\/\S+$/i.test(canonical)) {
    return { error: "The canonical URL must start with https://, or be left empty." };
  }

  const faq = Array.isArray(p.faq)
    ? (p.faq as Record<string, unknown>[])
        .map((f) => ({ question: text(f?.question, 300), answer: text(f?.answer, 2000) }))
        .filter((f) => f.question && f.answer)
        .slice(0, 20)
    : [];

  return {
    title,
    slug,
    excerpt: text(p.excerpt, 400),
    contentJson: json,
    coverImage: imagePath(p.coverImage),
    categoryId: categories.some((c) => c.id === categoryId) ? categoryId : undefined,
    tags: list(p.tags, 12, 40),
    author: text(p.author, 80) || "Bluvig",
    status,
    focusKeyword: text(p.focusKeyword, 80),
    secondaryKeywords: list(p.secondaryKeywords, 10, 80),
    metaTitle: text(p.metaTitle, 120),
    metaDescription: text(p.metaDescription, 300),
    canonicalUrl: canonical || undefined,
    ogImage: imagePath(p.ogImage),
    schemaType,
    faq,
    seoScore: score(p.seoScore),
    readabilityScore: score(p.readabilityScore),
    wordCount: count(p.wordCount),
    readingTimeMinutes: Math.max(1, count(p.readingTimeMinutes)),
  };
}

/** Cleans the category list from the cockpit. */
export function cleanCategories(
  input: unknown
): BlogCategory[] | { error: string } {
  if (!Array.isArray(input) || input.length > 50) {
    return { error: "Nothing to save." };
  }
  const out: BlogCategory[] = [];
  for (const raw of input as Record<string, unknown>[]) {
    const name = text(raw?.name, 60);
    if (!name) return { error: "Every category needs a name." };
    const slug = slugify(name);
    if (!slug) return { error: `${name}: use at least one letter or number.` };
    if (out.some((c) => c.slug === slug)) {
      return { error: `There are two categories called ${name}.` };
    }
    const given = text(raw?.id, 60);
    let id = given && !given.startsWith("new-") ? given : slug;
    if (out.some((c) => c.id === id)) id = `${slug}-${out.length + 1}`;
    out.push({ id, name, slug });
  }
  return out;
}
