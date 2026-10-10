import { NextResponse } from "next/server";

import { isCockpitAuthed, verifyPassword } from "@/lib/admin-auth";
import { updateProject, type ProjectAction } from "@/lib/estimator/store";
import { withStorageErrors } from "@/lib/storage-errors";

const text = (value: unknown, max = 200) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

function parseAction(body: Record<string, unknown>): ProjectAction | null {
  switch (body.action) {
    case "start":
      return { action: "start" };
    case "task":
      return typeof body.done === "boolean" && text(body.taskId, 80)
        ? { action: "task", taskId: text(body.taskId, 80), done: body.done }
        : null;
    case "wait":
      return text(body.label, 120)
        ? { action: "wait", label: text(body.label, 120) }
        : null;
    case "resolve":
      return text(body.waitId, 40)
        ? { action: "resolve", waitId: text(body.waitId, 40) }
        : null;
    default:
      return null;
  }
}

/**
 * Start a project, tick tasks and log client waits. Needs a cockpit session —
 * or, while cockpit sign-in is switched off, the ADMIN_PASSWORD.
 */
export const POST = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const allowed =
    (await isCockpitAuthed()) ||
    (typeof body.password === "string" && verifyPassword(body.password));
  if (!allowed) {
    return NextResponse.json(
      { error: "Incorrect admin password." },
      { status: 401 }
    );
  }

  const change = parseAction(body);
  if (!change)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const estimate = await updateProject(text(body.token, 40), change);
  if (!estimate)
    return NextResponse.json(
      { error: "Project not found." },
      { status: 404 }
    );
  return NextResponse.json({ project: estimate.project });
});
