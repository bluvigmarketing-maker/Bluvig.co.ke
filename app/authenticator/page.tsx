"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  CheckCircle2,
  Fingerprint,
  Lock,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";

interface PendingRequest {
  id: string;
  options: number[];
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ip: string;
}

type View = "loading" | "locked" | "setup" | "unlocked";

const POLL_MS = 2000;

/** "Chrome on Windows" from a user-agent string — enough to recognise your own login. */
function describeBrowser(ua: string) {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "A browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad/.test(ua)
        ? "iOS"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "an unknown device";
  return `${browser} on ${os}`;
}

function passkeyError(error: unknown) {
  if (error instanceof Error && error.name === "NotAllowedError") {
    return "Cancelled or timed out. Try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function AuthenticatorPage() {
  const [view, setView] = useState<View>("loading");
  const [hasDevices, setHasDevices] = useState(true);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [flash, setFlash] = useState<"approved" | "denied" | null>(null);

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/authenticator/status", { cache: "no-store" });
    const status = await readJson(res);
    if (!res.ok) throw new Error(status.error);
    setHasDevices(status.hasDevices);
    setDeviceName(status.deviceName);
    setView(
      status.unlocked ? "unlocked" : status.hasDevices ? "locked" : "setup"
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshStatus().catch((e) =>
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Could not reach the server."
      )
    );
  }, [refreshStatus]);

  // While unlocked, watch for sign-in requests from the cockpit.
  useEffect(() => {
    if (view !== "unlocked") return;
    let cancelled = false;
    const load = async () => {
      const res = await fetch("/api/authenticator/requests", {
        cache: "no-store",
      });
      if (cancelled) return;
      if (res.status === 401) {
        setRequests([]);
        setView("locked");
        return;
      }
      const body = await readJson(res);
      setRequests(body.requests ?? []);
    };
    load().catch(() => {});
    const timer = setInterval(() => load().catch(() => {}), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [view]);

  async function unlock() {
    setError(null);
    setBusy(true);
    try {
      const optionsRes = await fetch("/api/authenticator/unlock/options", {
        method: "POST",
      });
      const {
        ceremonyId,
        options,
        error: optionsError,
      } = await readJson(optionsRes);
      if (!optionsRes.ok) throw new Error(optionsError);
      const response = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/authenticator/unlock/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceremonyId, response }),
      });
      const body = await readJson(verifyRes);
      if (!verifyRes.ok) throw new Error(body.error);
      setDeviceName(body.deviceName);
      setView("unlocked");
    } catch (e) {
      setError(passkeyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function enrol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const optionsRes = await fetch("/api/authenticator/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          password: form.get("password"),
          code: form.get("code"),
        }),
      });
      const {
        ceremonyId,
        options,
        error: optionsError,
      } = await readJson(optionsRes);
      if (!optionsRes.ok) throw new Error(optionsError);
      const response = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch("/api/authenticator/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceremonyId, response }),
      });
      const body = await readJson(verifyRes);
      if (!verifyRes.ok) throw new Error(body.error);
      await refreshStatus();
    } catch (e) {
      setError(passkeyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function answer(requestId: string, choice: number | "deny") {
    setBusy(true);
    try {
      const res = await fetch("/api/authenticator/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, choice }),
      });
      if (res.status === 401) return setView("locked");
      const { result } = await readJson(res);
      setRequests((current) => current.filter((r) => r.id !== requestId));
      setFlash(result === "approved" ? "approved" : "denied");
      setTimeout(() => setFlash(null), 2500);
    } finally {
      setBusy(false);
    }
  }

  async function lock() {
    await fetch("/api/authenticator/lock", { method: "POST" });
    setRequests([]);
    setView("locked");
  }

  const request = requests[0];

  return (
    <div className="flex min-h-svh flex-col bg-navy-950 text-white">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Bluvig Authenticator</p>
            {view === "unlocked" && deviceName ? (
              <p className="text-xs text-navy-300">{deviceName}</p>
            ) : null}
          </div>
        </div>
        {view === "unlocked" ? (
          <button
            type="button"
            onClick={lock}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-navy-200 hover:bg-white/10"
          >
            <Lock className="size-3.5" aria-hidden="true" /> Lock
          </button>
        ) : null}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-10">
        {error ? (
          <p
            role="alert"
            className="w-full max-w-sm rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        ) : null}

        {view === "loading" ? (
          <p className="text-sm text-navy-300">Loading…</p>
        ) : null}

        {view === "locked" ? (
          <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
            <Fingerprint className="size-16 text-gold-300" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold">Locked</h1>
              <p className="text-sm text-navy-300">
                Unlock with your passkey to approve cockpit sign-ins.
              </p>
            </div>
            <button
              type="button"
              onClick={unlock}
              disabled={busy}
              className="w-full rounded-2xl bg-gold-600 py-4 text-base font-semibold text-white transition-colors hover:bg-gold-700 disabled:opacity-60"
            >
              {busy ? "Waiting for passkey…" : "Unlock"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setView("setup");
              }}
              className="text-sm text-navy-300 underline-offset-4 hover:underline"
            >
              Set up this phone
            </button>
          </div>
        ) : null}

        {view === "setup" ? (
          <form
            onSubmit={enrol}
            className="flex w-full max-w-sm flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <Smartphone
                className="size-12 text-gold-300"
                aria-hidden="true"
              />
              <h1 className="text-xl font-semibold">Set up this phone</h1>
              <p className="text-sm text-navy-300">
                {hasDevices
                  ? "Enter the one-time code from Cockpit → Authenticator devices."
                  : "First device: enter the setup password (ADMIN_PASSWORD)."}{" "}
                You&rsquo;ll then create a passkey with Face ID, fingerprint or
                your screen lock.
              </p>
            </div>
            <label className="flex flex-col gap-1.5 text-sm">
              Device name
              <input
                name="name"
                required
                maxLength={40}
                placeholder="e.g. My iPhone"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
              />
            </label>
            {hasDevices ? (
              <label className="flex flex-col gap-1.5 text-sm">
                Enrolment code
                <input
                  name="code"
                  required
                  autoComplete="one-time-code"
                  placeholder="XXXX-XXXX"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-base tracking-widest text-white uppercase placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
                />
              </label>
            ) : (
              <label className="flex flex-col gap-1.5 text-sm">
                Setup password
                <input
                  name="password"
                  type="password"
                  required
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-gold-400 focus:outline-none"
                />
              </label>
            )}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-2xl bg-gold-600 py-4 text-base font-semibold text-white transition-colors hover:bg-gold-700 disabled:opacity-60"
            >
              {busy ? "Creating passkey…" : "Create passkey"}
            </button>
            {hasDevices ? (
              <button
                type="button"
                onClick={() => setView("locked")}
                className="text-sm text-navy-300 underline-offset-4 hover:underline"
              >
                Back
              </button>
            ) : null}
          </form>
        ) : null}

        {view === "unlocked" ? (
          <div
            aria-live="polite"
            className="flex w-full max-w-sm flex-col items-center gap-6"
          >
            {flash ? (
              <p
                className={cn(
                  "flex items-center gap-2 text-lg font-semibold",
                  flash === "approved" ? "text-gold-300" : "text-red-300"
                )}
              >
                {flash === "approved" ? (
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                ) : (
                  <XCircle className="size-6" aria-hidden="true" />
                )}
                {flash === "approved" ? "Sign-in approved" : "Sign-in denied"}
              </p>
            ) : null}

            {request ? (
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-semibold">
                    Approve cockpit sign-in?
                  </h1>
                  <p className="text-sm text-navy-300">
                    {describeBrowser(request.userAgent)} ·{" "}
                    {new Date(request.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {request.ip !== "unknown" ? ` · ${request.ip}` : ""}
                  </p>
                </div>
                <p className="text-sm text-navy-200">
                  Tap the number shown on the cockpit screen.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {request.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={busy}
                      onClick={() => answer(request.id, option)}
                      className="rounded-2xl border border-white/15 bg-white/10 py-6 text-3xl font-bold tabular-nums transition-colors hover:bg-gold-500 focus-visible:bg-gold-500 disabled:opacity-60"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => answer(request.id, "deny")}
                  className="text-sm text-red-300 underline-offset-4 hover:underline"
                >
                  That wasn&rsquo;t me — deny
                </button>
              </div>
            ) : !flash ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-400 opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-3 rounded-full bg-gold-400" />
                </span>
                <p className="text-base font-medium">
                  Waiting for sign-in requests
                </p>
                <p className="text-sm text-navy-300">
                  Open the cockpit on your computer — the request will appear
                  here.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
