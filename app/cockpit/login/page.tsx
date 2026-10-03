"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, ShieldCheck, Smartphone, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type State =
  | { kind: "starting" }
  | { kind: "waiting"; number: number; expiresAt: number }
  | { kind: "approved" }
  | { kind: "denied" }
  | { kind: "expired" }
  | { kind: "no-devices" }
  | { kind: "error"; message: string };

const POLL_MS = 2000;

export default function CockpitLoginPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "starting" });
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback(async () => {
    setState({ kind: "starting" });
    try {
      const res = await fetch("/api/cockpit/login-request", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) return setState({ kind: "no-devices" });
      if (!res.ok) {
        return setState({ kind: "error", message: body.message ?? "Something went wrong." });
      }
      setState({
        kind: "waiting",
        number: body.number,
        expiresAt: new Date(body.expiresAt).getTime(),
      });
    } catch {
      setState({ kind: "error", message: "Could not reach the server." });
    }
  }, []);

  // Kick off the first sign-in request once. The ref guards against effects
  // running twice (React dev mode), which would leave an orphan request on the phone.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  // Poll for the phone's answer and tick the countdown while waiting.
  useEffect(() => {
    if (state.kind !== "waiting") return;
    const { expiresAt } = state;

    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) setState({ kind: "expired" });
    };
    tick();
    const countdown = setInterval(tick, 1000);

    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/cockpit/login-request", { cache: "no-store" });
        const { status } = await res.json();
        if (status === "approved") {
          setState({ kind: "approved" });
          router.replace("/cockpit");
          router.refresh();
        } else if (status === "denied") {
          setState({ kind: "denied" });
        } else if (status === "expired" || status === "unknown") {
          setState({ kind: "expired" });
        }
      } catch {
        // Transient network error — keep polling until the request expires.
      }
    }, POLL_MS);

    return () => {
      clearInterval(countdown);
      clearInterval(poll);
    };
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <span className="flex size-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold text-navy-950">Cockpit Sign-in</h1>
          <p className="text-sm text-navy-700">Approve with Bluvig Authenticator.</p>
        </div>

        <div aria-live="polite" className="flex w-full flex-col items-center gap-5">
          {state.kind === "starting" ? (
            <p className="py-10 text-sm text-navy-500">Preparing sign-in…</p>
          ) : null}

          {state.kind === "waiting" ? (
            <>
              <p className="text-sm text-navy-700">
                Open <span className="font-semibold text-navy-950">Bluvig Authenticator</span> on
                your phone and tap this number:
              </p>
              <p
                className="font-heading text-7xl font-bold tracking-tight text-navy-950"
                aria-label={`Your number is ${state.number}`}
              >
                {state.number}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-navy-500">
                <Clock className="size-3.5" aria-hidden="true" />
                Waiting for approval · {Math.floor(secondsLeft / 60)}:
                {String(secondsLeft % 60).padStart(2, "0")}
              </p>
            </>
          ) : null}

          {state.kind === "approved" ? (
            <p className="flex items-center gap-2 py-8 font-semibold text-gold-700">
              <CheckCircle2 className="size-5" aria-hidden="true" /> Approved — opening cockpit…
            </p>
          ) : null}

          {state.kind === "denied" || state.kind === "expired" || state.kind === "error" ? (
            <>
              <p className="flex items-center gap-2 py-4 text-sm text-destructive">
                <XCircle className="size-4 shrink-0" aria-hidden="true" />
                {state.kind === "denied"
                  ? "Sign-in was denied on the authenticator."
                  : state.kind === "expired"
                    ? "This sign-in request expired."
                    : state.message}
              </p>
              <Button onClick={start} className="btn-metallic gold-line w-full font-semibold">
                Try again
              </Button>
            </>
          ) : null}

          {state.kind === "no-devices" ? (
            <div className="flex flex-col items-center gap-3 py-2 text-sm text-navy-700">
              <Smartphone className="size-6 text-navy-500" aria-hidden="true" />
              <p>
                No authenticator is set up yet. On your phone, open{" "}
                <span className="font-mono font-semibold text-navy-950">/authenticator</span> and
                choose <span className="font-semibold">Set up this phone</span>.
              </p>
              <Button onClick={start} variant="outline" className="w-full">
                I&rsquo;ve set it up — continue
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
