"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * The generator reads saved documents from browser storage on first render,
 * so it only renders in the browser. The placeholder holds the space.
 */
const InvoiceGenerator = dynamic(() => import("./invoice-generator"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[70vh] items-center justify-center rounded-2xl border border-navy-100 bg-white text-sm text-navy-500">
      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
      Loading the invoice generator…
    </div>
  ),
});

export function InvoiceGeneratorLoader() {
  return <InvoiceGenerator />;
}
