/**
 * Sales pipeline shared by leads (call-backs) and estimates (quotations).
 * Used by the browser (status picker) and the server (validation).
 */

export const PIPELINE = [
  { id: "new", label: "New", style: "bg-gold-100 text-gold-800" },
  { id: "contacted", label: "Contacted", style: "bg-sky-100 text-sky-800" },
  { id: "proposal", label: "Proposal sent", style: "bg-violet-100 text-violet-800" },
  { id: "won", label: "Won", style: "bg-emerald-100 text-emerald-800" },
  { id: "lost", label: "Lost", style: "bg-navy-100 text-navy-600" },
] as const;

export type PipelineStatus = (typeof PIPELINE)[number]["id"];

export function isPipelineStatus(value: unknown): value is PipelineStatus {
  return PIPELINE.some((s) => s.id === value);
}

/** Older records have no status, and estimates used "estimate" for new. */
export function pipelineStatus(value: unknown): PipelineStatus {
  return isPipelineStatus(value) ? value : "new";
}

/** Still worth chasing — not won or lost yet. */
export const isOpen = (status: PipelineStatus) =>
  status !== "won" && status !== "lost";
