"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { readJson } from "@/lib/read-json";

/** Set, change or turn off the 8-digit cockpit PIN. */
export function PinSettings({
  hasPin,
  updatedAt,
}: {
  hasPin: boolean;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  async function request(method: "PUT" | "DELETE", pin?: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cockpit/pin", {
        method,
        headers: { "Content-Type": "application/json" },
        body: pin ? JSON.stringify({ pin }) : undefined,
      });
      if (!res.ok) throw new Error((await readJson(res)).error ?? "Could not save.");
      setEditing(false);
      setMessage({
        ok: true,
        text: method === "PUT" ? "PIN saved." : "PIN sign-in turned off.",
      });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const pin = String(form.get("pin") ?? "");
    if (pin !== String(form.get("confirm") ?? "")) {
      setMessage({ ok: false, text: "The two PINs don't match." });
      return;
    }
    request("PUT", pin);
  }

  const pinInput = (name: string, label: string) => (
    <label className="flex flex-col gap-1.5 text-sm text-navy-800">
      {label}
      <input
        name={name}
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        pattern="[0-9]{8}"
        minLength={8}
        maxLength={8}
        required
        title="8 digits"
        className="w-44 rounded-lg border border-navy-200 px-3 py-2 font-mono text-lg tracking-[0.3em] focus:border-gold-400 focus:outline-none"
      />
    </label>
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-navy-950">
            Sign-in PIN
          </h2>
          <p className="text-sm text-navy-600">
            An 8-digit PIN that signs you in from any computer, as an
            alternative to your passkey. 5 wrong tries pause PIN sign-in for 15
            minutes.
          </p>
        </div>
        {!editing ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setMessage(null);
                setEditing(true);
              }}
            >
              <KeyRound className="size-3.5" aria-hidden="true" />
              {hasPin ? "Change PIN" : "Set a PIN"}
            </Button>
            {hasPin ? (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                disabled={busy}
                onClick={() => {
                  if (confirm("Turn off PIN sign-in? You'll need your passkey to get in."))
                    request("DELETE");
                }}
              >
                Turn off
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5">
        {editing ? (
          <form onSubmit={save} className="flex flex-wrap items-end gap-4">
            {pinInput("pin", "New PIN")}
            {pinInput("confirm", "Repeat PIN")}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? "Saving…" : "Save PIN"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-navy-700">
            {hasPin
              ? `PIN sign-in is on${
                  updatedAt
                    ? ` · set ${new Date(updatedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`
                    : ""
                }.`
              : "No PIN set — only your passkey can sign in."}
          </p>
        )}
        {message ? (
          <p
            className={`mt-3 text-sm ${message.ok ? "text-emerald-700" : "text-destructive"}`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </section>
  );
}
