"use client";

import { useState } from "react";
import { Bot, Globe, Link2, Plus, Rocket, X } from "lucide-react";

import { normalizeUrl, type Materials } from "@/lib/materials";

/**
 * Optional "Share your ideas" block: AI brainstorming chats, inspiration
 * websites and an AI-built prototype. Controlled — the parent owns the value.
 */
export function MaterialsFields({
  value,
  onChange,
}: {
  value: Materials;
  onChange: (next: Materials) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <LinkList
        icon={Bot}
        label="AI chats you used to brainstorm"
        hint="Share links from ChatGPT, Claude, Gemini…"
        placeholder="https://chatgpt.com/share/…"
        links={value.aiChats}
        onChange={(aiChats) => onChange({ ...value, aiChats })}
      />
      <LinkList
        icon={Globe}
        label="Websites you like"
        hint="Sites we can use as inspiration."
        placeholder="e.g. example.com"
        links={value.inspirations}
        onChange={(inspirations) => onChange({ ...value, inspirations })}
      />
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-2 text-sm font-medium text-navy-900">
          <Rocket className="size-4 text-gold-600" aria-hidden="true" />A
          prototype you built with AI
        </span>
        <span className="text-xs text-navy-500">
          Lovable, v0, Bolt, Replit or similar.
        </span>
        <input
          type="url"
          inputMode="url"
          value={value.prototype}
          onChange={(e) => onChange({ ...value, prototype: e.target.value })}
          placeholder="https://your-prototype.lovable.app"
          aria-label="Prototype link"
          className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-950 focus:border-gold-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

function LinkList({
  icon: Icon,
  label,
  hint,
  placeholder,
  links,
  onChange,
}: {
  icon: typeof Bot;
  label: string;
  hint: string;
  placeholder: string;
  links: string[];
  onChange: (links: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    if (!draft.trim()) return;
    const url = normalizeUrl(draft);
    if (!url) return setError("That doesn't look like a link.");
    if (links.length >= 5) return setError("Up to 5 links.");
    onChange([...new Set([...links, url])]);
    setDraft("");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-navy-900">
        <Icon className="size-4 text-gold-600" aria-hidden="true" />
        {label}
      </span>
      <span className="text-xs text-navy-500">{hint}</span>
      {links.length ? (
        <ul className="flex flex-col gap-1.5">
          {links.map((link) => (
            <li
              key={link}
              className="flex items-center gap-2 rounded-lg border border-navy-100 bg-navy-50 px-3 py-1.5 text-sm text-navy-800"
            >
              <Link2
                className="size-3.5 shrink-0 text-navy-500"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate">{link}</span>
              <button
                type="button"
                aria-label={`Remove ${link}`}
                onClick={() => onChange(links.filter((l) => l !== link))}
                className="rounded p-0.5 text-navy-500 hover:bg-navy-100 hover:text-navy-900"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <input
          type="url"
          inputMode="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={() => draft.trim() && add()}
          placeholder={placeholder}
          aria-label={label}
          className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-950 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-xl border border-navy-200 bg-white px-3 text-sm font-medium text-navy-800 hover:bg-navy-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </button>
      </div>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
