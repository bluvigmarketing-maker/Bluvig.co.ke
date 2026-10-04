/**
 * Lead qualification for the Get Started wizard. Shared by the browser (to
 * draw the choices) and the server (to rate the lead) — the server's rating
 * is the one that's stored.
 */

/** Budget bands in KES. International clients see them ×multiplier in USD. */
export const BUDGET_BANDS = [
  { id: "below-min", minKes: 0, maxKes: 29_999 },
  { id: "30-60", minKes: 30_000, maxKes: 60_000 },
  { id: "60-120", minKes: 60_000, maxKes: 120_000 },
  { id: "120-250", minKes: 120_000, maxKes: 250_000 },
  { id: "250-plus", minKes: 250_000, maxKes: null },
  { id: "unsure", minKes: null, maxKes: null },
] as const;

export type BudgetBandId = (typeof BUDGET_BANDS)[number]["id"];

export const TIMELINES = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-month", label: "Within a month" },
  { id: "1-3-months", label: "In 1–3 months" },
  { id: "exploring", label: "Just exploring" },
] as const;

export type TimelineId = (typeof TIMELINES)[number]["id"];

export const BEST_TIMES = [
  { id: "morning", label: "Morning (8–12)" },
  { id: "afternoon", label: "Afternoon (12–5)" },
  { id: "evening", label: "Evening (5–8)" },
] as const;

export type BestTimeId = (typeof BEST_TIMES)[number]["id"];

export type Qualification = "hot" | "warm" | "cold";

/**
 * hot  — budget at or above the minimum and ready within a month
 * warm — budget fits (or not sure yet) but later / unsure timing
 * cold — below the KES 30,000 minimum, or just exploring on a small budget
 */
export function qualify(
  band: BudgetBandId,
  timeline: TimelineId
): Qualification {
  if (band === "below-min") return "cold";
  if (timeline === "exploring") {
    return band === "unsure" || band === "30-60" ? "cold" : "warm";
  }
  if (band !== "unsure" && (timeline === "asap" || timeline === "1-month"))
    return "hot";
  return "warm";
}

export const isBudgetBand = (v: unknown): v is BudgetBandId =>
  BUDGET_BANDS.some((b) => b.id === v);
export const isTimeline = (v: unknown): v is TimelineId =>
  TIMELINES.some((t) => t.id === v);
export const isBestTime = (v: unknown): v is BestTimeId =>
  BEST_TIMES.some((t) => t.id === v);
