#!/usr/bin/env node
// Publishes content/blog/<slug>/post.md to the site through the cockpit API.
//
//   node .claude/skills/bluvig-blog/scripts/publish.mjs content/blog/<slug> [--check] [--draft] [--force]
//
//   --check  build images and score the post, but don't upload or publish
//   --draft  save as a draft instead of publishing
//   --force  publish even if the score is under the quality bar
//
// Env: ADMIN_PASSWORD (else read from .env.local), BLUVIG_URL (default
// https://www.bluvig.co.ke; use http://localhost:3000 to test locally).
// State (post id, uploaded image URLs) is kept in <dir>/published.json so a
// re-run updates the same post instead of creating a new one.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { config, loadSiteTools, markdownToDoc, parsePostFile, projectRoot, slugify } from "./lib.mjs";
import { renderChart, renderCover } from "./images.mjs";

const args = process.argv.slice(2);
const dir = path.resolve(args.find((a) => !a.startsWith("--")) ?? "");
const CHECK = args.includes("--check");
const DRAFT = args.includes("--draft");
const FORCE = args.includes("--force");
if (!existsSync(path.join(dir, "post.md"))) {
  console.error("Usage: publish.mjs content/blog/<slug> [--check] [--draft] [--force]");
  process.exit(1);
}

/** Minimum scores to publish without --force. */
const BAR = { overall: 80, seo: 75, readability: 60, aeo: 75, geo: 80 };

const root = projectRoot();
const { meta, body, faq } = parsePostFile(path.join(dir, "post.md"));
const stateFile = path.join(dir, "published.json");
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : { images: {} };
const cfg = CHECK ? null : config(root);

for (const key of ["title", "focusKeyword", "metaDescription", "excerpt"]) {
  if (!meta[key]) throw new Error(`post.md front matter needs "${key}".`);
}

/** Uploads a local image once (cached by content hash). In --check mode returns a placeholder. */
async function upload(file) {
  const bytes = readFileSync(file);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  if (state.images[hash]) return state.images[hash];
  if (CHECK) return "/api/portfolio/image/check-mode";
  const type = file.endsWith(".png") ? "image/png" : file.match(/\.jpe?g$/) ? "image/jpeg" : "image/webp";
  const res = await fetch(`${cfg.baseUrl}/api/cockpit/portfolio/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: cfg.password, data: `data:${type};base64,${bytes.toString("base64")}` }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Image upload failed (${path.basename(file)}): ${json.error ?? res.status}`);
  state.images[hash] = json.url;
  return json.url;
}

// Cover: post.md can name its own (cover: ./file.webp); otherwise one is drawn.
const author = meta.author || "Collins Kulei";
const coverFile = meta.cover
  ? path.join(dir, meta.cover)
  : await renderCover(root, { title: meta.coverTitle || meta.title, kicker: meta.category, author }, path.join(dir, "cover.webp"));
const coverImage = await upload(coverFile);

const doc = await markdownToDoc(body, {
  resolveImage: async (src) => (/^https?:\/\//.test(src) ? src : upload(path.join(dir, src))),
  renderChart: async (spec, n) => upload(await renderChart(root, spec, path.join(dir, `chart-${n}.webp`))),
});

const { analyzeContent, renderHtml } = await loadSiteTools(root);
const slug = slugify(meta.slug || meta.title);
const html = renderHtml(doc);
const result = analyzeContent({
  title: meta.title,
  metaTitle: meta.metaTitle || "",
  metaDescription: meta.metaDescription,
  slug,
  focusKeyword: meta.focusKeyword,
  contentHtml: html,
  excerpt: meta.excerpt,
  faqItemCount: faq.length,
  siteHost: new URL(cfg?.baseUrl ?? "https://bluvig.co.ke").hostname.replace(/^www\./, ""),
  otherFocusKeywords: [],
});

/* Report ---------------------------------------------------------------- */
const icon = { good: "✓", ok: "~", bad: "✗" };
console.log(`\n${meta.title}\n/blog/${slug} · ${result.wordCount} words · ${result.readingTimeMinutes} min · ${faq.length} FAQ`);
console.log(
  `Scores: overall ${result.overallScore} · SEO ${result.scores.seo} · readability ${result.scores.readability} · AEO ${result.scores.aeo} · GEO ${result.scores.geo}`
);
for (const c of result.checks.filter((c) => c.status !== "good")) {
  console.log(`  ${icon[c.status]} [${c.category}] ${c.label}: ${c.message}`);
}
const below = Object.entries(BAR).filter(([k, min]) =>
  (k === "overall" ? result.overallScore : result.scores[k]) < min
);
if (below.length) {
  console.log(`Below the bar: ${below.map(([k, min]) => `${k} < ${min}`).join(", ")}`);
}
if (CHECK) process.exit(below.length ? 2 : 0);
if (below.length && !FORCE) {
  console.error("Not published. Improve the post (or pass --force).");
  process.exit(2);
}

/* Publish --------------------------------------------------------------- */
const list = (s) => (s ?? "").split(",").map((t) => t.trim()).filter(Boolean);
const post = {
  title: meta.title,
  slug,
  excerpt: meta.excerpt,
  contentJson: doc,
  coverImage,
  ogImage: coverImage,
  categoryId: meta.category ? slugify(meta.category) : undefined,
  tags: list(meta.tags),
  author,
  status: DRAFT ? "draft" : "published",
  focusKeyword: meta.focusKeyword,
  secondaryKeywords: list(meta.secondaryKeywords),
  metaTitle: meta.metaTitle || "",
  metaDescription: meta.metaDescription,
  schemaType: meta.schemaType || "BlogPosting",
  faq,
  seoScore: result.scores.seo,
  readabilityScore: result.scores.readability,
  wordCount: result.wordCount,
  readingTimeMinutes: result.readingTimeMinutes,
};
const res = await fetch(`${cfg.baseUrl}/api/cockpit/blog`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: cfg.password, id: state.id, post }),
});
const json = await res.json().catch(() => ({}));
if (!res.ok) throw new Error(`Publish failed: ${json.error ?? res.status}`);
state.id = json.post.id;
state.slug = json.post.slug;
state.url = `${cfg.baseUrl}/blog/${json.post.slug}`;
state.status = json.post.status;
state.publishedAt = json.post.publishedAt;
state.updatedAt = json.post.updatedAt;
writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
console.log(`\n${state.status === "published" ? "Published" : "Saved draft"}: ${state.url}`);
