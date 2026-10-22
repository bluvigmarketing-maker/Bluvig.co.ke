"use client";

import { useEffect, useState } from "react";
import { FileCheck2 } from "lucide-react";

/** Fired by the generator after each download or share, so the number ticks up live. */
export const INVOICE_MADE_EVENT = "bluvig:invoice-made";

/** Round "1,284 invoices & quotes generated" badge in the page hero. */
export function InvoiceCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tools/invoice-count")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { count?: number } | null) => {
        if (!cancelled && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {});
    const bump = () => setCount((c) => (c === null ? c : c + 1));
    window.addEventListener(INVOICE_MADE_EVENT, bump);
    return () => {
      cancelled = true;
      window.removeEventListener(INVOICE_MADE_EVENT, bump);
    };
  }, []);

  return (
    <p
      aria-live="polite"
      className={`flex size-36 shrink-0 flex-col items-center justify-center rounded-full border-2 border-gold-400/70 bg-white/5 text-center ring-8 ring-white/5 transition-opacity duration-300 ml-2 sm:ml-0 sm:size-44 ${count === null ? "opacity-0" : "opacity-100"}`}
    >
      <FileCheck2 className="mb-1 size-5 text-gold-300" aria-hidden="true" />
      <strong className="font-heading text-3xl leading-none font-bold text-white tabular-nums sm:text-4xl">
        {(count ?? 0).toLocaleString("en-KE")}
      </strong>
      <span className="mt-1.5 max-w-[7.5rem] text-[11px] leading-snug text-navy-200 sm:text-xs">
        invoices &amp; quotes generated
      </span>
    </p>
  );
}
