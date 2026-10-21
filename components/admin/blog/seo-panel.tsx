import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AnalyzeResult, CheckCategory, CheckStatus } from "@/lib/seo/analyze";

const STATUS_ICON: Record<CheckStatus, React.ElementType> = {
  good: CheckCircle2,
  ok: CircleAlert,
  bad: XCircle,
};

const STATUS_COLOR: Record<CheckStatus, string> = {
  good: "text-emerald-600",
  ok: "text-amber-500",
  bad: "text-red-600",
};

const CATEGORY_META: Record<CheckCategory, { label: string; hint: string }> = {
  seo: { label: "SEO", hint: "Search rankings" },
  readability: { label: "Readability", hint: "Human readers" },
  aeo: { label: "AEO", hint: "Voice and featured answers" },
  geo: { label: "GEO", hint: "Cited by AI tools" },
};

const CATEGORIES: CheckCategory[] = ["seo", "readability", "aeo", "geo"];

export function scoreColor(score: number) {
  return score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-500" : "text-red-600";
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("relative size-12", scoreColor(score))}>
        <svg viewBox="0 0 44 44" className="size-12 -rotate-90" aria-hidden="true">
          <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className="stroke-navy-100" />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke="currentColor"
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {score}
        </span>
      </div>
      <span className="text-[11px] font-medium text-navy-800">{label}</span>
    </div>
  );
}

/** Score rings plus the checklist of fixes, re-run live as the post changes. */
export function SeoPanel({ result }: { result: AnalyzeResult }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <div className="flex items-center justify-around border-b border-navy-100 pb-5">
        {CATEGORIES.map((cat) => (
          <ScoreRing key={cat} score={result.scores[cat]} label={CATEGORY_META[cat].label} />
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-navy-500">
        <span>{result.wordCount} words</span>
        <span>{result.readingTimeMinutes} min read</span>
      </div>
      <div className="mt-4 flex flex-col gap-5">
        {CATEGORIES.map((cat) => {
          const checks = result.checks.filter((c) => c.category === cat);
          if (checks.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-xs font-semibold text-navy-500">
                {CATEGORY_META[cat].label} · {CATEGORY_META[cat].hint}
              </p>
              <ul className="mt-2 flex flex-col gap-2.5">
                {checks.map((c) => {
                  const Icon = STATUS_ICON[c.status];
                  return (
                    <li key={c.id} className="flex gap-2.5">
                      <Icon className={cn("mt-0.5 size-4 shrink-0", STATUS_COLOR[c.status])} aria-label={c.status} />
                      <div>
                        <p className="text-sm font-medium text-navy-950">{c.label}</p>
                        <p className="text-xs leading-relaxed text-navy-600">{c.message}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
