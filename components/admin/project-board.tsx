"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Hourglass,
  PlayCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import {
  formatDate,
  PHASES,
  projectProgress,
  WAIT_SUGGESTIONS,
  type Project,
} from "@/lib/estimator/project";

const PASSWORD_KEY = "bluvig-cockpit-password";

/** The admin password, remembered for this browser tab while sign-in is off. */
function usePassword(needsPassword: boolean) {
  const [password, setPasswordState] = useState("");
  useEffect(() => {
    if (!needsPassword) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPasswordState(sessionStorage.getItem(PASSWORD_KEY) ?? "");
    } catch {
      // Storage blocked — type the password instead.
    }
  }, [needsPassword]);
  const setPassword = (value: string) => {
    setPasswordState(value);
    try {
      sessionStorage.setItem(PASSWORD_KEY, value);
    } catch {
      // Storage blocked — the password just isn't remembered.
    }
  };
  return [password, setPassword] as const;
}

async function send(body: Record<string, unknown>) {
  const res = await fetch("/api/cockpit/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.error ?? "Could not save.");
  return json.project as Project;
}

function PasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="password"
      placeholder="Admin password"
      aria-label="Admin password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-950 focus:border-gold-400 focus:outline-none"
    />
  );
}

/** "Deposit received — start project" on the estimates table. */
export function StartProjectButton({
  token,
  needsPassword,
}: {
  token: string;
  needsPassword: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = usePassword(needsPassword);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!confirm("Deposit received? This starts the project and the client's tracker."))
      return;
    setBusy(true);
    setError(null);
    try {
      await send({ token, action: "start", password });
      router.push("/cockpit/projects");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {needsPassword && !password ? (
        <PasswordField value={password} onChange={setPassword} />
      ) : null}
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        <PlayCircle className="size-3.5" aria-hidden="true" />
        {busy ? "Starting…" : "Deposit received — start"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

/** One project's checklist, progress and client waits. */
export function ProjectBoard({
  token,
  reference,
  clientName,
  industryName,
  initial,
  needsPassword,
}: {
  token: string;
  reference: string;
  clientName: string;
  industryName: string;
  initial: Project;
  needsPassword: boolean;
}) {
  const [project, setProject] = useState(initial);
  const [password, setPassword] = usePassword(needsPassword);
  const [waitLabel, setWaitLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const progress = projectProgress(project);

  async function act(body: Record<string, unknown>) {
    setError(null);
    try {
      setProject(await send({ ...body, token, password }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }

  function addWait(event: FormEvent) {
    event.preventDefault();
    if (!waitLabel.trim()) return;
    void act({ action: "wait", label: waitLabel });
    setWaitLabel("");
  }

  return (
    <article
      id={reference}
      className="flex flex-col gap-5 rounded-2xl border border-navy-100 bg-white p-5"
    >
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-navy-500">{reference}</p>
          <h2 className="font-heading text-lg font-semibold text-navy-950">
            {clientName} · {industryName}
          </h2>
          <p className="text-sm text-navy-600">
            Started {formatDate(project.startedAt)} ·{" "}
            {progress.launched
              ? `Launched ${formatDate(project.launchedAt!)}`
              : `Due ${formatDate(progress.dueAt)} · ${progress.daysLeft} days left`}
            {progress.pausedDays
              ? ` · +${progress.pausedDays} days waiting on client`
              : ""}
          </p>
          {progress.late ? (
            <p className="mt-1 text-sm font-semibold text-red-700">
              Past the guaranteed date — 10% discount applies.
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-heading text-3xl font-semibold text-navy-950">
            {progress.percent}%
          </span>
          <a
            href={`/quotation/order/${token}`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-navy-600 hover:text-navy-950"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Client tracker
          </a>
        </div>
      </header>

      <div className="h-2 overflow-hidden rounded-full bg-navy-100">
        <div
          className="h-full rounded-full bg-gold-500 transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {needsPassword ? (
        <label className="flex items-center gap-2 text-xs text-navy-600">
          Saves need the admin password:
          <PasswordField value={password} onChange={setPassword} />
        </label>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((phase) => (
          <section key={phase.id} className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
              {phase.name}
            </h3>
            {project.tasks
              .filter((t) => t.phase === phase.id)
              .map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-start gap-2 text-sm text-navy-900"
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) =>
                      act({ action: "task", taskId: t.id, done: e.target.checked })
                    }
                    className="mt-0.5 size-4 accent-[var(--gold-600)]"
                  />
                  <span className={cn(t.done && "text-navy-400 line-through")}>
                    {t.label}
                  </span>
                </label>
              ))}
          </section>
        ))}
      </div>

      <section className="flex flex-col gap-2 rounded-xl bg-navy-50 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-950">
          <Hourglass className="size-4 text-gold-600" aria-hidden="true" />
          Waiting on client
          <span className="font-normal text-navy-500">
            — pauses the delivery clock and shows on their tracker
          </span>
        </h3>
        {project.waits.length ? (
          <ul className="flex flex-col gap-1.5 text-sm">
            {project.waits.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-2">
                {w.until ? (
                  <CheckCircle2
                    className="size-4 text-gold-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle className="size-4 text-red-600" aria-hidden="true" />
                )}
                <span className={cn(w.until && "text-navy-500")}>
                  {w.label}
                </span>
                <span className="text-xs text-navy-500">
                  since {formatDate(w.since)}
                  {w.until ? ` · received ${formatDate(w.until)}` : ""}
                </span>
                {!w.until ? (
                  <button
                    type="button"
                    onClick={() => act({ action: "resolve", waitId: w.id })}
                    className="rounded-md border border-navy-200 bg-white px-2 py-0.5 text-xs font-semibold text-navy-800 hover:bg-navy-100"
                  >
                    Received
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <form onSubmit={addWait} className="flex flex-wrap gap-2">
          <input
            list={`waits-${token}`}
            value={waitLabel}
            onChange={(e) => setWaitLabel(e.target.value)}
            placeholder="e.g. Logo & brand colours"
            maxLength={120}
            className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-950 focus:border-gold-400 focus:outline-none"
          />
          <datalist id={`waits-${token}`}>
            {WAIT_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <button
            type="submit"
            className="rounded-lg bg-navy-950 px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Start waiting
          </button>
        </form>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </article>
  );
}
