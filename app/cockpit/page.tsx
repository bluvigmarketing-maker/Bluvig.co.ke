import { redirect } from "next/navigation";
import { AlertTriangle, Mail, Phone, Users } from "lucide-react";

import { isCockpitAuthed } from "@/lib/admin-auth";
import { getDevices, type Device } from "@/lib/authenticator";
import { COCKPIT_AUTH_ENABLED } from "@/lib/cockpit-config";
import { getLeads, type Lead } from "@/lib/leads";
import { describeStorageError } from "@/lib/storage-errors";
import { AuthenticatorDevices } from "@/components/admin/authenticator-devices";
import { LogoutButton } from "@/components/admin/logout-button";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { MaterialsList } from "@/components/admin/materials-list";
import { hasMaterials } from "@/lib/materials";

const QUALIFICATION_STYLE = {
  hot: "bg-red-100 text-red-800",
  warm: "bg-amber-100 text-amber-900",
  cold: "bg-navy-100 text-navy-700",
} as const;

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
        {label}
      </p>
      <p className="font-heading mt-1 text-3xl font-semibold text-navy-950">
        {value}
      </p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function countSince(leads: Lead[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return leads.filter((lead) => new Date(lead.submittedAt).getTime() >= cutoff)
    .length;
}

export default async function AdminDashboardPage() {
  if (COCKPIT_AUTH_ENABLED && !(await isCockpitAuthed())) {
    redirect("/cockpit/login");
  }

  // Show the dashboard even if the database isn't reachable yet — with the reason.
  let leads: Lead[] = [];
  let devices: Device[] = [];
  let storageError: string | null = null;
  try {
    leads = await getLeads();
    if (COCKPIT_AUTH_ENABLED) devices = await getDevices();
  } catch (error) {
    console.error("[cockpit]", error);
    storageError = describeStorageError(error);
  }
  const thisWeek = countSince(leads, 7);

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">
              Leads
            </h1>
            <p className="text-sm text-navy-600">
              Call-back requests from the Get Started page, rated Hot / Warm /
              Cold.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CockpitNav />
            {COCKPIT_AUTH_ENABLED ? <LogoutButton /> : null}
          </div>
        </div>

        {!COCKPIT_AUTH_ENABLED ? (
          <p className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            Sign-in is switched off — anyone with this link can see this page.
          </p>
        ) : null}

        {storageError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {storageError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Leads" value={leads.length} />
          <StatCard label="Last 7 Days" value={thisWeek} />
          <StatCard
            label="Hot Leads"
            value={leads.filter((l) => l.qualification === "hot").length}
          />
        </div>

        {leads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-navy-200 bg-white p-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-navy-950">
              No leads yet
            </h2>
            <p className="max-w-sm text-sm text-navy-600">
              Call-back requests from the Get Started page will show up here
              automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Shared ideas &amp; notes</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-navy-50 align-top last:border-0 hover:bg-navy-50/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-950">{lead.name}</p>
                      {lead.qualification ? (
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${QUALIFICATION_STYLE[lead.qualification]}`}
                        >
                          {lead.qualification === "hot"
                            ? "Hot"
                            : lead.qualification === "warm"
                              ? "Warm"
                              : "Cold"}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      <div className="flex flex-col gap-1">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1.5 hover:text-navy-950"
                          >
                            <Phone
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            {lead.phone}
                          </a>
                        ) : null}
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1.5 hover:text-navy-950"
                          >
                            <Mail
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            {lead.email}
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      <p className="font-medium text-navy-900">
                        {lead.kind === "callback"
                          ? "Call back"
                          : lead.goal || "Enquiry"}
                      </p>
                      <p>{lead.businessType || "—"}</p>
                      {lead.timeline ? (
                        <p className="text-xs text-navy-500">
                          Launch: {lead.timeline}
                        </p>
                      ) : null}
                      {lead.bestTime ? (
                        <p className="text-xs text-navy-500">
                          Call: {lead.bestTime}
                        </p>
                      ) : null}
                      {lead.location === "international" ? (
                        <p className="text-xs text-navy-500">Outside Kenya</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      {lead.budget || "—"}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-navy-700">
                      <MaterialsList materials={lead.materials} compact />
                      {lead.message ? (
                        <p className="mt-1">{lead.message}</p>
                      ) : null}
                      {!lead.message && !hasMaterials(lead.materials)
                        ? "—"
                        : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-navy-500">
                      {formatDate(lead.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {COCKPIT_AUTH_ENABLED ? (
          <AuthenticatorDevices
            devices={devices.map(({ id, name, createdAt, lastUsedAt }) => ({
              id,
              name,
              createdAt,
              lastUsedAt,
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}
