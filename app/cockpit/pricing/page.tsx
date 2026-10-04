import { redirect } from "next/navigation";

import { canViewCockpit, isCockpitAuthed } from "@/lib/admin-auth";
import { MODULE_BY_ID } from "@/lib/estimator/catalog";
import { getPriceLog, getPricing } from "@/lib/estimator/store";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { PricingEditor } from "@/components/admin/pricing-editor";

export const dynamic = "force-dynamic";

function describeField(field: string) {
  if (field.startsWith("settings.")) {
    return (
      {
        "settings.basePriceKes": "Standard Website price",
        "settings.fxRate": "Exchange rate",
        "settings.intlMultiplier": "International multiplier",
        "settings.renewalKes": "Hosting & domain renewal",
      }[field] ?? field
    );
  }
  const [id, kind] = field.split(".");
  return `${MODULE_BY_ID.get(id)?.name ?? id}${kind === "enabled" ? " (shown)" : ""}`;
}

export default async function PricingPage() {
  if (!(await canViewCockpit())) redirect("/cockpit/login");

  let data: {
    pricing: Awaited<ReturnType<typeof getPricing>>;
    log: Awaited<ReturnType<typeof getPriceLog>>;
  } | null = null;
  let error: string | null = null;
  try {
    const [pricing, log] = await Promise.all([getPricing(), getPriceLog()]);
    data = { pricing, log };
  } catch (e) {
    console.error("[cockpit/pricing]", e);
    error = describeStorageError(e);
  }
  const needsPassword = !(await isCockpitAuthed());

  const content = data ? (
    <>
      <PricingEditor initial={data.pricing} needsPassword={needsPassword} />
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-semibold text-navy-950">
          Change log
        </h2>
        {data.log.length ? (
          <ul className="divide-y divide-navy-50 rounded-2xl border border-navy-100 bg-white text-sm">
            {data.log.slice(0, 30).map((entry, i) => (
              <li
                key={i}
                className="flex flex-wrap gap-x-3 px-5 py-2.5 text-navy-800"
              >
                <span className="text-navy-500">
                  {new Date(entry.at).toLocaleString("en-KE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="font-medium">
                  {describeField(entry.field)}
                </span>
                <span>
                  {String(entry.from)} → <strong>{String(entry.to)}</strong>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy-600">
            No price changes yet — these are the default prices.
          </p>
        )}
      </section>
    </>
  ) : (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {error}
    </p>
  );

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">
              Pricing
            </h1>
            <p className="text-sm text-navy-600">
              Prices used by the{" "}
              <a href="/quotation" className="underline">
                quotation page
              </a>
              . Changes apply immediately; invoices already issued keep their
              prices.
            </p>
          </div>
          <CockpitNav />
        </div>
        {content}
      </div>
    </div>
  );
}
