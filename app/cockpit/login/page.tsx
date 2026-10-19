"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { readJson } from "@/lib/read-json";

/** Cockpit sign-in with the admin password (ADMIN_PASSWORD). */
export default function CockpitLoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/cockpit/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Could not sign in.");
      setDone(true);
      router.replace("/cockpit");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the server.");
      form.reset();
    } finally {
      setBusy(false);
    }
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

          {done ? (
            <p className="flex items-center justify-center gap-2 py-8 font-semibold text-gold-700">
              <CheckCircle2 className="size-5" aria-hidden="true" /> Signed in,
              opening cockpit…
            </p>
          ) : (
            <form onSubmit={signIn} className="flex flex-col gap-3 text-left">
              <label className="flex flex-col gap-1.5 text-sm text-navy-800">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  autoFocus
                  autoComplete="current-password"
                  className="rounded-lg border border-navy-200 px-3 py-2.5 text-base focus:border-gold-500 focus:outline-none"
                />
              </label>
              <Button
                type="submit"
                disabled={busy}
                className="btn-metallic gold-line mt-1 h-12 w-full gap-2 text-base font-semibold"
              >
                <KeyRound className="size-4" aria-hidden="true" />
                {busy ? "Checking…" : "Sign in"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
