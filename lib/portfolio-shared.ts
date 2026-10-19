/**
 * Portfolio types and helpers that are safe in the browser (no storage):
 * the cockpit editor and the /work filter use these. Storage lives in
 * lib/portfolio.ts.
 */

/**
 * A portfolio project. The portfolio: projects Bluvig has built, managed from the cockpit's
 * Portfolio tab. Stored as one document; array order is display order.
 * Until the cockpit saves for the first time — or if the database can't be
 * reached — the site shows the seed list (lib/portfolio-seed.ts).
 *
 * Only facts we can stand behind: outcomes and quotes need the client's OK.
 */
export interface PortfolioProject {
  /** URL-safe id, also the case-study slug. */
  id: string;
  title: string;
  /** Full business name, when different from the title. */
  client?: string;
  /** Card label, e.g. "E-commerce website". */
  type: string;
  /** A /services/[slug]. */
  service: string;
  summary: string;
  year: string;
  /** Shown on the website at all. */
  visible: boolean;
  /** Shown on the home page. */
  featured: boolean;
  link?: string;
  industry?: string;
  location?: string;
  features: string[];
  stack: string[];
  /** A Bluvig product rather than client work. */
  own: boolean;
  /** Desktop and phone screenshots: a /work/... path or an uploaded image URL. */
  image?: string;
  imagePhone?: string;
  /** Filled in → the project gets its own /work/[id] case-study page. */
  story?: { challenge: string; solution: string; outcome: string };
  /** Only with the client's permission. */
  testimonial?: { quote: string; name: string; role: string };
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */

export const SERVICE_OPTIONS = [
  { slug: "websites", label: "Websites" },
  { slug: "web-applications", label: "Web apps & portals" },
  { slug: "mobile-apps", label: "Mobile apps" },
  { slug: "custom-software", label: "Custom business software" },
  { slug: "integrations", label: "Integrations & M-Pesa" },
  { slug: "launch-and-grow", label: "Launch & Grow" },
] as const;

const SERVICE_SLUGS = new Set<string>(SERVICE_OPTIONS.map((s) => s.slug));

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const list = (v: unknown, maxItems: number, max: number) =>
  Array.isArray(v)
    ? v.map((s) => text(s, max)).filter(Boolean).slice(0, maxItems)
    : [];
const optional = (v: unknown, max: number) => text(v, max) || undefined;
const url = (v: unknown) => {
  const s = text(v, 500);
  return /^https?:\/\/\S+$/i.test(s) ? s : undefined;
};
// Screenshots: our own /work/ files or images uploaded through the cockpit.
const imagePath = (v: unknown) => {
  const s = text(v, 300);
  return /^\/(work\/[\w.-]+|api\/portfolio\/image\/[\w-]+)$/.test(s)
    ? s
    : undefined;
};

/**
 * Cleans one project from the cockpit. Returns an error message instead when
 * a required field is missing.
 */
export function cleanProject(
  input: unknown
): PortfolioProject | { error: string } {
  const p = (input ?? {}) as Record<string, unknown>;
  const title = text(p.title, 120);
  if (!title) return { error: "Every project needs a name." };
  const type = text(p.type, 80);
  const summary = text(p.summary, 600);
  const year = text(p.year, 4);
  const service = text(p.service, 40);
  if (!type || !summary) return { error: `${title}: add a type and a summary.` };
  if (!/^\d{4}$/.test(year)) return { error: `${title}: the year must be 4 digits.` };
  if (!SERVICE_SLUGS.has(service)) return { error: `${title}: pick a service.` };

  const story = p.story as Record<string, unknown> | undefined;
  const challenge = text(story?.challenge, 3000);
  const solution = text(story?.solution, 3000);
  const outcome = text(story?.outcome, 3000);
  const quote = p.testimonial as Record<string, unknown> | undefined;

  return {
    // New projects arrive with a temporary "new-…" id; name them from the title.
    id:
      slugify(
        text(p.id, 60) && !text(p.id, 60).startsWith("new-")
          ? text(p.id, 60)
          : title
      ) || "project",
    title,
    client: optional(p.client, 160),
    type,
    service,
    summary,
    year,
    visible: p.visible !== false,
    featured: p.featured === true,
    link: url(p.link),
    industry: optional(p.industry, 80),
    location: optional(p.location, 120),
    features: list(p.features, 8, 200),
    stack: list(p.stack, 10, 40),
    own: p.own === true,
    image: imagePath(p.image),
    imagePhone: imagePath(p.imagePhone),
    story:
      challenge && solution && outcome
        ? { challenge, solution, outcome }
        : undefined,
    testimonial:
      text(quote?.quote, 600) && text(quote?.name, 80)
        ? {
            quote: text(quote?.quote, 600),
            name: text(quote?.name, 80),
            role: text(quote?.role, 120),
          }
        : undefined,
  };
}

/** Makes ids unique by suffixing repeats (two "Kifaru" projects → kifaru, kifaru-2). */
export function uniqueIds(projects: PortfolioProject[]) {
  const seen = new Map<string, number>();
  return projects.map((p) => {
    const n = (seen.get(p.id) ?? 0) + 1;
    seen.set(p.id, n);
    return n === 1 ? p : { ...p, id: `${p.id}-${n}` };
  });
}

/* ------------------------------------------------------------------ */
/* Bulk import: rows copied from the projects spreadsheet              */

const yes = (v: string | undefined) => (v ?? "").trim().toLowerCase() === "yes";

/**
 * Parses rows pasted from the projects spreadsheet (copy the header row too).
 * Excel copies cells as tab-separated text; quoted cells may span lines.
 * Returns raw projects for cleanProject, plus how many rows were skipped.
 */
export function parsePastedRows(pasted: string) {
  const rows = splitTsv(pasted).filter((r) => r.some((c) => c.trim()));
  if (rows.length < 2) return { projects: [], skipped: 0 };
  const header = rows[0].map((h) => h.replace(/\*/g, "").trim().toLowerCase());
  const at = (row: string[], name: string) => {
    const i = header.indexOf(name.toLowerCase());
    return i >= 0 ? (row[i] ?? "").trim() : "";
  };
  const serviceByLabel = new Map<string, string>(
    SERVICE_OPTIONS.map((s) => [s.label.toLowerCase(), s.slug])
  );

  const projects: Partial<PortfolioProject>[] = [];
  let skipped = 0;
  for (const row of rows.slice(1)) {
    const title = at(row, "Project name");
    if (!title) {
      skipped++;
      continue;
    }
    projects.push({
      title,
      client: at(row, "Client / business name"),
      type: at(row, "Project type"),
      service: serviceByLabel.get(at(row, "Service").toLowerCase()) ?? "",
      summary: at(row, "Short summary"),
      year: at(row, "Year completed"),
      visible: yes(at(row, "OK to show publicly?")),
      featured: yes(at(row, "Feature on home page?")),
      link: at(row, "Live website link"),
      industry: at(row, "Industry"),
      location: at(row, "Location"),
      features: at(row, "Key features").split(";"),
      stack: at(row, "Built with").split(","),
      own: yes(at(row, "Our own product?")),
      story: {
        challenge: at(row, "Challenge"),
        solution: at(row, "Solution"),
        outcome: at(row, "Outcome"),
      },
      testimonial: yes(at(row, "Permission to use quote?"))
        ? {
            quote: at(row, "Client quote"),
            name: at(row, "Quote by (name)"),
            role: at(row, "Quote by (role)"),
          }
        : undefined,
    });
  }
  return { projects, skipped };
}

function splitTsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell === "") {
      quoted = true;
    } else if (ch === "\t") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
