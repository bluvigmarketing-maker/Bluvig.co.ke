import { redirect } from "next/navigation";
import { Download, ExternalLink, Lightbulb, Mail, Phone } from "lucide-react";

import { canViewCockpit, isCockpitAuthed } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/estimator/pricing";
import { listEstimates, type Estimate } from "@/lib/estimator/store";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { MaterialsList } from "@/components/admin/materials-list";
import { StartProjectButton } from "@/components/admin/project-board";
import { projectProgress } from "@/lib/estimator/project";

export const dynamic = "force-dynamic";

export default async function EstimatesPage() {
  if (!(await canViewCockpit())) redirect("/cockpit/login");

  let estimates: Estimate[] = [];
  let error: string | null = null;
  try {
    estimates = await listEstimates();
  } catch (e) {
    console.error("[cockpit/estimates]", e);
    error = describeStorageError(e);
  }
  const needsPassword = !(await isCockpitAuthed());

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">
              Estimates
            </h1>
            <p className="text-sm text-navy-600">
              Every quotation created on the /quotation page.
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

        {!estimates.length && !error ? (
          <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-14 text-center text-sm text-navy-600">
            No estimates yet. They appear here as soon as someone completes the{" "}
            <a
              href="/quotation"
              className="font-semibold text-gold-700 underline"
            >
              estimator
            </a>
            .
          </div>
        ) : null}

        {estimates.length ? (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs tracking-wide text-navy-500 uppercase">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Documents</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((e) => (
                  <tr
                    key={e.token}
                    className="border-b border-navy-50 align-top last:border-0 hover:bg-navy-50/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-navy-950">
                        {e.reference}
                      </p>
                      <p className="text-xs text-navy-500">
                        {new Date(e.createdAt).toLocaleString("en-KE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-navy-900">
                      <p className="font-medium">{e.client.name}</p>
                      {e.client.company ? (
                        <p className="text-navy-600">{e.client.company}</p>
                      ) : null}
                      <p className="text-xs text-navy-500">
                        {e.client.country}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      {e.client.email ? (
                        <a
                          href={`mailto:${e.client.email}`}
                          className="flex items-center gap-1.5 hover:text-navy-950"
                        >
                          <Mail
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {e.client.email}
                        </a>
                      ) : null}
                      <a
                        href={`tel:${e.client.phone}`}
                        className="flex items-center gap-1.5 hover:text-navy-950"
                      >
                        <Phone
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {e.client.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      <p>{e.industryName}</p>
                      <p className="text-xs text-navy-500">
                        {e.quote.lines.length - 1} module
                        {e.quote.lines.length === 2 ? "" : "s"} ·{" "}
                        {e.quote.weeks.min}–{e.quote.weeks.max} wks
                      </p>
                      {e.prototype ? (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-gold-700">
                          <Lightbulb className="size-3.5" aria-hidden="true" />{" "}
                          Free prototype first
                        </p>
                      ) : null}
                      <div className="mt-1">
                        <MaterialsList materials={e.materials} compact />
                      </div>
                      {e.client.notes ? (
                        <p className="mt-1 max-w-xs text-xs text-navy-600">
                          “{e.client.notes}”
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-navy-950">
                      {formatMoney(e.quote.oneOffTotal, e.quote.currency)}
                      {e.quote.monthlyTotal ? (
                        <p className="text-xs font-normal text-navy-500">
                          +{" "}
                          {formatMoney(e.quote.monthlyTotal, e.quote.currency)}
                          /mo
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-navy-700">
                        <a
                          href={`/quotation/order/${e.token}`}
                          target="_blank"
                          className="flex items-center gap-1.5 hover:text-navy-950"
                        >
                          <ExternalLink
                            className="size-3.5"
                            aria-hidden="true"
                          />{" "}
                          Order page
                        </a>
                        <a
                          href={`/api/estimates/${e.token}/pdf`}
                          className="flex items-center gap-1.5 hover:text-navy-950"
                        >
                          <Download className="size-3.5" aria-hidden="true" />{" "}
                          PDF
                        </a>
                      </div>
                      {e.project ? (
                        <a
                          href={`/cockpit/projects#${e.reference}`}
                          className="mt-2 block text-xs font-semibold text-gold-700 hover:underline"
                        >
                          In progress · {projectProgress(e.project).percent}%
                        </a>
                      ) : (
                        <StartProjectButton
                          token={e.token}
                          needsPassword={needsPassword}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
