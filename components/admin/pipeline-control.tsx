"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StickyNote } from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import { PIPELINE, type PipelineStatus } from "@/lib/pipeline";

async function save(body: Record<string, unknown>) {
  const res = await fetch("/api/cockpit/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await readJson(res)).error ?? "Could not save.");
}

/** Status picker + private note for one lead or estimate. */
export function PipelineControl({
  kind,
  id,
  status: initialStatus,
  note: initialNote = "",
}: {
  kind: "lead" | "estimate";
  id: string;
  status: PipelineStatus;
  note?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const style = PIPELINE.find((s) => s.id === status)!.style;

  async function changeStatus(next: PipelineStatus) {
    const previous = status;
    setStatus(next);
    setError(null);
    try {
      await save({ kind, id, status: next });
      router.refresh();
    } catch (e) {
      setStatus(previous);
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }

  async function saveNote() {
    setEditing(false);
    if (note.trim() === initialNote.trim()) return;
    setError(null);
    try {
      await save({ kind, id, note });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <select
        aria-label="Status"
        value={status}
        onChange={(e) => changeStatus(e.target.value as PipelineStatus)}
        className={cn(
          "cursor-pointer rounded-full border-0 py-0.5 pr-6 pl-2.5 text-xs font-semibold focus:ring-2 focus:ring-gold-400 focus:outline-none",
          style
        )}
      >
        {PIPELINE.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      {editing ? (
        <textarea
          autoFocus
          rows={2}
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setNote(initialNote);
              setEditing(false);
            }
          }}
          placeholder="e.g. Called Tue — wants a demo"
          className="w-44 rounded-lg border border-navy-200 px-2 py-1 text-xs text-navy-900 focus:border-gold-400 focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex max-w-44 items-start gap-1 text-left text-xs text-navy-500 hover:text-navy-900"
        >
          <StickyNote className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          {note ? (
            <span className="text-navy-700">{note}</span>
          ) : (
            "Add note"
          )}
        </button>
      )}

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
