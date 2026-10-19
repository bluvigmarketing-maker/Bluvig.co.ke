import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isCockpitAuthed, verifyPassword } from "@/lib/admin-auth";
import {
  cleanProject,
  savePortfolio,
  uniqueIds,
  type PortfolioProject,
} from "@/lib/portfolio";
import { withStorageErrors } from "@/lib/storage-errors";

/** Pages that show the portfolio, refreshed after every save. */
function refreshPortfolioPages() {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

/**
 * Save the whole portfolio (order included). Needs a cockpit session — or,
 * while cockpit sign-in is switched off, the ADMIN_PASSWORD.
 */
export const PUT = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    projects?: unknown[];
  } | null;

  const allowed =
    (await isCockpitAuthed()) ||
    (body?.password ? verifyPassword(body.password) : false);
  if (!allowed) {
    return NextResponse.json(
      { error: "Incorrect admin password." },
      { status: 401 }
    );
  }
  if (!Array.isArray(body?.projects) || body.projects.length > 200) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  const projects: PortfolioProject[] = [];
  for (const input of body.projects) {
    const cleaned = cleanProject(input);
    if ("error" in cleaned) {
      return NextResponse.json({ error: cleaned.error }, { status: 400 });
    }
    projects.push(cleaned);
  }

  const saved = await savePortfolio(uniqueIds(projects));
  refreshPortfolioPages();
  return NextResponse.json({ projects: saved });
});
