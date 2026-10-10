import { redirect } from "next/navigation";

import { canViewCockpit, isCockpitAuthed } from "@/lib/admin-auth";
import { projectProgress } from "@/lib/estimator/project";
import { listEstimates, type Estimate } from "@/lib/estimator/store";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { ProjectBoard } from "@/components/admin/project-board";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  if (!(await canViewCockpit())) redirect("/cockpit/login");

  let projects: (Estimate & { project: NonNullable<Estimate["project"]> })[] =
    [];
  let error: string | null = null;
  try {
    projects = (await listEstimates())
      .filter((e) => e.project)
      .map((e) => e as (typeof projects)[number])
      // Live projects first, soonest due date first; launched ones last.
      .sort((a, b) => {
        const pa = projectProgress(a.project);
        const pb = projectProgress(b.project);
        if (pa.launched !== pb.launched) return pa.launched ? 1 : -1;
        return pa.dueAt.getTime() - pb.dueAt.getTime();
      });
  } catch (e) {
    console.error("[cockpit/projects]", e);
    error = describeStorageError(e);
  }
  const needsPassword = !(await isCockpitAuthed());

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">
              Projects
            </h1>
            <p className="text-sm text-navy-600">
              Checklists created automatically when a deposit is received.
              Ticking tasks updates each client&rsquo;s tracker.
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

        {!projects.length && !error ? (
          <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-14 text-center text-sm text-navy-600">
            No projects yet. On the{" "}
            <a
              href="/cockpit/estimates"
              className="font-semibold text-gold-700 underline"
            >
              Estimates
            </a>{" "}
            tab, click &ldquo;Deposit received — start&rdquo; to start one.
          </div>
        ) : null}

        {projects.map((e) => (
          <ProjectBoard
            key={e.token}
            token={e.token}
            reference={e.reference}
            clientName={e.client.company || e.client.name}
            industryName={e.industryName}
            initial={e.project}
            needsPassword={needsPassword}
          />
        ))}
      </div>
    </div>
  );
}
