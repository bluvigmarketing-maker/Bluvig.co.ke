"use client";

import { useId, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track-client";

/**
 * "Describe it in one message": the fastest way to start a project. The
 * visitor types what they need (optionally tapping what kind of build it
 * is), and it opens WhatsApp with the message ready to send.
 */

const KINDS = [
  "Website",
  "Web app",
  "Mobile app",
  "Business system",
  "M-Pesa payments",
];

export function buildBrief(text: string, kinds: string[], page: string) {
  const lines = ["Hi Bluvig, I'd like to discuss a project."];
  if (kinds.length) lines.push(`Looking for: ${kinds.join(", ")}`);
  if (text.trim()) lines.push("", text.trim());
  lines.push("", `(Sent from bluvig.co.ke${page === "/" ? "" : page})`);
  return lines.join("\n");
}

export function WhatsAppBrief({
  tone = "light",
  autoFocus = false,
  className,
}: {
  /** `dark` for use on navy backgrounds. */
  tone?: "light" | "dark";
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const page = usePathname() ?? "/";
  const [text, setText] = useState("");
  const [kinds, setKinds] = useState<string[]>([]);
  const dark = tone === "dark";
  const ready = text.trim().length > 0 || kinds.length > 0;

  function toggle(kind: string) {
    setKinds((current) =>
      current.includes(kind)
        ? current.filter((k) => k !== kind)
        : [...current, kind]
    );
  }

  function send(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    track("whatsapp_brief");
    const message = buildBrief(text, kinds, page);
    window.open(
      `${SITE.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <form onSubmit={send} className={cn("flex flex-col gap-3", className)}>
      <label
        htmlFor={`${id}-text`}
        className={cn(
          "text-sm font-semibold",
          dark ? "text-white" : "text-navy-950"
        )}
      >
        Describe what you need in one message
      </label>

      <div
        role="group"
        aria-label="What kind of project"
        className="flex flex-wrap gap-1.5"
      >
        {KINDS.map((kind) => {
          const on = kinds.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(kind)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150",
                on
                  ? "border-gold-500 bg-gold-500 text-white"
                  : dark
                    ? "border-white/25 text-navy-100 hover:border-white/50"
                    : "border-navy-200 text-navy-700 hover:border-navy-400"
              )}
            >
              {kind}
            </button>
          );
        })}
      </div>

      <textarea
        id={`${id}-text`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        autoFocus={autoFocus}
        placeholder="e.g. A booking website for my salon where clients pay a deposit by M-Pesa."
        className={cn(
          "w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gold-400",
          dark
            ? "border-white/20 bg-white/10 text-white placeholder:text-navy-300"
            : "border-navy-200 bg-white text-navy-950 placeholder:text-navy-400"
        )}
      />

      <button
        type="submit"
        disabled={!ready}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white transition-[background-color,opacity,transform] duration-150 hover:bg-[#1ebe5b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="size-4" aria-hidden="true" />
        Send on WhatsApp
      </button>
      <p className={cn("text-xs", dark ? "text-navy-300" : "text-navy-500")}>
        Opens WhatsApp with your message ready. We reply during East Africa
        business hours.
      </p>
    </form>
  );
}
