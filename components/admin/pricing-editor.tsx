"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save } from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import { BASE, CATEGORIES, MODULES } from "@/lib/estimator/catalog";
import {
  convert,
  DEFAULT_SETTINGS,
  type Pricing,
} from "@/lib/estimator/pricing";

export function PricingEditor({
  initial,
  needsPassword,
}: {
  initial: Pricing;
  needsPassword: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const changed = useMemo(() => {
    const ids = new Set<string>();
    for (const key of Object.keys(
      draft.settings
    ) as (keyof Pricing["settings"])[]) {
      if (draft.settings[key] !== saved.settings[key])
        ids.add(`settings.${key}`);
    }
    for (const m of MODULES) {
      const a = draft.modules[m.id];
      const b = saved.modules[m.id];
      if (a.priceKes !== b.priceKes || a.enabled !== b.enabled) ids.add(m.id);
    }
    return ids;
  }, [draft, saved]);

  const usd = (kes: number) =>
    convert(kes, "USD", draft.settings).toLocaleString("en-US");

  function setSetting(key: keyof Pricing["settings"], value: number) {
    setDraft((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  }

  function setModule(id: string, patch: Partial<Pricing["modules"][string]>) {
    setDraft((d) => ({
      ...d,
      modules: { ...d.modules, [id]: { ...d.modules[id], ...patch } },
    }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const res = await fetch("/api/cockpit/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing: draft,
          password: needsPassword ? password : undefined,
        }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Could not save.");
      setSaved(body.pricing);
      setDraft(body.pricing);
      setStatus({
        kind: "ok",
        text: "Prices saved — the estimator uses them now.",
      });
      router.refresh();
    } catch (e) {
      setStatus({
        kind: "error",
        text: e instanceof Error ? e.message : "Could not save.",
      });
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-right text-sm tabular-nums text-navy-950 focus:border-gold-400 focus:outline-none";

  return (
    <form onSubmit={save} className="flex flex-col gap-6 pb-28">
      <section className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label
          className={cn(
            "flex flex-col gap-1.5 text-sm font-medium text-navy-900",
            changed.has("settings.basePriceKes") && "text-gold-700"
          )}
        >
          {BASE.name} (KES)
          <input
            type="number"
            min={0}
            step={500}
            value={draft.settings.basePriceKes}
            onChange={(e) =>
              setSetting("basePriceKes", Math.round(Number(e.target.value)))
            }
            className={input}
          />
          <span className="text-xs font-normal text-navy-500">
            USD {usd(draft.settings.basePriceKes)} for international clients
          </span>
        </label>
        <label
          className={cn(
            "flex flex-col gap-1.5 text-sm font-medium text-navy-900",
            changed.has("settings.fxRate") && "text-gold-700"
          )}
        >
          Exchange rate (KES per USD)
          <input
            type="number"
            min={1}
            step={0.5}
            value={draft.settings.fxRate}
            onChange={(e) => setSetting("fxRate", Number(e.target.value))}
            className={input}
          />
        </label>
        <label
          className={cn(
            "flex flex-col gap-1.5 text-sm font-medium text-navy-900",
            changed.has("settings.intlMultiplier") && "text-gold-700"
          )}
        >
          International multiplier
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={draft.settings.intlMultiplier}
            onChange={(e) =>
              setSetting("intlMultiplier", Number(e.target.value))
            }
            className={input}
          />
          <span className="text-xs font-normal text-navy-500">
            Default {DEFAULT_SETTINGS.intlMultiplier}× · USD = KES × multiplier
            ÷ rate
          </span>
        </label>
        <label
          className={cn(
            "flex flex-col gap-1.5 text-sm font-medium text-navy-900",
            changed.has("settings.renewalKes") && "text-gold-700"
          )}
        >
          Hosting & domain renewal (KES / year)
          <input
            type="number"
            min={0}
            step={500}
            value={draft.settings.renewalKes}
            onChange={(e) =>
              setSetting("renewalKes", Math.round(Number(e.target.value)))
            }
            className={input}
          />
          <span className="text-xs font-normal text-navy-500">
            From year 2 · first year included · USD{" "}
            {usd(draft.settings.renewalKes)}
          </span>
        </label>
      </section>

      {CATEGORIES.map((category) => (
        <section
          key={category.id}
          className="overflow-hidden rounded-2xl border border-navy-100 bg-white"
        >
          <h2 className="border-b border-navy-100 bg-navy-50 px-5 py-3 font-heading font-semibold text-navy-950">
            {category.name}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-navy-500 uppercase">
                  <th className="px-5 py-2 font-semibold">Module</th>
                  <th className="w-40 px-3 py-2 text-right font-semibold">
                    KES
                  </th>
                  <th className="w-28 px-3 py-2 text-right font-semibold">
                    USD
                  </th>
                  <th className="w-24 px-3 py-2 text-center font-semibold">
                    Shown
                  </th>
                  <th className="w-12 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {MODULES.filter((m) => m.category === category.id).map((m) => {
                  const value = draft.modules[m.id];
                  const isDefault = value.priceKes === m.defaultPriceKes;
                  return (
                    <tr
                      key={m.id}
                      className={cn(
                        "border-t border-navy-50",
                        changed.has(m.id) && "bg-gold-50",
                        !value.enabled && "opacity-60"
                      )}
                    >
                      <td className="px-5 py-2 text-navy-900">
                        {m.name}
                        {m.unit ? (
                          <span className="text-navy-500"> / {m.unit}</span>
                        ) : null}
                        {m.monthly ? (
                          <span className="text-navy-500"> / month</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step={500}
                          aria-label={`${m.name} price in KES`}
                          value={value.priceKes}
                          onChange={(e) =>
                            setModule(m.id, {
                              priceKes: Math.round(Number(e.target.value)),
                            })
                          }
                          className={input}
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-navy-600 tabular-nums">
                        {usd(value.priceKes)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Show ${m.name} in the estimator`}
                          checked={value.enabled}
                          onChange={(e) =>
                            setModule(m.id, { enabled: e.target.checked })
                          }
                          className="size-4 accent-[var(--gold-600)]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {!isDefault ? (
                          <button
                            type="button"
                            title={`Reset to default (KES ${m.defaultPriceKes.toLocaleString()})`}
                            aria-label={`Reset ${m.name} to default price`}
                            onClick={() =>
                              setModule(m.id, { priceKes: m.defaultPriceKes })
                            }
                            className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-900"
                          >
                            <RotateCcw
                              className="size-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-navy-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm text-navy-700" aria-live="polite">
            {status ? (
              <span
                className={
                  status.kind === "ok" ? "text-gold-700" : "text-red-700"
                }
              >
                {status.text}
              </span>
            ) : changed.size ? (
              `${changed.size} unsaved change${changed.size > 1 ? "s" : ""}`
            ) : (
              "No unsaved changes"
            )}
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setDraft((d) => ({
                  ...d,
                  modules: Object.fromEntries(
                    MODULES.map((m) => [
                      m.id,
                      { ...d.modules[m.id], priceKes: m.defaultPriceKes },
                    ])
                  ),
                }));
                setStatus(null);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset all to defaults
            </button>
            {needsPassword ? (
              <input
                type="password"
                required
                placeholder="Admin password"
                aria-label="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-44 rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
              />
            ) : null}
            <button
              type="button"
              disabled={!changed.size || saving}
              onClick={() => {
                setDraft(saved);
                setStatus(null);
              }}
              className="rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!changed.size || saving}
              className="flex items-center gap-1.5 rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-40"
            >
              <Save className="size-4" aria-hidden="true" />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
