"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { track } from "@/lib/track-client";
import { Button } from "@/components/ui/button";

const SERVICE_HREF = "/services/custom-software";

const BENEFITS = [
  "Invoices created straight from orders and jobs",
  "M-Pesa payments matched to invoices automatically",
  "Stock, sales and debtors on one dashboard",
  "KRA eTIMS, accounting and SMS reminders connected",
];

const MOCK_ROWS = [
  {
    client: "Savannah Coffee",
    amount: "KES 208,800",
    status: "Paid · M-Pesa",
    tone: "paid",
  },
  {
    client: "Kilele Hardware",
    amount: "KES 64,350",
    status: "Sent",
    tone: "sent",
  },
  {
    client: "Tamu Bakers",
    amount: "KES 12,900",
    status: "Reminder sent",
    tone: "due",
  },
] as const;

const TONE = {
  paid: "bg-emerald-50 text-emerald-700",
  sent: "bg-navy-100 text-navy-700",
  due: "bg-amber-50 text-amber-800",
};

/** The full-width advert under the generator. */
export function SoftwareAd() {
  return (
    <aside
      aria-label="Custom business software from Bluvig"
      className="overflow-hidden rounded-3xl bg-navy-950 text-white"
    >
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:p-12">
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
            From the team that built this tool
          </p>
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Still typing invoices one by one?
          </h2>
          <p className="max-w-xl leading-relaxed text-navy-100">
            We build custom business software for Kenyan companies. Your
            invoices, payments, stock and reports in one system, shaped around
            how your business actually works.
          </p>
          <ul className="flex flex-col gap-2.5">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-sm text-navy-100"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-gold-300"
                  aria-hidden="true"
                />
                {b}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button
              nativeButton={false}
              size="lg"
              className="btn-metallic gold-line h-12 px-6 font-semibold"
              render={
                <Link
                  href={SERVICE_HREF}
                  onClick={() => track("invoice_ad_click")}
                >
                  See Custom Business Software
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <Button
              nativeButton={false}
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10"
              render={
                <Link
                  href="/get-started?need=system"
                  onClick={() => track("invoice_ad_click")}
                >
                  Describe Your Business
                </Link>
              }
            />
          </div>
          <p className="text-xs text-navy-300">
            Free discovery call. Fixed, itemised quote before any work starts.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="rounded-2xl bg-white p-4 text-navy-950 shadow-2xl sm:p-5"
        >
          <div className="flex items-center justify-between border-b border-navy-100 pb-3">
            <span className="text-sm font-semibold">Invoices this month</span>
            <span className="rounded-md bg-navy-50 px-2 py-1 text-[11px] font-medium text-navy-600">
              Auto-synced
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-4">
            {[
              ["Invoiced", "1.24M"],
              ["Collected", "986K"],
              ["Overdue", "41K"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-navy-50 p-3">
                <p className="text-[11px] text-navy-500">{label}</p>
                <p className="font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <ul className="flex flex-col divide-y divide-navy-100">
            {MOCK_ROWS.map((r) => (
              <li
                key={r.client}
                className="flex items-center gap-3 py-2.5 text-sm"
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {r.client}
                </span>
                <span className="tabular-nums text-navy-700">{r.amount}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONE[r.tone]}`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[11px] text-navy-400">
            Example of a system we can build for you
          </p>
        </div>
      </div>
    </aside>
  );
}

/** The short nudge shown right after a download. */
export function SoftwareNudge({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4 sm:flex-row sm:items-center">
      <div className="flex-1 text-sm text-navy-800">
        <p className="font-semibold text-navy-950">Your PDF is downloading.</p>
        <p>
          Making invoices every week? We can build a system that creates them
          from your orders and matches M-Pesa payments for you.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={SERVICE_HREF}
          onClick={() => track("invoice_ad_click")}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy-950 px-3 text-sm font-semibold text-white hover:bg-navy-800"
        >
          See how <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-navy-500 hover:text-navy-900"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
