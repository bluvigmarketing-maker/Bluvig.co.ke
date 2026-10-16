"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createPasskey,
  guessDeviceName,
  passkeyError,
  signInWithPasskey,
} from "@/lib/passkey-client";
import { readJson } from "@/lib/read-json";

type View = "loading" | "signin" | "setup" | "phone" | "done";

/**
 * Cockpit sign-in. Either way gets you in:
 * - one tap with a passkey (fingerprint, Face ID, Windows Hello — or a phone
 *   via the browser's QR prompt), or
 * - the owner's 8-digit PIN (set in the cockpit or the database).
 * First visit with neither: create a passkey with the setup password.
 * Fallback: approve from a phone running Bluvig Authenticator.
 */
export default function CockpitLoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [methods, setMethods] = useState({ passkey: true, pin: false });

  useEffect(() => {
    fetch("/api/authenticator/status", { cache: "no-store" })
      .then(readJson)
      .then((status) => {
        if (status.error) throw new Error(status.error);
        setMethods({ passkey: status.hasDevices, pin: status.hasPin });
        setView(status.hasDevices || status.hasPin ? "signin" : "setup");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not reach the server.");
        setView("signin");
      });
  }, []);

  const finish = useCallback(() => {
    setView("done");
    router.replace("/cockpit");
    router.refresh();
  }, [router]);

  async function run(action: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await action();
      finish();
    } catch (e) {
      setError(passkeyError(e));
    } finally {
      setBusy(false);
    }
  }

  function signInWithPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pin = String(new FormData(event.currentTarget).get("pin") ?? "");
    const form = event.currentTarget;
    run(async () => {
      const res = await fetch("/api/cockpit/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        form.reset();
        throw new Error((await readJson(res)).error ?? "Could not sign in.");
      }
    });
  }

  function setup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(() =>
      createPasskey({
        name: String(form.get("name") || guessDeviceName()),
        password: String(form.get("password") ?? ""),
      })
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <span className="flex size-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <h1 className="font-heading text-xl font-semibold text-navy-950">
          Cockpit Sign-in
        </h1>

        <div aria-live="polite" className="flex w-full flex-col gap-4">
          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-left text-sm text-red-800"
            >
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          {view === "loading" ? (
            <p className="py-8 text-sm text-navy-500">Loading…</p>
          ) : null}

          {view === "signin" && methods.passkey ? (
            <>
              <Button
                onClick={() => run(signInWithPasskey)}
                disabled={busy}
                className="btn-metallic gold-line h-12 w-full gap-2 text-base font-semibold"
              >
                <Fingerprint className="size-5" aria-hidden="true" />
                {busy ? "Waiting for passkey…" : "Sign in with passkey"}
              </Button>
              <p className="text-xs text-navy-500">
                Use your fingerprint, face or screen lock. On a computer without
                your passkey, choose &ldquo;Use a phone&rdquo; and scan the QR
                code.
              </p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setView("phone");
                }}
                className="text-sm text-navy-600 underline-offset-4 hover:underline"
              >
                Approve from Bluvig Authenticator instead
              </button>
            </>
          ) : null}

          {view === "signin" && methods.passkey && methods.pin ? (
            <p className="flex items-center gap-3 text-xs text-navy-400 before:h-px before:flex-1 before:bg-navy-100 after:h-px after:flex-1 after:bg-navy-100">
              or
            </p>
          ) : null}

          {view === "signin" && methods.pin ? (
            <form onSubmit={signInWithPin} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm text-navy-800">
                Your 8-digit PIN
                <input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]{8}"
                  minLength={8}
                  maxLength={8}
                  required
                  title="8 digits"
                  placeholder="••••••••"
                  className="rounded-lg border border-navy-200 px-3 py-2.5 text-center font-mono text-2xl tracking-[0.4em] focus:border-gold-500 focus:outline-none"
                />
              </label>
              <Button
                type="submit"
                disabled={busy}
                variant={methods.passkey ? "outline" : "default"}
                className={
                  methods.passkey
                    ? "h-11 w-full gap-2 font-semibold"
                    : "btn-metallic gold-line h-12 w-full gap-2 text-base font-semibold"
                }
              >
                <KeyRound className="size-4" aria-hidden="true" />
                {busy ? "Checking…" : "Sign in with PIN"}
              </Button>
              {!methods.passkey ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setView("setup");
                  }}
                  className="text-sm text-navy-600 underline-offset-4 hover:underline"
                >
                  Set up fingerprint / face sign-in
                </button>
              ) : null}
            </form>
          ) : null}

          {view === "setup" ? (
            <form onSubmit={setup} className="flex flex-col gap-3 text-left">
              <p className="text-center text-sm text-navy-700">
                First time here: enter the setup password to create a passkey
                on this device. After that, signing in is one tap.
              </p>
              <label className="flex flex-col gap-1.5 text-sm text-navy-800">
                Setup password
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="rounded-lg border border-navy-200 px-3 py-2.5 text-base focus:border-gold-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-navy-800">
                Device name <span className="text-navy-500">(optional)</span>
                <input
                  name="name"
                  maxLength={40}
                  placeholder="e.g. Office laptop"
                  className="rounded-lg border border-navy-200 px-3 py-2.5 text-base focus:border-gold-500 focus:outline-none"
                />
              </label>
              <Button
                type="submit"
                disabled={busy}
                className="btn-metallic gold-line mt-1 h-12 w-full gap-2 text-base font-semibold"
              >
                <Fingerprint className="size-5" aria-hidden="true" />
                {busy ? "Creating passkey…" : "Create passkey & sign in"}
              </Button>
              {methods.pin ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setView("signin");
                  }}
                  className="text-center text-sm text-navy-600 underline-offset-4 hover:underline"
                >
                  Back to PIN sign-in
                </button>
              ) : null}
            </form>
          ) : null}

          {view === "phone" ? (
            <PhoneApproval onApproved={finish} onBack={() => setView("signin")} />
          ) : null}

          {view === "done" ? (
            <p className="flex items-center justify-center gap-2 py-8 font-semibold text-gold-700">
              <CheckCircle2 className="size-5" aria-hidden="true" /> Signed in —
              opening cockpit…
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Fallback: number matching with Bluvig Authenticator on a phone ────────

type PhoneState =
  | { kind: "starting" }
  | { kind: "waiting"; number: number; expiresAt: number }
  | { kind: "denied" }
  | { kind: "expired" }
  | { kind: "error"; message: string };

const POLL_MS = 2000;

function PhoneApproval({
  onApproved,
  onBack,
}: {
  onApproved: () => void;
  onBack: () => void;
}) {
  const [state, setState] = useState<PhoneState>({ kind: "starting" });
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback(async () => {
    setState({ kind: "starting" });
    try {
      const res = await fetch("/api/cockpit/login-request", { method: "POST" });
      const body = await readJson(res);
      if (!res.ok) {
        return setState({
          kind: "error",
          message: body.message ?? body.error ?? "Something went wrong.",
        });
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

  // The ref guards against effects running twice (React dev mode), which
  // would leave an orphan request on the phone.
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
        const res = await fetch("/api/cockpit/login-request", {
          cache: "no-store",
        });
        const { status } = await readJson(res);
        if (status === "approved") onApproved();
        else if (status === "denied") setState({ kind: "denied" });
        else if (status === "expired" || status === "unknown")
          setState({ kind: "expired" });
      } catch {
        // Transient network error — keep polling until the request expires.
      }
    }, POLL_MS);

    return () => {
      clearInterval(countdown);
      clearInterval(poll);
    };
  }, [state, onApproved]);

  return (
    <div className="flex flex-col items-center gap-4">
      {state.kind === "starting" ? (
        <p className="py-8 text-sm text-navy-500">Preparing sign-in…</p>
      ) : null}

      {state.kind === "waiting" ? (
        <>
          <p className="text-sm text-navy-700">
            <Smartphone
              className="mr-1 inline size-4 align-text-bottom"
              aria-hidden="true"
            />
            Open{" "}
            <span className="font-semibold text-navy-950">
              Bluvig Authenticator
            </span>{" "}
            on your phone and tap this number:
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

      {state.kind === "denied" ||
      state.kind === "expired" ||
      state.kind === "error" ? (
        <>
          <p className="flex items-center gap-2 py-2 text-sm text-destructive">
            <XCircle className="size-4 shrink-0" aria-hidden="true" />
            {state.kind === "denied"
              ? "Sign-in was denied on the authenticator."
              : state.kind === "expired"
                ? "This sign-in request expired."
                : state.message}
          </p>
          <Button
            onClick={start}
            className="btn-metallic gold-line w-full font-semibold"
          >
            Try again
          </Button>
        </>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-navy-600 underline-offset-4 hover:underline"
      >
        Use a passkey instead
      </button>
    </div>
  );
}
