"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import type { BlogCategory } from "@/lib/blog-shared";

const input =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-950 focus:border-gold-400 focus:outline-none";

export function CategoryEditor({
  initial,
  needsPassword,
}: {
  initial: BlogCategory[];
  needsPassword: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  async function save() {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/cockpit/blog/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: draft,
          password: needsPassword ? password : undefined,
        }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Couldn't save the categories.");
      setSaved(body.categories);
      setDraft(body.categories);
      setMessage({ kind: "ok", text: "Categories saved." });
      router.refresh();
    } catch (e) {
      setMessage({
        kind: "error",
        text: e instanceof Error ? e.message : "Couldn't save the categories.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-fit flex-col gap-3 rounded-xl border border-navy-100 bg-white p-5">
      <div>
        <h2 className="font-heading text-lg font-semibold text-navy-950">Categories</h2>
        <p className="text-xs text-navy-500">Removing a category leaves its posts uncategorised.</p>
      </div>
      <ul className="flex flex-col gap-2">
        {draft.map((c, i) => (
          <li key={c.id} className="flex items-center gap-2">
            <input
              className={input}
              aria-label={`Category ${i + 1}`}
              value={c.name}
              onChange={(e) =>
                setDraft((list) =>
                  list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                )
              }
            />
            <button
              type="button"
              aria-label={`Remove ${c.name || "category"}`}
              onClick={() => setDraft((list) => list.filter((_, j) => j !== i))}
              className="rounded-lg p-1.5 text-navy-400 hover:bg-red-50 hover:text-red-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setDraft((list) => [
            ...list,
            { id: `new-${Date.now().toString(36)}`, name: "", slug: "" },
          ])
        }
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-950"
      >
        <Plus className="size-4" aria-hidden="true" /> Add category
      </button>
      {needsPassword ? (
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      ) : null}
      <button
        type="button"
        disabled={!dirty || saving}
        onClick={save}
        className="rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gold-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save categories"}
      </button>
      {message ? (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={cn("text-sm", message.kind === "error" ? "text-red-700" : "text-gold-700")}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
