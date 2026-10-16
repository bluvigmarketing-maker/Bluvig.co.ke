import { redirect } from "next/navigation";

import { canViewCockpit } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/estimator/pricing";
import { listEstimates, type Estimate } from "@/lib/estimator/store";
import { describeAttribution, funnelTotals } from "@/lib/funnel";
import { FUNNEL_EVENTS } from "@/lib/funnel-events";
import { getLeads, type Lead } from "@/lib/leads";
import { PIPELINE, pipelineStatus } from "@/lib/pipeline";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";

export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90];
const since = (iso: string, days: number) =>
  new Date(iso).getTime() >= Date.now() - days * 86_400_000;

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-6">
      <h2 className="font-heading text-lg font-semibold text-navy-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function InsightsPage() {
  if (!(await canViewCockpit())) redirect("/cockpit/login");

  let leads: Lead[] = [];
  let estimates: Estimate[] = [];
  let funnel: Awaited<ReturnType<typeof funnelTotals>>[] = [];
  let error: string | null = null;
  try {
    [leads, estimates, ...funnel] = await Promise.all([
      getLeads(),
      listEstimates(),
      ...PERIODS.map((days) => funnelTotals(days)),
    ]);
  } catch (e) {
    console.error("[cockpit/insights]", e);
    error = describeStorageError(e);
  }

  // Lead sources over the last 30 days, leads and quotations together.
  const sources = new Map<string, number>();
  for (const item of [
    ...leads.filter((l) => since(l.submittedAt, 30)),
    ...estimates.filter((e) => since(e.createdAt, 30)),
  ]) {
    const key = item.source ? describeAttribution(item.source) : "Unknown";
    sources.set(key, (sources.get(key) ?? 0) + 1);
  }
  const topSources = [...sources.entries()].sort((a, b) => b[1] - a[1]);

  // Won quotation value, per currency.
  const won = estimates.filter((e) => pipelineStatus(e.status) === "won");
  const wonValue = (["KES", "USD"] as const)
    .map((c) => ({
      currency: c,
      total: won
        .filter((e) => e.quote.currency === c)
        .reduce((sum, e) => sum + e.quote.oneOffTotal, 0),
    }))
    .filter((v) => v.total);

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">
              Insights
            </h1>
            <p className="text-sm text-navy-600">
              Where visitors drop off, where leads come from, and how the
              pipeline is doing. Page views are in Vercel Analytics.
            </p>
          </div>
          <CockpitNav />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        <Card title="Conversion funnel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs tracking-wide text-navy-500 uppercase">
                  <th className="py-2 pr-4">Step</th>
                  {PERIODS.map((d) => (
                    <th key={d} className="py-2 pr-4 text-right">
                      Last {d} days
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FUNNEL_EVENTS.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-navy-50 last:border-0"
                  >
                    <td className="py-2 pr-4 text-navy-900">{event.label}</td>
                    {funnel.map((totals, i) => (
                      <td
                        key={PERIODS[i]}
                        className="py-2 pr-4 text-right font-semibold text-navy-950 tabular-nums"
                      >
                        {totals[event.id] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-navy-500">
            Counted without cookies or personal data. &ldquo;Started&rdquo; →
            &ldquo;Saw their price&rdquo; → &ldquo;Submitted&rdquo; shows where
            people leave the quotation page.
          </p>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card title="Lead sources (last 30 days)">
            {topSources.length ? (
              <ul className="flex flex-col gap-2 text-sm">
                {topSources.map(([source, count]) => (
                  <li key={source} className="flex justify-between gap-4">
                    <span className="text-navy-800">{source}</span>
                    <span className="font-semibold text-navy-950 tabular-nums">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-500">No leads yet.</p>
            )}
            <p className="text-xs text-navy-500">
              Add <span className="font-mono">?utm_source=…&amp;utm_campaign=…</span>{" "}
              to links in ads and posts to see them here.
            </p>
          </Card>

          <Card title="Pipeline">
            <ul className="flex flex-col gap-2 text-sm">
              {PIPELINE.map((stage) => {
                const count =
                  leads.filter((l) => pipelineStatus(l.status) === stage.id)
                    .length +
                  estimates.filter((e) => pipelineStatus(e.status) === stage.id)
                    .length;
                return (
                  <li key={stage.id} className="flex justify-between gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stage.style}`}
                    >
                      {stage.label}
                    </span>
                    <span className="font-semibold text-navy-950 tabular-nums">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
            {wonValue.length ? (
              <p className="text-sm text-navy-700">
                Won quotations:{" "}
                <strong>
                  {wonValue
                    .map((v) => formatMoney(v.total, v.currency))
                    .join(" + ")}
                </strong>
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
