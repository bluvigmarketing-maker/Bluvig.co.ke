import { NextResponse } from "next/server";

import { isCockpitAuthed } from "@/lib/admin-auth";
import { updateEstimateStatus } from "@/lib/estimator/store";
import { updateLead } from "@/lib/leads";
import { isPipelineStatus, type PipelineStatus } from "@/lib/pipeline";
import { withStorageErrors } from "@/lib/storage-errors";

/** Move a lead or estimate along the pipeline, or save its note. */
export const POST = withStorageErrors(async (request: Request) => {
  if (!(await isCockpitAuthed())) {
    return NextResponse.json(
      { error: "Your session has ended. Sign in again." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const id = String(body?.id ?? "").slice(0, 80);
  const change: { status?: PipelineStatus; note?: string } = {};
  if (body?.status !== undefined) {
    if (!isPipelineStatus(body.status))
      return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    change.status = body.status;
  }
  if (typeof body?.note === "string") change.note = body.note.trim().slice(0, 1000);
  if (!id || (!change.status && change.note === undefined)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const found =
    body?.kind === "lead"
      ? await updateLead(id, change)
      : body?.kind === "estimate"
        ? Boolean(await updateEstimateStatus(id, change))
        : false;
  if (!found)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
});
