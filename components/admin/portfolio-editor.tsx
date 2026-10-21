"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ClipboardPaste,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import { toWebp } from "@/lib/upload-image";
import {
  cleanProject,
  parsePastedRows,
  SERVICE_OPTIONS,
  slugify,
  type PortfolioProject,
} from "@/lib/portfolio-shared";

const input =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-950 focus:border-gold-400 focus:outline-none";
const label = "flex flex-col gap-1.5 text-sm font-medium text-navy-900";

function blankProject(): PortfolioProject {
  return {
    id: `new-${Date.now().toString(36)}`,
    title: "",
    type: "Website",
    service: "websites",
    summary: "",
    year: String(new Date().getFullYear()),
    visible: true,
    featured: false,
    features: [],
    stack: [],
    own: false,
  };
}

export function PortfolioEditor({
  initial,
  needsPassword,
}: {
  initial: PortfolioProject[];
  needsPassword: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [pasted, setPasted] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function update(id: string, patch: Partial<PortfolioProject>) {
    setDraft((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function move(index: number, by: number) {
    setDraft((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });
  }

  function remove(project: PortfolioProject) {
    if (!confirm(`Remove ${project.title || "this project"} from the portfolio?`)) return;
    setDraft((list) => list.filter((p) => p.id !== project.id));
  }

  function add() {
    const project = blankProject();
    setDraft((list) => [project, ...list]);
    setOpen(project.id);
  }

  async function upload(
    project: PortfolioProject,
    field: "image" | "imagePhone",
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setStatus(null);
    setUploading(`${project.id}:${field}`);
    try {
      const data = await toWebp(file, field === "image" ? 1600 : 600);
      const res = await fetch("/api/cockpit/portfolio/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, password: needsPassword ? password : undefined }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Upload failed.");
      update(project.id, { [field]: body.url });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(null);
    }
  }

  function runImport() {
    const { projects, skipped } = parsePastedRows(pasted);
    if (!projects.length) {
      setStatus({
        kind: "error",
        text: "Nothing to import. Copy the rows from the spreadsheet including the header row, then paste.",
      });
      return;
    }
    const problems: string[] = [];
    let added = 0;
    let updated = 0;
    const next = [...draft];
    for (const raw of projects) {
      const cleaned = cleanProject(raw);
      if ("error" in cleaned) {
        problems.push(cleaned.error);
        continue;
      }
      const existing = next.findIndex(
        (p) => p.id === cleaned.id || slugify(p.title) === cleaned.id
      );
      if (existing >= 0) {
        // Keep screenshots already uploaded for this project.
        const old = next[existing];
        next[existing] = {
          ...cleaned,
          id: old.id,
          image: cleaned.image ?? old.image,
          imagePhone: cleaned.imagePhone ?? old.imagePhone,
        };
        updated++;
      } else {
        next.push(cleaned);
        added++;
      }
    }
    setDraft(next);
    setImporting(false);
    setPasted("");
    setStatus({
      kind: problems.length ? "error" : "ok",
      text:
        `Imported ${added} new and updated ${updated} project${updated === 1 ? "" : "s"}` +
        (skipped ? `, skipped ${skipped} empty row${skipped === 1 ? "" : "s"}` : "") +
        ". Review, then press Save." +
        (problems.length ? ` Not imported: ${problems.join(" ")}` : ""),
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const res = await fetch("/api/cockpit/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projects: draft,
          password: needsPassword ? password : undefined,
        }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Could not save.");
      setSaved(body.projects);
      setDraft(body.projects);
      setOpen(null);
      setStatus({ kind: "ok", text: "Portfolio saved. The website shows the changes now." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  }

  const visibleCount = draft.filter((p) => p.visible).length;
  const featuredCount = draft.filter((p) => p.visible && p.featured).length;

  return (
    <form onSubmit={save} className="flex flex-col gap-5 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-600">
          {draft.length} projects · {visibleCount} on the website ·{" "}
          {featuredCount} on the home page
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setImporting((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:border-navy-400"
          >
            <ClipboardPaste className="size-4" aria-hidden="true" />
            Import from spreadsheet
          </button>
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 rounded-lg bg-navy-950 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add project
          </button>
        </div>
      </div>

      {importing ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-gold-300 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-navy-950">
            Import from the projects spreadsheet
          </h2>
          <p className="text-sm text-navy-600">
            In Excel, select the header row and the project rows on the Projects
            tab, copy (Ctrl+C), and paste below. Projects with the same name are
            updated; new ones are added. Nothing is saved until you press Save.
          </p>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={6}
            placeholder="Paste rows here, including the header row"
            className={cn(input, "font-mono text-xs")}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={runImport}
              className="rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gold-700"
            >
              Import rows
            </button>
            <button
              type="button"
              onClick={() => setImporting(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <ol className="flex flex-col gap-2">
        {draft.map((project, index) => {
          const expanded = open === project.id;
          return (
            <li
              key={project.id}
              className="overflow-hidden rounded-2xl border border-navy-100 bg-white"
            >
              <div className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={`Move ${project.title} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded p-0.5 text-navy-500 hover:bg-navy-50 disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${project.title} down`}
                    disabled={index === draft.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded p-0.5 text-navy-500 hover:bg-navy-50 disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border border-navy-100 bg-navy-50">
                  {project.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.image} alt="" className="size-full object-cover object-top" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-950">
                    {project.title || "Untitled project"}
                  </p>
                  <p className="truncate text-xs text-navy-500">
                    {project.type} · {project.year}
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-navy-700">
                  <input
                    type="checkbox"
                    checked={project.visible}
                    onChange={(e) => update(project.id, { visible: e.target.checked })}
                    className="accent-gold-600"
                  />
                  On website
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium text-navy-700">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(e) => update(project.id, { featured: e.target.checked })}
                    className="accent-gold-600"
                  />
                  Home page
                </label>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : project.id)}
                  aria-expanded={expanded}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-gold-700 hover:bg-gold-50"
                >
                  Edit
                  <ChevronDown
                    className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${project.title}`}
                  onClick={() => remove(project)}
                  className="rounded-lg p-1.5 text-navy-400 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              {expanded ? (
                <div className="grid gap-4 border-t border-navy-100 bg-navy-50/50 p-5 sm:grid-cols-2">
                  <label className={label}>
                    Project name *
                    <input className={input} value={project.title} onChange={(e) => update(project.id, { title: e.target.value })} />
                  </label>
                  <label className={label}>
                    Client / business name
                    <input className={input} value={project.client ?? ""} onChange={(e) => update(project.id, { client: e.target.value })} />
                  </label>
                  <label className={label}>
                    Project type *
                    <input className={input} value={project.type} onChange={(e) => update(project.id, { type: e.target.value })} />
                  </label>
                  <label className={label}>
                    Service *
                    <select className={input} value={project.service} onChange={(e) => update(project.id, { service: e.target.value })}>
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className={cn(label, "sm:col-span-2")}>
                    Short summary *
                    <textarea rows={2} className={input} value={project.summary} onChange={(e) => update(project.id, { summary: e.target.value })} />
                  </label>
                  <label className={label}>
                    Year completed *
                    <input className={input} inputMode="numeric" maxLength={4} value={project.year} onChange={(e) => update(project.id, { year: e.target.value })} />
                  </label>
                  <label className={label}>
                    Live website link
                    <input className={input} type="url" placeholder="https://" value={project.link ?? ""} onChange={(e) => update(project.id, { link: e.target.value })} />
                  </label>
                  <label className={label}>
                    Industry
                    <input className={input} value={project.industry ?? ""} onChange={(e) => update(project.id, { industry: e.target.value })} />
                  </label>
                  <label className={label}>
                    Location
                    <input className={input} value={project.location ?? ""} onChange={(e) => update(project.id, { location: e.target.value })} />
                  </label>
                  <label className={label}>
                    Key features (one per line)
                    <textarea rows={5} className={input} value={project.features.join("\n")} onChange={(e) => update(project.id, { features: e.target.value.split("\n") })} />
                  </label>
                  <div className="flex flex-col gap-4">
                    <label className={label}>
                      Built with (comma separated)
                      <input className={input} value={project.stack.join(", ")} onChange={(e) => update(project.id, { stack: e.target.value.split(",") })} />
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
                      <input type="checkbox" checked={project.own} onChange={(e) => update(project.id, { own: e.target.checked })} className="accent-gold-600" />
                      Our own product
                    </label>
                  </div>

                  {(["image", "imagePhone"] as const).map((field) => (
                    <div key={field} className={label}>
                      {field === "image" ? "Screenshot (desktop)" : "Screenshot (phone)"}
                      <div className="flex items-center gap-3">
                        <div className={cn("overflow-hidden rounded-md border border-navy-100 bg-white", field === "image" ? "h-20 w-32" : "h-20 w-10")}>
                          {project[field] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={project[field]} alt="" className="size-full object-cover object-top" />
                          ) : null}
                        </div>
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-navy-400">
                          <ImagePlus className="size-4" aria-hidden="true" />
                          {uploading === `${project.id}:${field}` ? "Uploading…" : project[field] ? "Replace" : "Upload"}
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(project, field, e)} />
                        </label>
                        {project[field] ? (
                          <button type="button" onClick={() => update(project.id, { [field]: undefined })} className="flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-red-700">
                            <X className="size-3.5" aria-hidden="true" /> Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  <details className="sm:col-span-2">
                    <summary className="cursor-pointer text-sm font-semibold text-navy-900">
                      Case study and client quote (optional)
                    </summary>
                    <div className="mt-3 grid gap-4 sm:grid-cols-3">
                      {(["challenge", "solution", "outcome"] as const).map((part) => (
                        <label key={part} className={label}>
                          {part === "challenge" ? "Challenge" : part === "solution" ? "Solution" : "Outcome (real facts only)"}
                          <textarea
                            rows={4}
                            className={input}
                            value={project.story?.[part] ?? ""}
                            onChange={(e) =>
                              update(project.id, {
                                story: {
                                  challenge: project.story?.challenge ?? "",
                                  solution: project.story?.solution ?? "",
                                  outcome: project.story?.outcome ?? "",
                                  [part]: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                      ))}
                      <label className={cn(label, "sm:col-span-3")}>
                        Client quote (only with their permission)
                        <textarea
                          rows={2}
                          className={input}
                          value={project.testimonial?.quote ?? ""}
                          onChange={(e) =>
                            update(project.id, {
                              testimonial: {
                                quote: e.target.value,
                                name: project.testimonial?.name ?? "",
                                role: project.testimonial?.role ?? "",
                              },
                            })
                          }
                        />
                      </label>
                      <label className={label}>
                        Quote by (name)
                        <input
                          className={input}
                          value={project.testimonial?.name ?? ""}
                          onChange={(e) =>
                            update(project.id, {
                              testimonial: {
                                quote: project.testimonial?.quote ?? "",
                                name: e.target.value,
                                role: project.testimonial?.role ?? "",
                              },
                            })
                          }
                        />
                      </label>
                      <label className={label}>
                        Quote by (role)
                        <input
                          className={input}
                          value={project.testimonial?.role ?? ""}
                          onChange={(e) =>
                            update(project.id, {
                              testimonial: {
                                quote: project.testimonial?.quote ?? "",
                                name: project.testimonial?.name ?? "",
                                role: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-navy-500">
                      Fill in all three of Challenge, Solution and Outcome to give
                      the project its own case-study page.
                    </p>
                  </details>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          {status ? (
            <p
              role={status.kind === "error" ? "alert" : "status"}
              className={cn(
                "flex-1 text-sm",
                status.kind === "error" ? "text-red-700" : "text-gold-700"
              )}
            >
              {status.text}
            </p>
          ) : (
            <p className="flex-1 text-sm text-navy-600">
              {dirty ? "You have unsaved changes." : "All changes saved."}
            </p>
          )}
          {needsPassword ? (
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(input, "w-44")}
            />
          ) : null}
          <button
            type="submit"
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 rounded-lg bg-gold-600 px-5 py-2 text-sm font-semibold text-white hover:bg-gold-700 disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden="true" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
