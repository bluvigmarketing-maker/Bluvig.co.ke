/**
 * Project tracking — pure logic shared by the cockpit checklist and the
 * client's tracker. A project starts when the deposit arrives: the checklist
 * is generated from what the client ordered, and progress is weighted by
 * effort (days), so a 10-day shop counts more than a 1-day FAQ.
 */
import { MODULE_BY_ID } from "./catalog";
import type { Quote, Selection } from "./pricing";

export type PhaseId =
  | "kickoff"
  | "design"
  | "build"
  | "content"
  | "testing"
  | "launch";

/** What the client sees — internal task detail stays in the cockpit. */
export const PHASES: { id: PhaseId; name: string; description: string }[] = [
  {
    id: "kickoff",
    name: "Kick-off",
    description: "Brief, brand assets, domain and hosting.",
  },
  {
    id: "design",
    name: "Design",
    description: "Your homepage and page layouts.",
  },
  { id: "build", name: "Build", description: "Pages and features." },
  {
    id: "content",
    name: "Content & SEO",
    description: "Your text, photos and Google setup.",
  },
  {
    id: "testing",
    name: "Testing",
    description: "Mobile, speed and your review.",
  },
  { id: "launch", name: "Launch", description: "Live on your domain." },
];

export interface ProjectTask {
  id: string;
  label: string;
  phase: PhaseId;
  /** Effort in days — drives the progress percentage. */
  weight: number;
  done: boolean;
  doneAt?: string;
}

/** Something we're waiting on from the client. Pauses the delivery clock. */
export interface ClientWait {
  id: string;
  label: string;
  since: string;
  until?: string;
}

export interface Project {
  startedAt: string;
  /** Guaranteed go-live before any client waits: start + the quote's max weeks. */
  baseDueAt: string;
  tasks: ProjectTask[];
  waits: ClientWait[];
  /** Set when every task is ticked. */
  launchedAt?: string;
}

/** Suggestions for the cockpit's "Waiting on client" field. */
export const WAIT_SUGGESTIONS = [
  "Logo & brand colours",
  "Website text",
  "Photos",
  "Design approval",
  "Domain access",
  "Product list & prices",
  "Feedback on review",
];

const DAY = 86_400_000;

const task = (
  id: string,
  label: string,
  phase: PhaseId,
  weight = 1
): ProjectTask => ({ id, label, phase, weight, done: false });

/** The checklist for an order: standard build steps plus one task per add-on. */
export function buildChecklist(selection: Selection): ProjectTask[] {
  const modules = Object.entries(selection)
    .map(([id, quantity]) => ({ mod: MODULE_BY_ID.get(id), quantity }))
    .filter(({ mod }) => mod);

  return [
    task("deposit", "Deposit received", "kickoff", 0.5),
    task("kickoff-call", "Kick-off call & brief", "kickoff"),
    task("assets", "Collect logo, brand colours & content", "kickoff"),
    task("domain", "Domain & hosting set up", "kickoff", 0.5),

    task("design-home", "Homepage design", "design", 2),
    task("design-pages", "Inner page layouts", "design", 1),
    task("design-approval", "Client design approval", "design", 0.5),

    task("build-core", "Build Home, About, Services & Contact", "build", 3),
    task("build-admin", "Admin dashboard & enquiries", "build", 1),
    task("build-widgets", "Google Map & WhatsApp button", "build", 0.5),
    ...modules
      .filter(({ mod }) => !mod!.monthly)
      .map(({ mod, quantity }) =>
        task(
          `mod-${mod!.id}`,
          quantity > 1 ? `${mod!.name} × ${quantity}` : mod!.name,
          "build",
          mod!.days * quantity
        )
      ),

    task("content-load", "Load client text & images", "content", 1),
    task("seo", "SEO & GEO: meta, schema, sitemap", "content", 1),

    task("test-mobile", "Mobile & browser testing", "testing", 1),
    task("test-speed", "Speed check: loads in 1 second", "testing", 0.5),
    task("client-review", "Client review & revisions", "testing", 1),

    task("go-live", "Go live on the domain", "launch", 0.5),
    task("search-console", "Submit to Google Search Console", "launch", 0.5),
    task("handover", "Handover & admin training", "launch", 0.5),
    ...modules
      .filter(({ mod }) => mod!.monthly)
      .map(({ mod }) =>
        task(`mod-${mod!.id}`, `Start ${mod!.name}`, "launch", 0.5)
      ),
    task("balance", "Balance received", "launch", 0.5),
  ];
}

export function newProject(selection: Selection, quote: Quote, now = new Date()) {
  const tasks = buildChecklist(selection);
  tasks[0].done = true;
  tasks[0].doneAt = now.toISOString();
  return {
    startedAt: now.toISOString(),
    baseDueAt: new Date(now.getTime() + quote.weeks.max * 7 * DAY).toISOString(),
    tasks,
    waits: [],
  } satisfies Project;
}

export type PhaseStatus = "done" | "active" | "upcoming";

export interface Progress {
  percent: number;
  /** Go-live date, pushed back by time spent waiting on the client. */
  dueAt: Date;
  daysLeft: number;
  pausedDays: number;
  late: boolean;
  launched: boolean;
  openWaits: ClientWait[];
  phases: {
    id: PhaseId;
    name: string;
    description: string;
    status: PhaseStatus;
    done: number;
    total: number;
  }[];
}

export function projectProgress(project: Project, now = new Date()): Progress {
  const total = project.tasks.reduce((sum, t) => sum + t.weight, 0);
  const done = project.tasks
    .filter((t) => t.done)
    .reduce((sum, t) => sum + t.weight, 0);
  const allDone = project.tasks.every((t) => t.done);
  // 100% only when everything is ticked, never by rounding.
  const percent = allDone
    ? 100
    : Math.min(99, Math.round((done / Math.max(total, 1)) * 100));

  const pausedMs = project.waits.reduce((sum, w) => {
    const end = w.until ? new Date(w.until).getTime() : now.getTime();
    return sum + Math.max(0, end - new Date(w.since).getTime());
  }, 0);
  const dueAt = new Date(new Date(project.baseDueAt).getTime() + pausedMs);
  const launched = Boolean(project.launchedAt);
  const daysLeft = launched
    ? 0
    : Math.max(0, Math.ceil((dueAt.getTime() - now.getTime()) / DAY));

  let activeFound = false;
  const phases = PHASES.map((phase) => {
    const tasks = project.tasks.filter((t) => t.phase === phase.id);
    const doneCount = tasks.filter((t) => t.done).length;
    let status: PhaseStatus = "upcoming";
    if (doneCount === tasks.length) status = "done";
    else if (!activeFound) {
      status = "active";
      activeFound = true;
    }
    return { ...phase, status, done: doneCount, total: tasks.length };
  });

  return {
    percent,
    dueAt,
    daysLeft,
    pausedDays: Math.round(pausedMs / DAY),
    late: !launched && now.getTime() > dueAt.getTime(),
    launched,
    openWaits: project.waits.filter((w) => !w.until),
    phases,
  };
}

/** e.g. "Mon 9 Nov 2026", in Nairobi time. */
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}
