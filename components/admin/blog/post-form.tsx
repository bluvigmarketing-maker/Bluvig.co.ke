"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, ImagePlus, Plus, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import { SITE } from "@/lib/site";
import { uploadImage } from "@/lib/upload-image";
import { analyzeContent, type AnalyzeResult } from "@/lib/seo/analyze";
import {
  SCHEMA_TYPES,
  slugify,
  type BlogCategory,
  type BlogPost,
  type BlogSchemaType,
  type BlogStatus,
  type FaqItem,
} from "@/lib/blog-shared";
import { RichTextEditor } from "@/components/admin/blog/rich-text-editor";
import { SeoPanel, scoreColor } from "@/components/admin/blog/seo-panel";
import { SerpPreview } from "@/components/admin/blog/serp-preview";

const input =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-950 focus:border-gold-400 focus:outline-none";
const label = "flex flex-col gap-1.5 text-sm font-medium text-navy-900";
const hint = "text-xs font-normal text-navy-500";

const SITE_HOST = new URL(SITE.url).hostname;

/** The form's working copy: lists are edited as comma-separated text. */
interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  categoryId: string;
  tags: string;
  author: string;
  focusKeyword: string;
  secondaryKeywords: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  schemaType: BlogSchemaType;
  faq: FaqItem[];
}

function toForm(post?: BlogPost): FormState {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    coverImage: post?.coverImage ?? "",
    categoryId: post?.categoryId ?? "",
    tags: (post?.tags ?? []).join(", "),
    author: post?.author ?? SITE.name,
    focusKeyword: post?.focusKeyword ?? "",
    secondaryKeywords: (post?.secondaryKeywords ?? []).join(", "),
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
    canonicalUrl: post?.canonicalUrl ?? "",
    ogImage: post?.ogImage ?? "",
    schemaType: post?.schemaType ?? "BlogPosting",
    faq: post?.faq ?? [],
  };
}

const splitList = (s: string) =>
  s.split(",").map((t) => t.trim()).filter(Boolean);

type Tab = "publish" | "seo" | "analysis";

export function PostForm({
  post,
  categories,
  otherFocusKeywords,
  needsPassword,
}: {
  post?: BlogPost;
  categories: BlogCategory[];
  otherFocusKeywords: string[];
  needsPassword: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(post));
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [contentHtml, setContentHtml] = useState(post?.contentHtml ?? "");
  const [contentJson, setContentJson] = useState<unknown>(post?.contentJson ?? null);
  const [contentChanged, setContentChanged] = useState(false);
  const [savedForm, setSavedForm] = useState(() => toForm(post));
  const [tab, setTab] = useState<Tab>("publish");
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const status: BlogStatus = post?.status ?? "draft";
  const dirty = contentChanged || JSON.stringify(form) !== JSON.stringify(savedForm);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // The first report is the editor loading the saved post, not an edit.
  const editorReady = useRef(false);
  const onContentChange = useCallback((html: string, json: unknown) => {
    setContentHtml(html);
    setContentJson(json);
    if (editorReady.current) setContentChanged(true);
    editorReady.current = true;
  }, []);

  const analysisInput = useMemo(
    () => ({
      title: form.title,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      slug: form.slug,
      focusKeyword: form.focusKeyword,
      contentHtml,
      excerpt: form.excerpt,
      faqItemCount: form.faq.filter((f) => f.question.trim() && f.answer.trim()).length,
      siteHost: SITE_HOST,
      otherFocusKeywords,
    }),
    [form, contentHtml, otherFocusKeywords]
  );
  useEffect(() => {
    const timer = setTimeout(() => setAnalysis(analyzeContent(analysisInput)), 350);
    return () => clearTimeout(timer);
  }, [analysisInput]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pw = needsPassword ? password : undefined;

  async function upload(field: "coverImage" | "ogImage", file: File | undefined) {
    if (!file) return;
    setMessage(null);
    setUploading(field);
    try {
      set(field, await uploadImage(file, 1600, pw));
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(null);
    }
  }

  async function save(nextStatus: BlogStatus) {
    setMessage(null);
    setSaving(true);
    // Score the exact content being saved, not the last debounced run.
    const result = analyzeContent(analysisInput);
    try {
      const res = await fetch("/api/cockpit/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pw,
          id: post?.id,
          post: {
            ...form,
            tags: splitList(form.tags),
            secondaryKeywords: splitList(form.secondaryKeywords),
            contentJson,
            status: nextStatus,
            seoScore: result.scores.seo,
            readabilityScore: result.scores.readability,
            wordCount: result.wordCount,
            readingTimeMinutes: result.readingTimeMinutes,
          },
        }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Couldn't save the post.");
      const saved = body.post as BlogPost;
      const next = toForm(saved);
      setForm(next);
      setSavedForm(next);
      setContentChanged(false);
      setMessage({
        kind: "ok",
        text: nextStatus === "published" ? "Published." : "Draft saved.",
      });
      if (!post) router.replace(`/cockpit/blog/${saved.id}`);
      router.refresh();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Couldn't save the post." });
    } finally {
      setSaving(false);
    }
  }

  function updateFaq(index: number, patch: Partial<FaqItem>) {
    set("faq", form.faq.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  const imageField = (field: "coverImage" | "ogImage", title: string, note: string) => (
    <div className={label}>
      {title}
      <div className="flex items-center gap-3">
        <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-md border border-navy-100 bg-navy-50">
          {form[field] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form[field]} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-400">
            <ImagePlus className="size-4" aria-hidden="true" />
            {uploading === field ? "Uploading…" : form[field] ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                upload(field, e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {form[field] ? (
            <button
              type="button"
              onClick={() => set(field, "")}
              className="flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-red-700"
            >
              <X className="size-3.5" aria-hidden="true" /> Remove
            </button>
          ) : null}
        </div>
      </div>
      <span className={hint}>{note}</span>
    </div>
  );

  const seoTitle = form.metaTitle || form.title;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Content */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Link
          href="/cockpit/blog"
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-950"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> All posts
        </Link>
        <label className={label}>
          Title
          <input
            className={cn(input, "py-3 text-lg font-semibold")}
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              // The slug follows the title until it's edited by hand.
              setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
            }}
            placeholder="e.g. How Much Does Custom Software Cost in Kenya?"
          />
        </label>
        <label className={label}>
          URL slug
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-500">/blog/</span>
            <input
              className={input}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              onBlur={() => set("slug", slugify(form.slug))}
            />
          </div>
        </label>
        <label className={label}>
          Excerpt
          <textarea
            rows={2}
            className={input}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="One or two sentences shown on the blog listing."
          />
        </label>

        <div className={label}>
          Content
          <RichTextEditor
            content={post?.contentJson ?? null}
            onChange={onContentChange}
            password={pw}
            onError={(text) => setMessage({ kind: "error", text })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-navy-900">
              FAQ <span className={hint}>(optional; a strong AEO signal)</span>
            </p>
            <button
              type="button"
              onClick={() => set("faq", [...form.faq, { question: "", answer: "" }])}
              className="flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-400"
            >
              <Plus className="size-3.5" aria-hidden="true" /> Add question
            </button>
          </div>
          {form.faq.map((item, index) => (
            <div key={index} className="flex items-start gap-2 rounded-xl border border-navy-100 bg-white p-4">
              <div className="flex flex-1 flex-col gap-2">
                <input
                  className={input}
                  aria-label={`Question ${index + 1}`}
                  value={item.question}
                  onChange={(e) => updateFaq(index, { question: e.target.value })}
                  placeholder="Question, e.g. How long does an M-Pesa integration take?"
                />
                <textarea
                  rows={2}
                  className={input}
                  aria-label={`Answer ${index + 1}`}
                  value={item.answer}
                  onChange={(e) => updateFaq(index, { answer: e.target.value })}
                  placeholder="A direct, concise answer."
                />
              </div>
              <button
                type="button"
                aria-label={`Remove question ${index + 1}`}
                onClick={() => set("faq", form.faq.filter((_, i) => i !== index))}
                className="rounded-lg p-1.5 text-navy-400 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          {form.faq.length === 0 ? (
            <p className={hint}>
              No questions yet. Answer engines lift FAQ answers directly, and they&apos;re
              published as FAQ structured data.
            </p>
          ) : null}
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:h-fit">
        <div className="flex flex-col gap-3 rounded-xl border border-navy-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-navy-900">
              {status === "published" ? "Published" : post ? "Draft" : "New post"}
            </span>
            {status === "published" && post ? (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
              >
                View <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          {needsPassword ? (
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => save("draft")}
              className="flex-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-400 disabled:opacity-50"
            >
              {status === "published" ? "Unpublish" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save("published")}
              className="flex-1 rounded-lg bg-gold-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gold-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : status === "published" ? "Update" : "Publish"}
            </button>
          </div>
          {message ? (
            <p
              role={message.kind === "error" ? "alert" : "status"}
              className={cn("text-sm", message.kind === "error" ? "text-red-700" : "text-gold-700")}
            >
              {message.text}
            </p>
          ) : (
            <p className="text-xs text-navy-500">
              {dirty ? "You have unsaved changes." : "All changes saved."}
            </p>
          )}
        </div>

        <div role="tablist" aria-label="Post settings" className="flex gap-1 rounded-full border border-navy-100 bg-white p-1 text-sm">
          {(
            [
              ["publish", "Publish"],
              ["seo", "SEO / AEO"],
              ["analysis", "Analysis"],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors",
                tab === value ? "bg-navy-950 text-white" : "text-navy-700 hover:bg-navy-50"
              )}
            >
              {text}
              {value === "analysis" && analysis ? (
                <span className={cn("text-xs font-bold", tab === value ? "text-white" : scoreColor(analysis.overallScore))}>
                  {analysis.overallScore}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === "publish" ? (
          <div role="tabpanel" className="flex flex-col gap-5">
            {imageField("coverImage", "Cover image", "Shown on the listing and at the top of the post. 16:9 works best.")}
            <label className={label}>
              Category
              <select className={input} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Tags <span className={hint}>Comma separated</span>
              <input className={input} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </label>
            <label className={label}>
              Author
              <input className={input} value={form.author} onChange={(e) => set("author", e.target.value)} />
            </label>
            <label className={label}>
              Structured data type
              <select
                className={input}
                value={form.schemaType}
                onChange={(e) => set("schemaType", e.target.value as BlogSchemaType)}
              >
                {SCHEMA_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className={hint}>
                The JSON-LD type published with the post. FAQ questions are always added as
                FAQPage data alongside it.
              </span>
            </label>
          </div>
        ) : null}

        {tab === "seo" ? (
          <div role="tabpanel" className="flex flex-col gap-5">
            <SerpPreview title={seoTitle} slug={form.slug} description={form.metaDescription} />
            <label className={label}>
              Focus keyword
              <input
                className={input}
                value={form.focusKeyword}
                onChange={(e) => set("focusKeyword", e.target.value)}
                placeholder="e.g. custom software cost kenya"
              />
            </label>
            <label className={label}>
              Secondary keywords <span className={hint}>Comma separated</span>
              <input
                className={input}
                value={form.secondaryKeywords}
                onChange={(e) => set("secondaryKeywords", e.target.value)}
              />
            </label>
            <label className={label}>
              SEO title <span className={hint}>Leave empty to use the post title</span>
              <input className={input} value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
              <span className={hint}>{seoTitle.length} characters (30 to 60 is ideal)</span>
            </label>
            <label className={label}>
              Meta description
              <textarea
                rows={3}
                className={input}
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
              />
              <span className={hint}>{form.metaDescription.length} characters (120 to 156 is ideal)</span>
            </label>
            <label className={label}>
              Canonical URL <span className={hint}>Only if this post first appeared elsewhere</span>
              <input
                className={input}
                type="url"
                placeholder="https://"
                value={form.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
              />
            </label>
            {imageField("ogImage", "Social share image", "For WhatsApp, LinkedIn and X previews. Defaults to the cover image.")}
          </div>
        ) : null}

        {tab === "analysis" ? (
          <div role="tabpanel">
            {analysis ? (
              <SeoPanel result={analysis} />
            ) : (
              <p className="text-sm text-navy-500">Analysing…</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
