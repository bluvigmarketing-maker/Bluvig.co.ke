import type { Attribution, FunnelEvent } from "@/lib/funnel-events";
import { readDoc, updateDoc } from "@/lib/storage";

/**
 * Daily conversion counters — no cookies, no personal data, just
 * "how many people did X on day Y". Kept for 180 days.
 */

const KEY = "funnel";
const KEEP_DAYS = 180;

type Counts = Partial<Record<FunnelEvent, number>>;
interface FunnelDoc {
  days?: Record<string, Counts>;
}

/** Today in Kenya time, e.g. "2026-10-16". */
function today() {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

/** Never throws — analytics must not break a form submission. */
export async function recordEvent(event: FunnelEvent) {
  try {
    await updateDoc<FunnelDoc, void>(KEY, {}, (doc) => {
      const days = (doc.days ??= {});
      const day = (days[today()] ??= {});
      day[event] = (day[event] ?? 0) + 1;
      const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000)
        .toISOString()
        .slice(0, 10);
      for (const d of Object.keys(days)) if (d < cutoff) delete days[d];
    });
  } catch (error) {
    console.error("[funnel]", error);
  }
}

/** Totals per event over the last `days` days. */
export async function funnelTotals(days: number): Promise<Counts> {
  const doc = await readDoc<FunnelDoc>(KEY, {});
  const cutoff = new Date(Date.now() - (days - 1) * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const totals: Counts = {};
  for (const [day, counts] of Object.entries(doc.days ?? {})) {
    if (day < cutoff) continue;
    for (const [event, n] of Object.entries(counts) as [FunnelEvent, number][])
      totals[event] = (totals[event] ?? 0) + n;
  }
  return totals;
}

const text = (value: unknown, max: number) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

/** Validates attribution sent by the browser with a lead or quotation. */
export function cleanAttribution(value: unknown): Attribution | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const source = text(v.source, 80);
  if (!source) return undefined;
  const out: Attribution = { source };
  const medium = text(v.medium, 40);
  const campaign = text(v.campaign, 80);
  const landing = text(v.landing, 120);
  if (medium) out.medium = medium;
  if (campaign) out.campaign = campaign;
  if (landing) out.landing = landing;
  return out;
}

/** "google / cpc · spring-sale" */
export function describeAttribution(a: Attribution | undefined) {
  if (!a) return "Unknown";
  return [a.medium ? `${a.source} / ${a.medium}` : a.source, a.campaign]
    .filter(Boolean)
    .join(" · ");
}
