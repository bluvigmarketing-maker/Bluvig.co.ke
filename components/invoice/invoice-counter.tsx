"use client";

import { useEffect, useRef, useState } from "react";
import { FileCheck2 } from "lucide-react";

/** Fired by the generator after each download, so the number ticks up live. */
export const INVOICE_MADE_EVENT = "bluvig:invoice-made";

/** How often to check for downloads by other visitors. */
const POLL_MS = 30_000;

async function fetchCount(): Promise<number | null> {
  try {
    const r = await fetch("/api/tools/invoice-count", { cache: "no-store" });
    const data = (await r.json()) as { count?: number };
    return typeof data.count === "number" ? data.count : null;
  } catch {
    return null;
  }
}

/**
 * Round "1,284 invoices & quotes generated" badge in the page hero. Counts
 * up from 0 on arrival, then ticks up (with a pulse) whenever a real
 * download happens — this visitor's straight away, others' within ~30s.
 */
export function InvoiceCounter() {
  const [shown, setShown] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const shownRef = useRef(0);
  const targetRef = useRef<number | null>(null);

  // Load the real total, then keep checking while the tab is visible.
  useEffect(() => {
    let cancelled = false;
    const raise = (next: number | null) => {
      if (cancelled || next === null) return;
      const current = targetRef.current;
      if (current !== null && next <= current) return;
      targetRef.current = next;
      setTarget(next);
      if (current !== null) setPulse((p) => p + 1);
    };
    fetchCount().then(raise);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchCount().then(raise);
    }, POLL_MS);
    const bump = () => {
      if (targetRef.current === null) return;
      targetRef.current += 1;
      setTarget(targetRef.current);
      setPulse((p) => p + 1);
    };
    window.addEventListener(INVOICE_MADE_EVENT, bump);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(INVOICE_MADE_EVENT, bump);
    };
  }, []);

  // Roll the visible number up to the target.
  useEffect(() => {
    if (target === null) return;
    const from = shownRef.current;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = from === 0 ? 1400 : 700;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      shownRef.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div
      className={`relative ml-2 size-36 shrink-0 transition-opacity duration-300 sm:ml-0 sm:size-44 ${shown === null ? "opacity-0" : "opacity-100"}`}
    >
      {pulse > 0 ? (
        <span
          key={pulse}
          aria-hidden="true"
          className="absolute inset-0 animate-[ping_1.1s_cubic-bezier(0,0,0.2,1)_1] rounded-full border-2 border-gold-300"
        />
      ) : null}
      <p className="relative flex size-full flex-col items-center justify-center rounded-full border-2 border-gold-400/70 bg-white/5 text-center ring-8 ring-white/5">
        <FileCheck2 className="mb-1 size-5 text-gold-300" aria-hidden="true" />
        <strong
          aria-hidden="true"
          className="font-heading text-3xl leading-none font-bold text-white tabular-nums sm:text-4xl"
        >
          {(shown ?? 0).toLocaleString("en-KE")}
        </strong>
        <span className="sr-only">{(target ?? 0).toLocaleString("en-KE")}</span>
        <span className="mt-1.5 max-w-[7.5rem] text-[11px] leading-snug text-navy-200 sm:text-xs">
          invoices &amp; quotes generated
        </span>
      </p>
    </div>
  );
}
