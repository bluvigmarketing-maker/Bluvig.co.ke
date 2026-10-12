"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, KeyRound, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createPasskey,
  guessDeviceName,
  passkeyError,
} from "@/lib/passkey-client";
import { readJson } from "@/lib/read-json";

export interface DeviceSummary {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AuthenticatorDevices({
  devices,
}: {
  devices: DeviceSummary[];
}) {
  const router = useRouter();
  const [enrolCode, setEnrolCode] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function generateCode() {
    setError(null);
    const res = await fetch("/api/cockpit/enroll-code", { method: "POST" });
    if (!res.ok)
      return setError("Could not create a code. Try signing in again.");
    setEnrolCode((await readJson(res)) as { code: string; expiresAt: string });
  }

  async function addThisDevice() {
    setError(null);
    setBusyId("new");
    try {
      await createPasskey({ name: guessDeviceName() });
      router.refresh();
    } catch (e) {
      setError(passkeyError(e));
    } finally {
      setBusyId(null);
    }
  }

  async function revoke(device: DeviceSummary) {
    const last = devices.length === 1;
    const message = last
      ? `Revoke "${device.name}"? It's your only passkey — you'll need the setup password (ADMIN_PASSWORD) to create a new one before you can sign in again.`
      : `Revoke "${device.name}"? It will no longer be able to sign in.`;
    if (!window.confirm(message)) return;

    setBusyId(device.id);
    setError(null);
    const res = await fetch("/api/cockpit/devices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: device.id }),
    });
    setBusyId(null);
    if (!res.ok) return setError("Could not revoke that device.");
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-navy-950">
            Passkeys
          </h2>
          <p className="text-sm text-navy-600">
            Devices that can sign in to the cockpit with one tap. Phones can
            also approve sign-ins at{" "}
            <span className="font-mono text-navy-900">/authenticator</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={busyId === "new"}
            onClick={addThisDevice}
          >
            <Fingerprint className="size-3.5" aria-hidden="true" />
            {busyId === "new" ? "Waiting…" : "Add this device"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={generateCode}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add another phone
          </Button>
        </div>
      </div>

      {enrolCode ? (
        <div className="flex flex-col gap-1 rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <p className="text-sm text-navy-800">
            On the new phone, open{" "}
            <span className="font-mono">/authenticator</span> → Set up this
            phone, and enter:
          </p>
          <p className="font-mono text-3xl font-bold tracking-widest text-navy-950">
            {enrolCode.code}
          </p>
          <p className="text-xs text-navy-600">
            Single use · expires {formatDate(enrolCode.expiresAt)}
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ul className="divide-y divide-navy-50 rounded-2xl border border-navy-100 bg-white">
        {devices.map((device) => (
          <li key={device.id} className="flex items-center gap-4 px-5 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-navy-950">
                {device.name}
              </p>
              <p className="text-xs text-navy-500">
                Added {formatDate(device.createdAt)} · Last used{" "}
                {formatDate(device.lastUsedAt)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive"
              disabled={busyId === device.id}
              onClick={() => revoke(device)}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Revoke
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
