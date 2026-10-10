"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Gauge,
  Info,
  Lightbulb,
  Lock,
  Minus,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
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
  buildPackages,
  DEFAULT_PACKAGE,
  matchPackage,
  relevantModules,
  type Package,
} from "@/lib/estimator/packages";
import {
  addWeeks,
  buildQuote,
  convert,
  dependentsOf,
  formatDay,
  formatMoney,
  GUARANTEES,
  nextStartDate,
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

type Step = "industry" | "build" | "price" | "done";

/** The 3 steps a visitor sees — told up front so the process never feels open-ended. */
const STEPS = ["Your business", "Your package", "Your price"];

/** Shown first; the rest sit behind "Show all industries" to keep step 1 short. */
const POPULAR_INDUSTRIES = [
  "restaurant",
  "retail",
  "salon",
  "clinic",
  "school",
  "real-estate",
  "hotel",
  "consulting",
];

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
  const [showAll, setShowAll] = useState(false);
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
  const packages = useMemo(
    () => (industry ? buildPackages(industry, pricing) : []),
    [industry, pricing]
  );
  const activePackage = matchPackage(packages, selection);
  const start = nextStartDate(pricing.settings);
  const liveBy = addWeeks(start, quote.weeks.max);

  // Default effect: the recommended package is pre-selected, so a visitor
  // who changes nothing still sees a sensible site and price.
  function chooseIndustry(id: string) {
    const chosen = INDUSTRY_BY_ID.get(id);
    setIndustryId(id);
    setShowAll(false);
    setNotice(null);
    if (chosen) {
      const pkg = buildPackages(chosen, pricing).find(
        (p) => p.id === DEFAULT_PACKAGE
      );
      setSelection(pkg?.selection ?? {});
      setLastAdded(null);
    }
    setStep("build");
  }

  function choosePackage(pkg: Package) {
    setNotice(null);
    setLastAdded(
      Object.keys(pkg.selection).find((id) => !selection[id]) ?? null
    );
    setSelection(pkg.selection);
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
  const relevant = relevantModules(industry, MODULES).filter(available);

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
          <p className="text-xs text-navy-500">Your price</p>
          <p className="font-heading text-xl font-semibold text-navy-950 sm:text-2xl">
            {formatMoney(quote.oneOffTotal, currency)}
            {quote.monthlyTotal ? (
              <span className="ml-2 text-sm font-normal text-navy-600">
                + {formatMoney(quote.monthlyTotal, currency)}/mo
              </span>
            ) : null}
          </p>
          <p className="text-xs text-navy-500">
            Live by {formatDay(liveBy)} · {PAYMENT_TERMS.depositPercent}%
            deposit to start
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
          <Progress current={1} className="mb-5" />
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
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-semibold text-navy-950">
                  Pick your package
                </h2>
                <div className="flex flex-col gap-3">
                  {packages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      industryName={industry.name}
                      total={formatMoney(
                        buildQuote(pkg.selection, pricing, currency)
                          .oneOffTotal,
                        currency
                      )}
                      previous={packages[index - 1]}
                      selected={activePackage === pkg.id}
                      onChoose={() => choosePackage(pkg)}
                    />
                  ))}
                </div>
                {activePackage === null ? (
                  <p className="text-sm text-navy-600">
                    You&rsquo;ve customised your package. Your price updates
                    below.
                  </p>
                ) : null}
              </section>

              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <p className="font-semibold text-navy-950">
                  Every package includes
                </p>
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

              <details className="group rounded-2xl border border-navy-100 bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block font-semibold text-navy-950">
                      Want more? Choose your own features
                    </span>
                    <span className="block text-sm text-navy-600">
                      Optional. Add or remove anything.
                    </span>
                  </span>
                  <ChevronDown
                    className="ml-auto size-4 shrink-0 text-navy-500 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="flex flex-col gap-2 px-3 pb-3">
                  <p className="px-2 text-xs font-semibold tracking-wide text-navy-500 uppercase">
                    Useful for {industry.name}
                  </p>
                  {relevant.map((m) => (
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
                  {showAll ? (
                    <div className="mt-2 flex flex-col gap-2">
                      {CATEGORIES.map((category) => {
                        const modules = MODULES.filter(
                          (m) =>
                            m.category === category.id &&
                            available(m) &&
                            !relevant.includes(m)
                        );
                        if (!modules.length) return null;
                        const chosen = modules.filter(
                          (m) => selection[m.id]
                        ).length;
                        return (
                          <details
                            key={category.id}
                            className="group/cat rounded-xl border border-navy-100 bg-white"
                          >
                            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-semibold text-navy-950 [&::-webkit-details-marker]:hidden">
                              {category.name}
                              {chosen ? (
                                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs text-gold-800">
                                  {chosen} added
                                </span>
                              ) : null}
                              <ChevronDown
                                className="ml-auto size-4 text-navy-500 transition-transform group-open/cat:rotate-180"
                                aria-hidden="true"
                              />
                            </summary>
                            <div className="flex flex-col gap-2 px-2 pb-2">
                              {modules.map((m) => (
                                <ModuleCard
                                  key={m.id}
                                  module={m}
                                  price={price(pricing.modules[m.id].priceKes)}
                                  quantity={selection[m.id] ?? 0}
                                  onToggle={() => toggle(m)}
                                  onQuantity={(q) => setQuantity(m.id, q)}
                                />
                              ))}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAll(true)}
                      className="mt-1 rounded-xl border border-dashed border-navy-200 px-4 py-3 text-sm font-semibold text-navy-700 hover:bg-navy-50"
                    >
                      Show all add-ons
                    </button>
                  )}
                </div>
              </details>
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
                <Guarantees start={start} liveBy={liveBy} className="mt-4" />
              </div>
            </div>
          </div>
        </div>
        {summaryBar(
          <button
            type="button"
            onClick={() => setStep("price")}
            className="btn-metallic gold-line flex items-center gap-2 rounded-xl px-5 py-3 font-semibold"
          >
            See my price
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </>
    );
  }

  // ── Step 3: price (+ optional proforma) ───────────────────────────────
  const packageName = packages.find((p) => p.id === activePackage)?.name;
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-10 sm:px-6">
        <Progress current={2} className="mb-5" />
        <button
          type="button"
          onClick={() => setStep("build")}
          className="mb-6 flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-950"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to your package
        </button>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-navy-950">
              Your price
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-navy-700">
              <Lock
                className="size-4 shrink-0 text-gold-600"
                aria-hidden="true"
              />
              This is your price. No sign-up or email needed to see it.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
            <p className="border-b border-navy-100 px-5 py-3 font-semibold text-navy-950">
              {packageName
                ? `${packageName} package · ${industry.name}`
                : `Custom package · ${industry.name}`}
            </p>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs tracking-wide text-navy-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
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
                <span>Deposit to start ({PAYMENT_TERMS.depositPercent}%)</span>
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
              No VAT charged
            </li>
            <li className="flex gap-2">
              <Check
                className="size-4 shrink-0 text-gold-600"
                aria-hidden="true"
              />
              Balance paid only on launch
            </li>
            <li className="flex gap-2">
              <Check
                className="size-4 shrink-0 text-gold-600"
                aria-hidden="true"
              />
              10% off if we deliver late
            </li>
          </ul>

          <Guarantees start={start} liveBy={liveBy} />

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

          <form
            id="details-form"
            onSubmit={submit}
            className="flex flex-col gap-5 rounded-2xl border border-navy-100 bg-white p-5"
          >
            <div>
              <h2 className="font-heading text-xl font-semibold text-navy-950">
                Ready? Reserve your start date
              </h2>
              <p className="mt-1 text-sm text-navy-700">
                We only need your name and WhatsApp number to send your
                proforma invoice. No account, no spam.
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
                label="WhatsApp number"
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
            </div>
            <details className="group rounded-xl border border-navy-100">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-navy-800 [&::-webkit-details-marker]:hidden">
                Add more details (optional)
                <ChevronDown
                  className="ml-auto size-4 text-navy-500 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
                <Field
                  label="Email (optional)"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <Field
                  label="Company (optional)"
                  name="company"
                  autoComplete="organization"
                />
                <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-900 sm:col-span-2">
                  Anything we should know?
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={1000}
                    className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-base font-normal text-navy-950 focus:border-gold-400 focus:outline-none"
                  />
                </label>
                <div className="flex flex-col gap-3 sm:col-span-2">
                  <div>
                    <p className="font-semibold text-navy-950">
                      Share your ideas
                    </p>
                    <p className="text-sm text-navy-600">
                      Brainstormed with AI, found sites you love or built a
                      prototype? Add the links.
                    </p>
                  </div>
                  <MaterialsFields value={materials} onChange={setMaterials} />
                </div>
              </div>
            </details>
            {/* Honeypot — hidden from people, filled by bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </div>
      {summaryBar(
        <button
          type="submit"
          form="details-form"
          disabled={submitting}
          className="btn-metallic gold-line flex items-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-60"
        >
          {submitting ? "Preparing…" : "Get my proforma"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      )}
    </>
  );
}

/** "3 quick steps · about 2 minutes · no sign-up": removes the fear of a long or gated process. */
function PromiseLine() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-navy-700">
      <li className="flex items-center gap-1.5">
        <Check className="size-4 text-gold-600" aria-hidden="true" />3 quick
        steps
      </li>
      <li className="flex items-center gap-1.5">
        <Clock className="size-4 text-gold-600" aria-hidden="true" />
        About 2 minutes
      </li>
      <li className="flex items-center gap-1.5">
        <Lock className="size-4 text-gold-600" aria-hidden="true" />
        No sign-up to see your price
      </li>
    </ul>
  );
}

function Progress({
  current,
  className,
}: {
  /** Zero-based index into STEPS. */
  current: number;
  className?: string;
}) {
  return (
    <ol
      aria-label="Progress"
      className={cn("mx-auto flex w-full max-w-md gap-2", className)}
    >
      {STEPS.map((label, index) => (
        <li key={label} className="flex flex-1 flex-col gap-1.5">
          <span
            className={cn(
              "h-1.5 rounded-full",
              index <= current ? "bg-gold-500" : "bg-navy-100"
            )}
          />
          <span
            aria-current={index === current ? "step" : undefined}
            className={cn(
              "text-xs",
              index === current
                ? "font-semibold text-navy-950"
                : "text-navy-500"
            )}
          >
            {index + 1}. {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Risk reversal + honest scarcity, shown under the preview and on the price step. */
function Guarantees({
  start,
  liveBy,
  className,
}: {
  start: Date;
  liveBy: Date;
  className?: string;
}) {
  const items = [
    {
      icon: ShieldCheck,
      title: `Live by ${formatDay(liveBy)}`,
      text: GUARANTEES.delivery,
    },
    {
      icon: Gauge,
      title: "Loads in 1 second",
      text: GUARANTEES.speed,
    },
    {
      icon: CalendarClock,
      title: `Next free start: ${formatDay(start)}`,
      text: "We start one new website a week, so every client gets our full attention.",
    },
  ];
  return (
    <ul
      className={cn(
        "grid gap-3 rounded-2xl border border-navy-100 bg-white p-4 sm:grid-cols-3",
        className
      )}
    >
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3 sm:flex-col sm:gap-2">
          <Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold text-navy-950">
              {title}
            </span>
            <span className="block text-xs text-navy-600">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function PackageCard({
  pkg,
  industryName,
  total,
  previous,
  selected,
  onChoose,
}: {
  pkg: Package;
  industryName: string;
  total: string;
  /** The tier below, so the card lists only what this one adds. */
  previous?: Package;
  selected: boolean;
  onChoose: () => void;
}) {
  const recommended = pkg.id === DEFAULT_PACKAGE;
  const extras = Object.keys(pkg.selection)
    .filter((id) => !previous?.selection[id])
    .map((id) => MODULE_BY_ID.get(id)?.name)
    .filter(Boolean);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onChoose}
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-colors",
        selected
          ? "border-gold-500 bg-gold-50"
          : "border-navy-100 bg-white hover:border-navy-200"
      )}
    >
      {recommended ? (
        <span className="flex w-fit items-center gap-1 rounded-full bg-navy-950 px-2.5 py-0.5 text-xs font-semibold text-white">
          <Star
            className="size-3 fill-gold-400 text-gold-400"
            aria-hidden="true"
          />
          Recommended for {industryName}
        </span>
      ) : null}
      <span className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-gold-600 bg-gold-600" : "border-navy-300"
          )}
        >
          {selected ? (
            <Check className="size-3 text-white" aria-hidden="true" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-lg font-semibold text-navy-950">
            {pkg.name}
          </span>
          <span className="block text-sm text-navy-700">{pkg.promise}</span>
        </span>
        <span className="font-semibold whitespace-nowrap text-navy-950">
          {total}
        </span>
      </span>
      <span className="pl-8 text-sm text-navy-600">
        {previous
          ? `Everything in ${previous.name}${extras.length ? `, plus ${extras.join(", ")}` : ""}`
          : "Standard Website with everything listed below"}
      </span>
    </button>
  );
}

function IndustryStep({ onChoose }: { onChoose: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const search = query.trim().toLowerCase();
  // Short list first (choice overload): 8 common industries, the rest on demand.
  const results =
    search || showAll
      ? INDUSTRIES.filter((i) => i.name.toLowerCase().includes(search))
      : POPULAR_INDUSTRIES.map((id) => INDUSTRY_BY_ID.get(id)!).filter(
          Boolean
        );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <Progress current={0} />
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm font-semibold tracking-wide text-gold-700 uppercase">
          Instant quotation
        </p>
        <h1 className="font-heading text-3xl font-semibold text-balance text-navy-950 sm:text-4xl">
          See your website and its exact price in 2 minutes
        </h1>
        <p className="mx-auto max-w-xl text-navy-700">
          First, what does your business do?
        </p>
        <PromiseLine />
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
      {!search && !showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mx-auto rounded-full border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50"
        >
          Show all {INDUSTRIES.length} industries
        </button>
      ) : null}
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
