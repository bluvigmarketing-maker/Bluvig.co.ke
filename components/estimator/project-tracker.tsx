import { CheckCircle2, Circle, Hourglass, Loader2, Rocket } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatDate,
  projectProgress,
  type Project,
} from "@/lib/estimator/project";
import { BLUVIG_WHATSAPP } from "@/lib/estimator/whatsapp";

/** The client's view of their project: phases only, never internal tasks. */
export function ProjectTracker({
  project,
  reference,
}: {
  project: Project;
  reference: string;
}) {
  const progress = projectProgress(project);
  const waits = progress.openWaits;

  return (
    <section
      aria-label="Project progress"
      className="mt-6 flex flex-col gap-5 rounded-2xl border border-navy-100 bg-white p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gold-700">
            {progress.launched ? "Your website is live" : "Your website is being built"}
          </p>
          <p className="font-heading text-4xl font-semibold text-navy-950">
            {progress.percent}%
          </p>
        </div>
        <div className="text-right text-sm text-navy-700">
          {progress.launched ? (
            <p className="flex items-center gap-1.5 font-semibold text-navy-950">
              <Rocket className="size-4 text-gold-600" aria-hidden="true" />
              Launched {formatDate(project.launchedAt!)}
            </p>
          ) : (
            <>
              <p className="font-semibold text-navy-950">
                {progress.daysLeft} day{progress.daysLeft === 1 ? "" : "s"} left
              </p>
              <p>Live by {formatDate(progress.dueAt)}</p>
            </>
          )}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 overflow-hidden rounded-full bg-navy-100"
      >
        <div
          className="h-full rounded-full bg-gold-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {waits.length ? (
        <div className="flex flex-col gap-2 rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-navy-950">
            <Hourglass className="size-4 text-gold-600" aria-hidden="true" />
            Waiting on you
          </p>
          <ul className="flex flex-col gap-1 text-sm text-navy-800">
            {waits.map((w) => (
              <li key={w.id}>
                • {w.label}{" "}
                <span className="text-navy-500">
                  (since {formatDate(w.since)})
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-navy-600">
            Your go-live date moves forward while we wait — send these over
            to keep things on schedule.
          </p>
          <a
            href={`https://wa.me/${BLUVIG_WHATSAPP}?text=${encodeURIComponent(`Hi Bluvig, sending what you need for ${reference}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit rounded-lg bg-[#25d366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ebe5a]"
          >
            Send on WhatsApp
          </a>
        </div>
      ) : null}

      <ol className="flex flex-col gap-3">
        {progress.phases.map((phase) => (
          <li key={phase.id} className="flex gap-3">
            {phase.status === "done" ? (
              <CheckCircle2
                className="size-5 shrink-0 text-gold-600"
                aria-hidden="true"
              />
            ) : phase.status === "active" ? (
              <Loader2
                className="size-5 shrink-0 animate-spin text-navy-700 motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Circle
                className="size-5 shrink-0 text-navy-300"
                aria-hidden="true"
              />
            )}
            <span>
              <span
                className={cn(
                  "block text-sm font-semibold",
                  phase.status === "upcoming" ? "text-navy-500" : "text-navy-950"
                )}
              >
                {phase.name}
                {phase.status === "active" ? (
                  <span className="ml-2 font-normal text-navy-600">
                    In progress
                  </span>
                ) : null}
              </span>
              <span className="block text-xs text-navy-600">
                {phase.description}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-navy-500">
        Started {formatDate(project.startedAt)}. This page updates as we work —
        bookmark it to check in any time.
      </p>
    </section>
  );
}
