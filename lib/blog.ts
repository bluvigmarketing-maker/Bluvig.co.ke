import { randomBytes } from "node:crypto";
import type { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer";

import { BLOG_EXTENSIONS } from "@/lib/blog-extensions";
import {
  DEFAULT_CATEGORIES,
  isSafeHref,
  isSafeImageSrc,
  type BlogCategory,
  type BlogPost,
  type CleanPostInput,
} from "@/lib/blog-shared";
import { readDoc, updateDoc } from "@/lib/storage";

export * from "@/lib/blog-shared";

/**
 * Reading and saving the blog (server only). Every post and category lives
 * in one document; fine for hundreds of posts. Uploaded images are separate
 * documents (lib/portfolio-images.ts). Types are in lib/blog-shared.ts.
 */

interface BlogDoc {
  posts?: BlogPost[];
  categories?: BlogCategory[];
}

const KEY = "blog";

export class BlogError extends Error {}

/* ------------------------------------------------------------------ */
/* Reading                                                             */

/** For the cockpit: storage errors surface. */
export async function getBlogForEditing() {
  const doc = await readDoc<BlogDoc>(KEY, {});
  return {
    posts: doc.posts ?? [],
    categories: doc.categories ?? DEFAULT_CATEGORIES,
  };
}

/** For the public site. Never throws: an unreachable database shows an empty blog. */
async function getBlog() {
  try {
    return await getBlogForEditing();
  } catch (error) {
    console.error("[blog] showing no posts:", error);
    return { posts: [] as BlogPost[], categories: DEFAULT_CATEGORIES };
  }
}

export type PublicPost = BlogPost & { category?: BlogCategory };

/** Published posts, newest first, with their category attached. */
export async function getPublishedPosts(): Promise<PublicPost[]> {
  const { posts, categories } = await getBlog();
  const byId = new Map(categories.map((c) => [c.id, c]));
  return posts
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .map((p) => ({ ...p, category: p.categoryId ? byId.get(p.categoryId) : undefined }));
}

/** Categories that have at least one published post. */
export async function getActiveCategories() {
  const [{ categories }, posts] = await Promise.all([getBlog(), getPublishedPosts()]);
  return categories.filter((c) => posts.some((p) => p.categoryId === c.id));
}

export async function getPostBySlug(slug: string) {
  return (await getPublishedPosts()).find((p) => p.slug === slug);
}

/** Same category first, then the newest of the rest. */
export async function getRelatedPosts(post: BlogPost, limit = 3) {
  const others = (await getPublishedPosts()).filter((p) => p.id !== post.id);
  const same = others.filter((p) => post.categoryId && p.categoryId === post.categoryId);
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */

type Node = JSONContent;

const NODES = new Set([
  "doc", "paragraph", "text", "heading", "bulletList", "orderedList",
  "listItem", "blockquote", "horizontalRule", "hardBreak", "codeBlock", "image",
]);
const MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);

/**
 * Drops anything the blog schema doesn't know, plus unsafe link targets and
 * image sources, so a tampered request can't put script into a public page.
 */
function sanitize(node: Node): Node | null {
  if (!node || typeof node !== "object" || !NODES.has(node.type ?? "")) return null;
  if (node.type === "image" && !isSafeImageSrc(String(node.attrs?.src ?? ""))) {
    return null;
  }
  const marks = node.marks
    ?.filter((m) => MARKS.has(m?.type))
    .filter((m) => m.type !== "link" || isSafeHref(String(m.attrs?.href ?? "")));
  const content = node.content
    ?.map(sanitize)
    .filter((n): n is Node => n !== null);
  return { ...node, marks, content };
}

export function renderPostHtml(json: unknown) {
  const clean = sanitize(json as Node);
  if (!clean) throw new BlogError("The post content couldn't be read.");
  try {
    return { json: clean, html: renderToHTMLString({ content: clean, extensions: BLOG_EXTENSIONS }) };
  } catch (error) {
    console.error("[blog] render failed:", error);
    throw new BlogError("The post content couldn't be read. Reload the page and try again.");
  }
}

/* ------------------------------------------------------------------ */
/* Saving                                                              */

/** Creates (no id) or updates a post. Returns the saved post. */
export async function savePost(id: string | undefined, input: CleanPostInput) {
  const { json, html } = renderPostHtml(input.contentJson);
  const now = new Date().toISOString();
  return updateDoc<BlogDoc, BlogPost>(KEY, {}, (doc) => {
    doc.posts ??= [];
    if (doc.posts.some((p) => p.slug === input.slug && p.id !== id)) {
      throw new BlogError(`Another post already uses the URL /blog/${input.slug}. Change the slug.`);
    }
    const existing = id ? doc.posts.find((p) => p.id === id) : undefined;
    if (id && !existing) throw new BlogError("That post no longer exists.");

    const post: BlogPost = {
      ...input,
      contentJson: json,
      contentHtml: html,
      id: existing?.id ?? randomBytes(6).toString("base64url"),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      publishedAt:
        existing?.publishedAt ?? (input.status === "published" ? now : undefined),
    };
    doc.posts = existing
      ? doc.posts.map((p) => (p.id === post.id ? post : p))
      : [post, ...doc.posts];
    return post;
  });
}

export async function deletePost(id: string) {
  await updateDoc<BlogDoc, void>(KEY, {}, (doc) => {
    doc.posts = (doc.posts ?? []).filter((p) => p.id !== id);
  });
}

export async function saveCategories(categories: BlogCategory[]) {
  await updateDoc<BlogDoc, void>(KEY, {}, (doc) => {
    doc.categories = categories;
    // Posts in a deleted category become uncategorised.
    const ids = new Set(categories.map((c) => c.id));
    doc.posts = (doc.posts ?? []).map((p) =>
      p.categoryId && !ids.has(p.categoryId) ? { ...p, categoryId: undefined } : p
    );
  });
  return categories;
}
