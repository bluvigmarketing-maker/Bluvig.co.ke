"use client";

import { useEffect, useState } from "react";
import { FileCheck2 } from "lucide-react";

/** Fired by the generator after each download or share, so the number ticks up live. */
export const INVOICE_MADE_EVENT = "bluvig:invoice-made";

/** "1,284 invoices & quotes generated" — shown in the page hero. */
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
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-navy-100 transition-opacity duration-300 ${count === null ? "opacity-0" : "opacity-100"}`}
    >
      <FileCheck2 className="size-4 text-gold-300" aria-hidden="true" />
      <span>
        <strong className="font-semibold text-white tabular-nums">
          {(count ?? 0).toLocaleString("en-KE")}
        </strong>{" "}
        invoices &amp; quotes generated
      </span>
    </p>
  );
}
