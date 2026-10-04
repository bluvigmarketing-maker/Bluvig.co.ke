"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MousePointerClick,
  PhoneCall,
  Search,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { readJson } from "@/lib/read-json";
import { INDUSTRIES, INDUSTRY_BY_ID } from "@/lib/estimator/catalog";
import {
  convert,
  formatMoney,
  type Currency,
  type Pricing,
} from "@/lib/estimator/pricing";
import { minimumBudget, recommendForBudget } from "@/lib/estimator/recommend";
import { EMPTY_MATERIALS, type Materials } from "@/lib/materials";
import {
  BEST_TIMES,
  BUDGET_BANDS,
  TIMELINES,
  type BestTimeId,
  type BudgetBandId,
  type TimelineId,
} from "@/lib/qualify";
import { IndustryIcon } from "@/components/estimator/industry-icon";
import { MaterialsFields } from "./materials-fields";

type Mode = "choose" | "callback" | "recommend";
const CALLBACK_STEPS = [
  "industry",
  "budget",
  "timeline",
  "ideas",
  "contact",
] as const;
const RECOMMEND_STEPS = ["industry", "amount", "result"] as const;

export function StartWizard({ pricing }: { pricing: Pricing }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [step, setStep] = useState(0);
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [inKenya, setInKenya] = useState(true);
  const [band, setBand] = useState<BudgetBandId | null>(null);
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [materials, setMaterials] = useState<Materials>(EMPTY_MATERIALS);
  const [bestTime, setBestTime] = useState<BestTimeId | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ belowMinimum: boolean } | null>(null);

  useEffect(() => {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone !== "Africa/Nairobi") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInKenya(false);
    }
  }, []);

  const currency: Currency = inKenya ? "KES" : "USD";
  const money = (kes: number) =>
    formatMoney(convert(kes, currency, pricing.settings), currency);
  const minimum = minimumBudget(pricing, currency);
  const industry = industryId ? (INDUSTRY_BY_ID.get(industryId) ?? null) : null;
  const budgetNumber = Number(amount.replace(/[^\d.]/g, ""));
  const recommendation = useMemo(
    () =>
      industryId && budgetNumber
        ? recommendForBudget(industryId, budgetNumber, currency, pricing)
        : null,
    [industryId, budgetNumber, currency, pricing]
  );

  function bandLabel(id: BudgetBandId) {
    const b = BUDGET_BANDS.find((x) => x.id === id)!;
    if (id === "unsure") return "Not sure yet";
    if (id === "below-min") return `Below ${formatMoney(minimum, currency)}`;
    const low = id === "30-60" ? pricing.settings.basePriceKes : b.minKes!;
    return b.maxKes ? `${money(low)} – ${money(b.maxKes)}` : `${money(low)}+`;
  }

  function start(next: Mode) {
    setMode(next);
    setStep(0);
    setError(null);
  }

  function switchToCallback() {
    // Carry over what we know from the recommendation flow.
    if (budgetNumber) {
      const kes =
        currency === "KES"
          ? budgetNumber
          : (budgetNumber * pricing.settings.fxRate) /
            pricing.settings.intlMultiplier;
      const match = BUDGET_BANDS.find(
        (b) =>
          b.minKes !== null &&
          kes >= b.minKes &&
          (b.maxKes === null || kes <= b.maxKes)
      );
      setBand(match?.id ?? null);
    }
    setMode("callback");
    setStep(industryId ? 1 : 0);
  }

  async function submitCallback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!band || !timeline || !industryId) return;
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "callback",
          industry: industryId,
          location: inKenya ? "kenya" : "international",
          budgetBand: band,
          budgetLabel: bandLabel(band),
          timeline,
          bestTime,
          materials,
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          message: form.get("message"),
          website: form.get("website"),
        }),
      });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setDone({ belowMinimum: band === "below-min" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const quotationHref = recommendation
    ? `/quotation?${new URLSearchParams({
        i: industryId!,
        m: Object.entries(recommendation.selection)
          .map(([id, q]) => (q > 1 ? `${id}:${q}` : id))
          .join(","),
        loc: inKenya ? "ke" : "intl",
      })}`
    : "/quotation";

  const locationToggle = (
    <div className="flex w-fit gap-1 rounded-full border border-navy-200 bg-white p-1 text-sm">
      {[true, false].map((kenya) => (
        <button
          key={String(kenya)}
          type="button"
          aria-pressed={inKenya === kenya}
          onClick={() => setInKenya(kenya)}
          className={cn(
            "rounded-full px-3 py-1",
            inKenya === kenya
              ? "bg-navy-950 text-white"
              : "text-navy-700 hover:bg-navy-50"
          )}
        >
          {kenya ? "I'm in Kenya · KES" : "Outside Kenya · USD"}
        </button>
      ))}
    </div>
  );

  // ── Done ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-14 text-gold-600" aria-hidden="true" />
        <h2 className="font-heading text-3xl font-semibold text-navy-950">
          We&rsquo;ll call you back
        </h2>
        <p className="text-navy-700">
          Thanks! Someone from Bluvig will call you
          {bestTime ? ` in the ${bestTime}` : " shortly"} to talk through your
          project and recommend the right setup.
        </p>
        {done.belowMinimum ? (
          <p className="rounded-xl bg-gold-50 px-4 py-3 text-sm text-navy-800">
            Our websites start at{" "}
            <strong>{formatMoney(minimum, currency)}</strong>. We&rsquo;ll still
            talk through options — for example starting small and adding
            features later.
          </p>
        ) : null}
        <Link
          href="/"
          className="text-sm font-medium text-gold-700 underline-offset-4 hover:underline"
        >
          Back to the homepage
        </Link>
      </div>
    );
  }

  // ── Step 0: how do you want to start? ─────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-navy-950 sm:text-3xl">
            How would you like to start?
          </h2>
          <p className="mt-2 text-navy-700">
            Pick whatever feels easiest — you can switch later.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ChoiceCard
            icon={PhoneCall}
            title="Call me back"
            text="Not sure what you need? Answer a few quick questions and we'll call to recommend the right setup."
            onClick={() => start("callback")}
          />
          <ChoiceCard
            icon={MousePointerClick}
            title="I'll pick the features"
            text="Open the visual builder, choose features yourself and watch the price update live."
            href="/quotation"
          />
          <ChoiceCard
            icon={Sparkles}
            title="Recommend for my budget"
            text="Tell us your industry and budget — we'll suggest the best feature combination for it."
            onClick={() => start("recommend")}
          />
        </div>
      </div>
    );
  }

  const steps = mode === "callback" ? CALLBACK_STEPS : RECOMMEND_STEPS;
  const current = steps[step];
  const back = () => (step === 0 ? setMode("choose") : setStep(step - 1));
  const next = () => setStep(step + 1);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-950"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </button>
        <div
          className="flex flex-1 gap-1.5"
          aria-label={`Step ${step + 1} of ${steps.length}`}
        >
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= step ? "bg-gold-500" : "bg-navy-100"
              )}
            />
          ))}
        </div>
      </div>

      {current === "industry" ? (
        <Question title="What does your business do?">
          <IndustryPicker
            value={industryId}
            onChange={(id) => {
              setIndustryId(id);
              next();
            }}
          />
        </Question>
      ) : null}

      {current === "budget" ? (
        <Question
          title="What budget do you have in mind?"
          subtitle="A rough range is fine."
        >
          {locationToggle}
          <div className="grid gap-2 sm:grid-cols-2">
            {BUDGET_BANDS.map((b) => (
              <Chip
                key={b.id}
                selected={band === b.id}
                onClick={() => {
                  setBand(b.id);
                  next();
                }}
              >
                {bandLabel(b.id)}
              </Chip>
            ))}
          </div>
          {band === "below-min" ? (
            <p className="text-sm text-navy-600">
              Heads-up: our websites start at {formatMoney(minimum, currency)}.
            </p>
          ) : null}
        </Question>
      ) : null}

      {current === "timeline" ? (
        <Question title="When would you like to launch?">
          <div className="grid gap-2 sm:grid-cols-2">
            {TIMELINES.map((t) => (
              <Chip
                key={t.id}
                selected={timeline === t.id}
                onClick={() => {
                  setTimeline(t.id);
                  next();
                }}
              >
                {t.label}
              </Chip>
            ))}
          </div>
        </Question>
      ) : null}

      {current === "ideas" ? (
        <Question
          title="Got ideas to share?"
          subtitle="Optional — but it helps us prepare a better call."
        >
          <MaterialsFields value={materials} onChange={setMaterials} />
          <NextButton onClick={next}>
            {materials.aiChats.length ||
            materials.inspirations.length ||
            materials.prototype
              ? "Continue"
              : "Skip"}
          </NextButton>
        </Question>
      ) : null}

      {current === "contact" ? (
        <Question title="Where should we call you?">
          <form onSubmit={submitCallback} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Your name"
                name="name"
                required
                autoComplete="name"
              />
              <Field
                label="Phone / WhatsApp"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
              />
              <Field
                label="Email (optional)"
                name="email"
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-navy-900">
                Best time to call
              </span>
              <div className="flex flex-wrap gap-2">
                {BEST_TIMES.map((t) => (
                  <Chip
                    key={t.id}
                    compact
                    selected={bestTime === t.id}
                    onClick={() => setBestTime(t.id)}
                  >
                    {t.label}
                  </Chip>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-900">
              Anything else? (optional)
              <textarea
                name="message"
                rows={3}
                maxLength={1000}
                className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-base font-normal text-navy-950 focus:border-gold-400 focus:outline-none"
              />
            </label>
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
            <NextButton type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Request my call back"}
            </NextButton>
          </form>
        </Question>
      ) : null}

      {current === "amount" ? (
        <Question
          title="What's your budget?"
          subtitle="We'll fit the best features for your industry into it."
        >
          {locationToggle}
          <label className="flex max-w-sm items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-3 focus-within:border-gold-400">
            <span className="font-semibold text-navy-600">{currency}</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={inKenya ? "e.g. 60,000" : "e.g. 1,500"}
              aria-label={`Budget in ${currency}`}
              className="min-w-0 flex-1 text-lg text-navy-950 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(inKenya
              ? [30_000, 50_000, 80_000, 120_000, 200_000]
              : [700, 1_200, 2_000, 3_500, 6_000]
            ).map((n) => (
              <Chip
                key={n}
                compact
                selected={budgetNumber === n}
                onClick={() => setAmount(String(n))}
              >
                {formatMoney(n, currency)}
              </Chip>
            ))}
          </div>
          {budgetNumber && budgetNumber < minimum ? (
            <p className="text-sm text-navy-600">
              Our websites start at{" "}
              <strong>{formatMoney(minimum, currency)}</strong>.
            </p>
          ) : null}
          <NextButton onClick={next} disabled={!budgetNumber}>
            Show my recommendation
          </NextButton>
        </Question>
      ) : null}

      {current === "result" ? (
        recommendation ? (
          <Question
            title="Our recommendation"
            subtitle={`The best setup for ${industry?.name ?? "your business"} within ${formatMoney(budgetNumber, currency)}.`}
          >
            <ul className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
              {recommendation.quote.lines
                .filter((l) => !l.monthly)
                .map((line) => (
                  <li
                    key={line.id}
                    className="flex items-center justify-between gap-4 border-b border-navy-50 px-5 py-3 text-sm last:border-0"
                  >
                    <span className="flex items-center gap-2 text-navy-900">
                      <Check
                        className="size-4 shrink-0 text-gold-600"
                        aria-hidden="true"
                      />
                      {line.name}
                    </span>
                    <span className="whitespace-nowrap text-navy-700">
                      {formatMoney(line.total, currency)}
                    </span>
                  </li>
                ))}
              <li className="flex items-center justify-between bg-navy-50 px-5 py-3 font-semibold text-navy-950">
                <span>Total</span>
                <span>
                  {formatMoney(recommendation.quote.oneOffTotal, currency)}
                </span>
              </li>
            </ul>
            <p className="text-sm text-navy-600">
              Hosting & domain free for year 1 ·{" "}
              {recommendation.quote.weeks.min}–{recommendation.quote.weeks.max}{" "}
              weeks · 60% deposit to start
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={quotationHref}
                className="btn-metallic gold-line flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold"
              >
                See it &amp; customise
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={switchToCallback}
                className="rounded-xl border border-navy-200 bg-white px-5 py-3 font-semibold text-navy-900 hover:bg-navy-50"
              >
                Talk it through on a call
              </button>
            </div>
          </Question>
        ) : (
          <Question
            title={`Our websites start at ${formatMoney(minimum, currency)}`}
          >
            <p className="text-navy-700">
              That budget is below our Standard Website, which includes the core
              pages, admin dashboard, map, WhatsApp button, basic SEO and a year
              of hosting & domain.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-metallic gold-line rounded-xl px-5 py-3 font-semibold"
              >
                Adjust my budget
              </button>
              <button
                type="button"
                onClick={switchToCallback}
                className="rounded-xl border border-navy-200 bg-white px-5 py-3 font-semibold text-navy-900 hover:bg-navy-50"
              >
                Request a call back instead
              </button>
            </div>
          </Question>
        )
      ) : null}
    </div>
  );
}

function Question({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-navy-950 sm:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-navy-700">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  text,
  href,
  onClick,
}: {
  icon: typeof PhoneCall;
  title: string;
  text: string;
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="font-heading text-lg font-semibold text-navy-950">
        {title}
      </span>
      <span className="text-sm text-navy-700">{text}</span>
      <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-gold-700">
        Choose <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </>
  );
  const className =
    "flex h-full flex-col items-start gap-3 rounded-2xl border border-navy-100 bg-white p-6 text-left shadow-sm transition-colors hover:border-gold-400 hover:bg-gold-50 focus-visible:border-gold-400";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function Chip({
  selected,
  compact,
  onClick,
  children,
}: {
  selected: boolean;
  compact?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-xl border text-left font-medium transition-colors",
        compact ? "px-3 py-2 text-sm" : "px-4 py-3.5",
        selected
          ? "border-gold-500 bg-gold-50 text-navy-950"
          : "border-navy-200 bg-white text-navy-800 hover:border-gold-400"
      )}
    >
      {children}
    </button>
  );
}

function NextButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="btn-metallic gold-line flex w-fit items-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-50"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </button>
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

function IndustryPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = INDUSTRIES.filter((i) =>
    i.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  return (
    <div className="flex flex-col gap-3">
      <label className="relative w-full max-w-md">
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
          className="w-full rounded-full border border-navy-200 bg-white py-2.5 pr-4 pl-11 text-base text-navy-950 focus:border-gold-400 focus:outline-none"
        />
      </label>
      <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {(results.length
          ? results
          : INDUSTRIES.filter((i) => i.id === "other")
        ).map((i) => (
          <button
            key={i.id}
            type="button"
            aria-pressed={value === i.id}
            onClick={() => onChange(i.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
              value === i.id
                ? "border-gold-500 bg-gold-50 text-navy-950"
                : "border-navy-100 bg-white text-navy-900 hover:border-gold-400"
            )}
          >
            <IndustryIcon
              name={i.icon}
              className="size-4 shrink-0 text-gold-700"
            />
            {i.name}
          </button>
        ))}
      </div>
    </div>
  );
}
