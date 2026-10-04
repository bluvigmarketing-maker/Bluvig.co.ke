"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  Lightbulb,
  Minus,
  Monitor,
  Plus,
  Search,
  Smartphone,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import {
  BASE,
  CATEGORIES,
  INDUSTRIES,
  INDUSTRY_BY_ID,
  MODULE_BY_ID,
  MODULES,
  type ModuleDef,
} from "@/lib/estimator/catalog";
import {
  buildQuote,
  convert,
  dependentsOf,
  formatMoney,
  PAYMENT_TERMS,
  withDependencies,
  type Currency,
  type Pricing,
  type Selection,
} from "@/lib/estimator/pricing";
import { IndustryIcon } from "./industry-icon";
import { SitePreview } from "./site-preview";
import { MaterialsFields } from "@/components/get-started/materials-fields";
import { EMPTY_MATERIALS, type Materials } from "@/lib/materials";

type Step = "industry" | "build" | "review" | "details" | "done";

const COUNTRIES = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Nigeria",
  "Ghana",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "Netherlands",
  "France",
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "Australia",
  "Other",
];

interface Done {
  reference: string;
  orderUrl: string;
  pdfUrl: string;
  whatsappUrl: string;
}

export interface EstimatorInitial {
  industryId: string;
  selection: Selection;
  /** Set when the visitor arrives from the budget recommender. */
  inKenya?: boolean;
}

export function Estimator({
  pricing,
  initial,
}: {
  pricing: Pricing;
  /** Pre-filled from /quotation?i=…&m=…&loc=… (budget recommender). */
  initial?: EstimatorInitial;
}) {
  const [step, setStep] = useState<Step>(initial ? "build" : "industry");
  const [industryId, setIndustryId] = useState<string | null>(
    initial?.industryId ?? null
  );
  const [selection, setSelection] = useState<Selection>(
    initial?.selection ?? {}
  );
  const [inKenya, setInKenya] = useState(initial?.inKenya ?? true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [prototype, setPrototype] = useState(false);
  const [country, setCountry] = useState(
    initial?.inKenya === false ? "" : "Kenya"
  );
  const [materials, setMaterials] = useState<Materials>(EMPTY_MATERIALS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  // Guess location once from the browser's time zone (visitors can switch it).
  useEffect(() => {
    if (initial?.inKenya !== undefined) return;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone !== "Africa/Nairobi") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInKenya(false);
      setCountry("");
    }
  }, [initial?.inKenya]);

  // Each step starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const currency: Currency = inKenya ? "KES" : "USD";
  const industry = industryId ? (INDUSTRY_BY_ID.get(industryId) ?? null) : null;
  const quote = useMemo(
    () => buildQuote(selection, pricing, currency),
    [selection, pricing, currency]
  );
  const price = (kes: number) =>
    formatMoney(convert(kes, currency, pricing.settings), currency);
  const available = (m: ModuleDef) => pricing.modules[m.id]?.enabled;

  function chooseIndustry(id: string) {
    setIndustryId(id);
    setStep("build");
  }

  function toggle(module: ModuleDef) {
    setNotice(null);
    if (selection[module.id]) {
      const dependents = dependentsOf(module.id, selection);
      const next = { ...selection };
      delete next[module.id];
      for (const d of dependents) delete next[d.id];
      setSelection(next);
      setLastAdded(null);
      if (dependents.length) {
        setNotice(
          `Also removed ${dependents.map((d) => d.name).join(", ")} — they need ${module.name}.`
        );
      }
      return;
    }
    const next = withDependencies({ ...selection, [module.id]: 1 });
    const added = Object.keys(next).filter(
      (id) => !selection[id] && id !== module.id
    );
    setSelection(next);
    setLastAdded(module.id);
    if (added.length) {
      setNotice(
        `Added ${added.map((id) => MODULE_BY_ID.get(id)!.name).join(", ")} — ${module.name} needs it.`
      );
    }
  }

  function setQuantity(id: string, quantity: number) {
    setSelection((current) => ({
      ...current,
      [id]: Math.max(1, Math.min(50, quantity)),
    }));
  }

  function changeCountry(value: string) {
    setCountry(value);
    if (value) setInKenya(value === "Kenya");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: industryId,
          selection,
          prototype,
          materials,
          website: form.get("website"),
          client: {
            name: form.get("name"),
            company: form.get("company"),
            email: form.get("email"),
            phone: form.get("phone"),
            country,
            notes: form.get("notes"),
          },
        }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setDone(body as Done);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 1: industry ──────────────────────────────────────────────────
  if (step === "industry" || !industry) {
    return <IndustryStep onChoose={chooseIndustry} />;
  }

  const oneOff = quote.lines.filter((l) => !l.monthly);
  const monthly = quote.lines.filter((l) => l.monthly);
  const recommended = industry.recommended
    .map((id) => MODULE_BY_ID.get(id)!)
    .filter((m) => m && available(m));

  // ── Step 5: done ──────────────────────────────────────────────────────
  if (step === "done" && done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-16 text-center">
        <CheckCircle2 className="size-14 text-gold-600" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold text-navy-950">
            Your quotation is ready
          </h1>
          <p className="text-navy-700">
            Reference{" "}
            <span className="font-mono font-semibold text-navy-950">
              {done.reference}
            </span>
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <a
            href={done.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25d366] px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
          >
            Send purchase order on WhatsApp
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a
            href={done.pdfUrl}
            className="flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-4 font-semibold text-navy-900 transition-colors hover:bg-navy-50"
          >
            <Download className="size-4" aria-hidden="true" />
            Download proforma invoice (PDF)
          </a>
          <a
            href={done.orderUrl}
            className="text-sm text-navy-600 underline-offset-4 hover:underline"
          >
            View your order online
          </a>
        </div>
        <p className="text-sm text-navy-600">
          WhatsApp opens with your order typed out — just press{" "}
          <strong>Send</strong>. We&rsquo;ll confirm the details and{" "}
          {prototype
            ? "get started on your free prototype."
            : "share next steps for the deposit."}
        </p>
      </div>
    );
  }

  const summaryBar = (action: React.ReactNode) => (
    <div className="sticky bottom-0 z-20 border-t border-navy-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <div aria-live="polite" className="min-w-0 flex-1">
          <p className="text-xs text-navy-500">Estimated total</p>
          <p className="font-heading text-xl font-semibold text-navy-950 sm:text-2xl">
            {formatMoney(quote.oneOffTotal, currency)}
            {quote.monthlyTotal ? (
              <span className="ml-2 text-sm font-normal text-navy-600">
                + {formatMoney(quote.monthlyTotal, currency)}/mo
              </span>
            ) : null}
          </p>
          <p className="text-xs text-navy-500">
            {quote.weeks.min}–{quote.weeks.max} weeks ·{" "}
            {PAYMENT_TERMS.depositPercent}% deposit to start
          </p>
        </div>
        {action}
      </div>
    </div>
  );

  // ── Step 2: build ─────────────────────────────────────────────────────
  if (step === "build") {
    return (
      <>
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:px-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStep("industry")}
              className="flex items-center gap-2 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-800 hover:bg-navy-50"
            >
              <IndustryIcon
                name={industry.icon}
                className="size-4 text-gold-600"
              />
              {industry.name}
              <span className="text-xs text-navy-500">Change</span>
            </button>
            <div className="ml-auto flex items-center gap-1 rounded-full border border-navy-200 bg-white p-1 text-sm">
              {[true, false].map((kenya) => (
                <button
                  key={String(kenya)}
                  type="button"
                  aria-pressed={inKenya === kenya}
                  onClick={() => {
                    setInKenya(kenya);
                    setCountry(kenya ? "Kenya" : "");
                  }}
                  className={cn(
                    "rounded-full px-3 py-1",
                    inKenya === kenya
                      ? "bg-navy-950 text-white"
                      : "text-navy-700 hover:bg-navy-50"
                  )}
                >
                  {kenya ? "In Kenya · KES" : "Outside Kenya · USD"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Picker */}
            <div className="order-2 flex flex-col gap-6 lg:order-1">
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold text-navy-950">
                    {BASE.name}
                  </h2>
                  <span className="font-semibold whitespace-nowrap text-navy-950">
                    {price(pricing.settings.basePriceKes)}
                  </span>
                </div>
                <ul className="mt-3 grid gap-1.5 text-sm text-navy-800 sm:grid-cols-2">
                  {BASE.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-gold-600"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {notice ? (
                <p
                  role="status"
                  className="flex gap-2 rounded-xl bg-navy-950 px-4 py-3 text-sm text-white"
                >
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {notice}
                </p>
              ) : null}

              {recommended.length ? (
                <section className="flex flex-col gap-3">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-navy-950">
                    <Star className="size-4 text-gold-600" aria-hidden="true" />
                    Popular for {industry.name}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {recommended.map((m) => (
                      <ModuleCard
                        key={m.id}
                        module={m}
                        price={price(pricing.modules[m.id].priceKes)}
                        quantity={selection[m.id] ?? 0}
                        recommended
                        onToggle={() => toggle(m)}
                        onQuantity={(q) => setQuantity(m.id, q)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-semibold text-navy-950">
                  All add-ons
                </h2>
                {CATEGORIES.map((category) => {
                  const modules = MODULES.filter(
                    (m) => m.category === category.id && available(m)
                  );
                  const chosen = modules.filter((m) => selection[m.id]).length;
                  return (
                    <details
                      key={category.id}
                      className="group rounded-2xl border border-navy-100 bg-white"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-semibold text-navy-950 [&::-webkit-details-marker]:hidden">
                        {category.name}
                        {chosen ? (
                          <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs text-gold-800">
                            {chosen} added
                          </span>
                        ) : null}
                        <ChevronDown
                          className="ml-auto size-4 text-navy-500 transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <div className="flex flex-col gap-2 px-3 pb-3">
                        {modules.map((m) => (
                          <ModuleCard
                            key={m.id}
                            module={m}
                            price={price(pricing.modules[m.id].priceKes)}
                            quantity={selection[m.id] ?? 0}
                            recommended={industry.recommended.includes(m.id)}
                            onToggle={() => toggle(m)}
                            onQuantity={(q) => setQuantity(m.id, q)}
                          />
                        ))}
                      </div>
                    </details>
                  );
                })}
              </section>
            </div>

            {/* Preview */}
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy-800">
                    Live preview
                  </p>
                  <div className="flex gap-1 rounded-full border border-navy-200 bg-white p-1">
                    {(["desktop", "mobile"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={device === d}
                        aria-label={`${d} preview`}
                        onClick={() => setDevice(d)}
                        className={cn(
                          "rounded-full p-1.5",
                          device === d
                            ? "bg-navy-950 text-white"
                            : "text-navy-600 hover:bg-navy-50"
                        )}
                      >
                        {d === "desktop" ? (
                          <Monitor className="size-4" aria-hidden="true" />
                        ) : (
                          <Smartphone className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <SitePreview
                  industry={industry}
                  selection={selection}
                  lastAdded={lastAdded}
                  device={device}
                  platform={inKenya ? "windows" : "mac"}
                />
              </div>
            </div>
          </div>
        </div>
        {summaryBar(
          <button
            type="button"
            onClick={() => setStep("review")}
            className="btn-metallic gold-line flex items-center gap-2 rounded-xl px-5 py-3 font-semibold"
          >
            Review
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </>
    );
  }

  // ── Steps 3–4: review + details ───────────────────────────────────────
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-10 sm:px-6">
        <button
          type="button"
          onClick={() => setStep(step === "details" ? "review" : "build")}
          className="mb-6 flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-950"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {step === "details" ? "Back to review" : "Back to add-ons"}
        </button>

        {step === "review" ? (
          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-3xl font-semibold text-navy-950">
              Review your website
            </h1>
            <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-xs tracking-wide text-navy-500 uppercase">
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {oneOff.map((line) => (
                    <tr
                      key={line.id}
                      className="border-b border-navy-50 last:border-0"
                    >
                      <td className="px-5 py-3 text-navy-900">
                        {line.name}
                        {line.quantity > 1 ? (
                          <span className="text-navy-500">
                            {" "}
                            × {line.quantity} {line.unit}s
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap text-navy-900">
                        {formatMoney(line.total, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-1 border-t border-navy-100 bg-navy-50 px-5 py-4 text-sm">
                <div className="flex justify-between text-base font-semibold text-navy-950">
                  <span>Total</span>
                  <span>{formatMoney(quote.oneOffTotal, currency)}</span>
                </div>
                <div className="flex justify-between text-navy-700">
                  <span>
                    Deposit to start ({PAYMENT_TERMS.depositPercent}%)
                  </span>
                  <span>{formatMoney(quote.deposit, currency)}</span>
                </div>
                <div className="flex justify-between text-navy-700">
                  <span>Balance on launch</span>
                  <span>{formatMoney(quote.balance, currency)}</span>
                </div>
                {monthly.map((line) => (
                  <div
                    key={line.id}
                    className="flex justify-between text-navy-700"
                  >
                    <span>{line.name}</span>
                    <span>{formatMoney(line.total, currency)}/month</span>
                  </div>
                ))}
              </div>
            </div>
            <ul className="grid gap-2 text-sm text-navy-700 sm:grid-cols-2">
              <li className="flex gap-2">
                <Check
                  className="size-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                Hosting & domain free for year 1, then{" "}
                {formatMoney(quote.renewal ?? 0, currency)}/year
              </li>
              <li className="flex gap-2">
                <Check
                  className="size-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                Estimated delivery {quote.weeks.min}–{quote.weeks.max} weeks
              </li>
              <li className="flex gap-2">
                <Check
                  className="size-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                No VAT charged
              </li>
              <li className="flex gap-2">
                <Check
                  className="size-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                Final price confirmed after a short call
              </li>
            </ul>
            <label
              className={cn(
                "flex cursor-pointer gap-4 rounded-2xl border p-5 transition-colors",
                prototype
                  ? "border-gold-400 bg-gold-50"
                  : "border-navy-100 bg-white hover:border-navy-200"
              )}
            >
              <input
                type="checkbox"
                checked={prototype}
                onChange={(e) => setPrototype(e.target.checked)}
                className="mt-1 size-5 accent-[var(--gold-600)]"
              />
              <span>
                <span className="flex items-center gap-2 font-semibold text-navy-950">
                  <Lightbulb
                    className="size-4 text-gold-600"
                    aria-hidden="true"
                  />
                  Request a free prototype first
                </span>
                <span className="mt-1 block text-sm text-navy-700">
                  See a working preview of your site before you pay the deposit.
                </span>
              </span>
            </label>
          </div>
        ) : (
          <form
            id="details-form"
            onSubmit={submit}
            className="flex flex-col gap-5"
          >
            <div>
              <h1 className="font-heading text-3xl font-semibold text-navy-950">
                Your details
              </h1>
              <p className="mt-1 text-navy-700">
                For your proforma invoice and purchase order.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                name="name"
                required
                autoComplete="name"
              />
              <Field
                label="Company (optional)"
                name="company"
                autoComplete="organization"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <Field
                label="Phone / WhatsApp"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
              />
              <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-900 sm:col-span-2">
                Country
                <select
                  required
                  value={country}
                  onChange={(e) => changeCountry(e.target.value)}
                  className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-base font-normal text-navy-950 focus:border-gold-400 focus:outline-none"
                >
                  <option value="" disabled>
                    Choose your country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="text-xs font-normal text-navy-500">
                  {country === "Kenya" || !country
                    ? "Clients in Kenya are quoted in KES."
                    : "Clients outside Kenya are quoted in USD."}{" "}
                  Your total:{" "}
                  <strong>{formatMoney(quote.oneOffTotal, currency)}</strong>
                </span>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-900 sm:col-span-2">
                Anything we should know? (optional)
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={1000}
                  className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-base font-normal text-navy-950 focus:border-gold-400 focus:outline-none"
                />
              </label>
              <div className="flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-5 sm:col-span-2">
                <div>
                  <p className="font-semibold text-navy-950">
                    Share your ideas (optional)
                  </p>
                  <p className="text-sm text-navy-600">
                    Brainstormed with AI, found sites you love or built a
                    prototype? Add the links.
                  </p>
                </div>
                <MaterialsFields value={materials} onChange={setMaterials} />
              </div>
              {/* Honeypot — hidden from people, filled by bots. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
            </div>
            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            ) : null}
          </form>
        )}
      </div>
      {summaryBar(
        step === "review" ? (
          <button
            type="button"
            onClick={() => setStep("details")}
            className="btn-metallic gold-line flex items-center gap-2 rounded-xl px-5 py-3 font-semibold"
          >
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            form="details-form"
            disabled={submitting}
            className="btn-metallic gold-line flex items-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-60"
          >
            {submitting ? "Preparing…" : "Get my invoice"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )
      )}
    </>
  );
}

function IndustryStep({ onChoose }: { onChoose: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const results = INDUSTRIES.filter((i) =>
    i.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm font-semibold tracking-wide text-gold-700 uppercase">
          Instant quotation
        </p>
        <h1 className="font-heading text-3xl font-semibold text-balance text-navy-950 sm:text-4xl">
          What does your business do?
        </h1>
        <p className="mx-auto max-w-xl text-navy-700">
          Pick your industry, then add features and watch your website take
          shape — with the price updating as you go.
        </p>
      </div>
      <label className="relative mx-auto w-full max-w-md">
        <span className="sr-only">Search industries</span>
        <Search
          className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-navy-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — e.g. salon, hotel, school"
          className="w-full rounded-full border border-navy-200 bg-white py-3 pr-4 pl-11 text-base text-navy-950 focus:border-gold-400 focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {results.map((industry) => (
          <button
            key={industry.id}
            type="button"
            onClick={() => onChoose(industry.id)}
            className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 text-left text-sm font-medium text-navy-900 transition-colors hover:border-gold-400 hover:bg-gold-50 focus-visible:border-gold-400"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-gold-700">
              <IndustryIcon name={industry.icon} className="size-5" />
            </span>
            {industry.name}
          </button>
        ))}
      </div>
      {!results.length ? (
        <p className="text-center text-sm text-navy-600">
          No match —{" "}
          <button
            type="button"
            onClick={() => onChoose("other")}
            className="font-semibold text-gold-700 underline"
          >
            continue with &ldquo;Other&rdquo;
          </button>
        </p>
      ) : null}
    </div>
  );
}

function ModuleCard({
  module,
  price,
  quantity,
  recommended,
  onToggle,
  onQuantity,
}: {
  module: ModuleDef;
  price: string;
  quantity: number;
  recommended?: boolean;
  onToggle: () => void;
  onQuantity: (quantity: number) => void;
}) {
  const selected = quantity > 0;
  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        selected
          ? "border-gold-400 bg-gold-50"
          : "border-navy-100 bg-white hover:border-navy-200"
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-3.5 text-left"
      >
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
            selected
              ? "border-gold-600 bg-gold-600 text-white"
              : "border-navy-300 bg-white"
          )}
        >
          {selected ? <Check className="size-3.5" aria-hidden="true" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 font-medium text-navy-950">
            {module.name}
            {recommended ? (
              <Star
                className="size-3.5 fill-gold-400 text-gold-400"
                aria-label="Recommended"
              />
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm text-navy-600">
            {module.description}
          </span>
          {module.requires ? (
            <span className="mt-0.5 block text-xs text-navy-500">
              Needs {MODULE_BY_ID.get(module.requires)?.name}
            </span>
          ) : null}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap text-navy-950">
          {module.unit
            ? `${price} / ${module.unit}`
            : module.monthly
              ? `${price} / mo`
              : price}
        </span>
      </button>
      {selected && module.unit ? (
        <div className="flex items-center gap-3 px-3.5 pb-3.5 pl-12 text-sm text-navy-700">
          <span>How many {module.unit}s?</span>
          <div className="flex items-center rounded-lg border border-navy-200 bg-white">
            <button
              type="button"
              aria-label={`Fewer ${module.unit}s`}
              onClick={() => onQuantity(quantity - 1)}
              className="p-1.5 hover:bg-navy-50"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <span
              className="w-8 text-center font-semibold text-navy-950"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              aria-label={`More ${module.unit}s`}
              onClick={() => onQuantity(quantity + 1)}
              className="p-1.5 hover:bg-navy-50"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-900">
      {label}
      <input
        {...props}
        className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-base font-normal text-navy-950 focus:border-gold-400 focus:outline-none"
      />
    </label>
  );
}
