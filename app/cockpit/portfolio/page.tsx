import Link from "next/link";
import { redirect } from "next/navigation";

import { canViewCockpit, isCockpitAuthed } from "@/lib/admin-auth";
import { getPortfolioForEditing } from "@/lib/portfolio";
import { describeStorageError } from "@/lib/storage-errors";
import { CockpitNav } from "@/components/admin/cockpit-nav";
import { PortfolioEditor } from "@/components/admin/portfolio-editor";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  if (!(await canViewCockpit())) redirect("/cockpit/login");

  let projects: Awaited<ReturnType<typeof getPortfolioForEditing>> | null = null;
  let error: string | null = null;
  try {
    projects = await getPortfolioForEditing();
  } catch (e) {
    console.error("[cockpit/portfolio]", e);
    error = describeStorageError(e);
  }
  const needsPassword = !(await isCockpitAuthed());

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-navy-950">
              Portfolio
            </h1>
            <p className="text-sm text-navy-600">
              Projects shown on the{" "}
              <Link href="/work" className="underline">
                Our Work page
              </Link>{" "}
              and the home page. The order here is the order on the site.
            </p>
          </div>
          <CockpitNav />
        </div>
        {projects ? (
          <PortfolioEditor initial={projects} needsPassword={needsPassword} />
        ) : (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
