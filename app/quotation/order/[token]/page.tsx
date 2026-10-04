import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Check, Download, Lightbulb } from "lucide-react";

import { formatMoney, PAYMENT_TERMS } from "@/lib/estimator/pricing";
import { getEstimate } from "@/lib/estimator/store";
import { purchaseOrderLink } from "@/lib/estimator/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Order",
  robots: { index: false, follow: false },
};

/**
 * Read-only order summary at an unguessable URL. Shows no email or phone —
 * those stay in the PDF and the cockpit.
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const estimate = await getEstimate(token);
  if (!estimate) notFound();

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const orderUrl = `${protocol}://${host}/quotation/order/${estimate.token}`;
  const { quote } = estimate;
  const money = (n: number) => formatMoney(n, quote.currency);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-sm text-navy-500">{estimate.reference}</p>
      <h1 className="font-heading mt-1 text-3xl font-semibold text-navy-950">
        {estimate.industryName} website
      </h1>
      <p className="mt-1 text-navy-700">
        Prepared for {estimate.client.name}
        {estimate.client.company ? `, ${estimate.client.company}` : ""} ·{" "}
        {new Date(estimate.createdAt).toLocaleDateString("en-GB", {
          dateStyle: "long",
        })}
      </p>

      {estimate.prototype ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-gold-50 px-4 py-3 text-sm font-medium text-gold-800">
          <Lightbulb className="size-4" aria-hidden="true" /> Free prototype
          requested first
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <ul>
          {quote.lines
            .filter((l) => !l.monthly)
            .map((line) => (
              <li
                key={line.id}
                className="flex justify-between gap-4 border-b border-navy-50 px-5 py-3 text-sm"
              >
                <span className="flex gap-2 text-navy-900">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-gold-600"
                    aria-hidden="true"
                  />
                  {line.name}
                  {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                </span>
                <span className="whitespace-nowrap text-navy-900">
                  {money(line.total)}
                </span>
              </li>
            ))}
        </ul>
        <div className="flex flex-col gap-1 bg-navy-50 px-5 py-4 text-sm">
          <div className="flex justify-between text-base font-semibold text-navy-950">
            <span>Total</span>
            <span>{money(quote.oneOffTotal)}</span>
          </div>
          <div className="flex justify-between text-navy-700">
            <span>Deposit ({PAYMENT_TERMS.depositPercent}%)</span>
            <span>{money(quote.deposit)}</span>
          </div>
          {quote.lines
            .filter((l) => l.monthly)
            .map((line) => (
              <div key={line.id} className="flex justify-between text-navy-700">
                <span>{line.name}</span>
                <span>{money(line.total)}/month</span>
              </div>
            ))}
          <p className="mt-1 text-xs text-navy-500">
            Delivery {quote.weeks.min}–{quote.weeks.max} weeks · Hosting &
            domain included for year 1
            {quote.renewal ? ` (renews at ${money(quote.renewal)}/year)` : ""} ·
            No VAT
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={purchaseOrderLink(estimate, orderUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center rounded-xl bg-[#25d366] px-5 py-3 font-semibold text-white hover:bg-[#1ebe5a]"
        >
          Send purchase order on WhatsApp
        </a>
        <a
          href={`/api/estimates/${estimate.token}/pdf`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-3 font-semibold text-navy-900 hover:bg-navy-50"
        >
          <Download className="size-4" aria-hidden="true" /> Proforma invoice
          (PDF)
        </a>
      </div>
      <p className="mt-6 text-sm text-navy-600">
        Pay via M-Pesa Paybill <strong>{PAYMENT_TERMS.paybill}</strong>, account{" "}
        <strong>{PAYMENT_TERMS.account}</strong> — after we confirm your order.
      </p>
    </div>
  );
}
