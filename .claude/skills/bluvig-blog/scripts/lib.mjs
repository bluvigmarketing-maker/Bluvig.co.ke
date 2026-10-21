// Shared helpers for the bluvig-blog skill: config, Markdown → Tiptap JSON,
// and loading the site's own analyzer + renderer so scores match the cockpit.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

/* ------------------------------------------------------------------ */
/* Project + config                                                    */

/** Walks up from the cwd to the folder holding the site's package.json. */
export function projectRoot() {
  let dir = process.cwd();
  while (true) {
    const pkg = path.join(dir, "package.json");
    if (existsSync(pkg) && readFileSync(pkg, "utf8").includes('"bluvig-website"')) return dir;
    const up = path.dirname(dir);
    if (up === dir) throw new Error("Run this from inside the Bluvig website repo.");
    dir = up;
  }
}

/** ADMIN_PASSWORD and BLUVIG_URL from the environment, else .env.local. */
export function config(root) {
  let password = process.env.ADMIN_PASSWORD;
  const envFile = path.join(root, ".env.local");
  if (!password && existsSync(envFile)) {
    const m = /^ADMIN_PASSWORD=(['"]?)(.*)\1\s*$/m.exec(readFileSync(envFile, "utf8"));
    password = m?.[2];
  }
  if (!password) throw new Error("Set ADMIN_PASSWORD (env or .env.local).");
  const baseUrl = (process.env.BLUVIG_URL || "https://www.bluvig.co.ke").replace(/\/$/, "");
  return { password, baseUrl };
}

/** Same rules as lib/portfolio-shared.ts slugify, so ids and slugs line up. */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/* ------------------------------------------------------------------ */
/* post.md                                                             */

/**
 * post.md = front matter (`key: value` lines between `---`) + Markdown body.
 * A final `## Frequently asked questions` section with `### Question` +
 * answer paragraphs becomes the post's FAQ (rendered and marked up as
 * FAQPage by the site), and is removed from the body.
 */
export function parsePostFile(file) {
  const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing front matter.`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([A-Za-z]+):\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  let body = m[2];
  const faq = [];
  const faqStart = body.search(/^## (Frequently asked questions|FAQs?)\s*$/im);
  if (faqStart >= 0) {
    const section = body.slice(faqStart).split("\n").slice(1).join("\n");
    body = body.slice(0, faqStart);
    for (const block of section.split(/^### /m).slice(1)) {
      const [q, ...rest] = block.split("\n");
      const answer = rest.join("\n").trim().replace(/\n{2,}/g, "\n\n");
      if (q.trim() && answer) faq.push({ question: q.trim(), answer: stripInline(answer) });
    }
  }
  return { meta, body, faq };
}

/** FAQ answers are plain text on the site: drop Markdown emphasis, keep link text. */
function stripInline(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

/* ------------------------------------------------------------------ */
/* Markdown → Tiptap JSON                                              */

/** Inline Markdown: **bold**, *italic*, `code`, [text](href). */
export function inline(src, marks = []) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m;
  const text = (t, mk) => {
    if (t) out.push(mk.length ? { type: "text", text: t, marks: mk } : { type: "text", text: t });
  };
  while ((m = re.exec(src))) {
    text(src.slice(last, m.index), marks);
    if (m[1] !== undefined) out.push(...inline(m[1], [...marks, { type: "bold" }]));
    else if (m[2] !== undefined) out.push(...inline(m[2], [...marks, { type: "italic" }]));
    else if (m[3] !== undefined) text(m[3], [...marks, { type: "code" }]);
    else out.push(...inline(m[4], [...marks, { type: "link", attrs: { href: m[5] } }]));
    last = re.lastIndex;
  }
  text(src.slice(last), marks);
  return out;
}

const para = (s) => ({ type: "paragraph", content: inline(s) });

/**
 * Block Markdown: ## / ### headings, paragraphs, - and 1. lists, > quotes,
 * ---, ![alt](src) images on their own line, and ```chart JSON``` blocks.
 * `resolveImage(src, alt)` and `renderChart(spec, index)` return an uploaded
 * image URL (async), so images end up on the site's own storage.
 */
export async function markdownToDoc(md, { resolveImage, renderChart }) {
  const lines = md.split("\n");
  const content = [];
  let i = 0;
  let charts = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```chart")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      const spec = JSON.parse(buf.join("\n"));
      const src = await renderChart(spec, ++charts);
      content.push({ type: "image", attrs: { src, alt: spec.alt ?? spec.title } });
      continue;
    }
    const h = /^(#{2,3}) (.*)$/.exec(line);
    if (h) {
      content.push({ type: "heading", attrs: { level: h[1].length }, content: inline(h[2].trim()) });
      i++;
      continue;
    }
    if (/^---+\s*$/.test(line)) { content.push({ type: "horizontalRule" }); i++; continue; }
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line);
    if (img) {
      content.push({ type: "image", attrs: { src: await resolveImage(img[2], img[1]), alt: img[1] } });
      i++;
      continue;
    }
    const bullet = /^\s*[-*] /;
    const ordered = /^\s*\d+[.)] /;
    if (bullet.test(line) || ordered.test(line)) {
      const isOrdered = ordered.test(line);
      const marker = isOrdered ? ordered : bullet;
      const items = [];
      while (i < lines.length && marker.test(lines[i])) {
        let item = lines[i].replace(marker, "");
        i++;
        // Wrapped continuation lines belong to the same item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !marker.test(lines[i])) {
          item += " " + lines[i].trim();
          i++;
        }
        items.push({ type: "listItem", content: [para(item.trim())] });
      }
      content.push({ type: isOrdered ? "orderedList" : "bulletList", content: items });
      continue;
    }
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      const paras = buf.join("\n").split(/\n\s*\n/).map((p) => para(p.replace(/\n/g, " ").trim()));
      content.push({ type: "blockquote", content: paras });
      continue;
    }
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,3} |```|>|---+\s*$|!\[)/.test(lines[i]) &&
      !bullet.test(lines[i]) &&
      !ordered.test(lines[i])
    ) {
      buf.push(lines[i++].trim());
    }
    content.push(para(buf.join(" ")));
  }
  return { type: "doc", content };
}

/* ------------------------------------------------------------------ */
/* The site's own analyzer and renderer                                */

/**
 * Transpiles lib/seo/*.ts and lib/blog-extensions.ts into node_modules/.cache
 * (inside the project, so their package imports resolve) and loads them.
 * A DOM comes from linkedom, so every analyzer check runs, as in the cockpit.
 */
export async function loadSiteTools(root) {
  const require = createRequire(path.join(root, "package.json"));
  const ts = require("typescript");
  const { DOMParser } = require("linkedom");
  globalThis.window ??= globalThis;
  // linkedom needs a full document; browsers accept bare fragments.
  globalThis.DOMParser ??= class {
    parseFromString(html, type) {
      const full = /<html[\s>]/i.test(html) ? html : `<!doctype html><html><body>${html}</body></html>`;
      return new DOMParser().parseFromString(full, type);
    }
  };

  const out = path.join(root, "node_modules", ".cache", "bluvig-blog");
  mkdirSync(out, { recursive: true });
  const build = (rel, name) => {
    const src = readFileSync(path.join(root, rel), "utf8");
    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText.replace(/from "\.\/text-stats"/g, 'from "./text-stats.mjs"');
    writeFileSync(path.join(out, name), js);
    return pathToFileURL(path.join(out, name)).href;
  };
  build("lib/seo/text-stats.ts", "text-stats.mjs");
  const { analyzeContent } = await import(build("lib/seo/analyze.ts", "analyze.mjs"));
  const { BLOG_EXTENSIONS } = await import(build("lib/blog-extensions.ts", "blog-extensions.mjs"));
  const { renderToHTMLString } = await import(
    pathToFileURL(require.resolve("@tiptap/static-renderer")).href
  );
  const renderHtml = (doc) => renderToHTMLString({ content: doc, extensions: BLOG_EXTENSIONS });
  return { analyzeContent, renderHtml };
}
