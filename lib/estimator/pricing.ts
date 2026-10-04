/**
 * Pure pricing logic shared by the browser (live total) and the server (saved
 * estimates). The server always recalculates — client totals are never trusted.
 */
import { BASE, MODULE_BY_ID, MODULES, type ModuleDef } from "./catalog";

export type Currency = "KES" | "USD";

export interface PricingSettings {
  basePriceKes: number;
  /** KES per 1 USD. */
  fxRate: number;
  /** International clients pay this multiple of the KES price. */
  intlMultiplier: number;
}

export interface ModulePricing {
  priceKes: number;
  enabled: boolean;
}

/** Live pricing: defaults from the catalog merged with the owner's edits. */
export interface Pricing {
  settings: PricingSettings;
  modules: Record<string, ModulePricing>;
}

export const DEFAULT_SETTINGS: PricingSettings = {
  basePriceKes: BASE.defaultPriceKes,
  fxRate: 130,
  intlMultiplier: 3,
};

export const PAYMENT_TERMS = {
  depositPercent: 60,
  paybill: "522522",
  account: "1315475243",
};

/** Selected module id → quantity (1 for non-quantity modules). */
export type Selection = Record<string, number>;

export interface QuoteLine {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  total: number;
  monthly: boolean;
}

export interface Quote {
  currency: Currency;
  lines: QuoteLine[];
  oneOffTotal: number;
  monthlyTotal: number;
  deposit: number;
  balance: number;
  /** Delivery estimate in weeks. */
  weeks: { min: number; max: number };
}

/** Converts a KES price to the client's currency. USD rounds to the nearest $10. */
export function convert(
  kes: number,
  currency: Currency,
  settings: PricingSettings
) {
  if (currency === "KES") return kes;
  return Math.max(
    10,
    Math.round((kes * settings.intlMultiplier) / settings.fxRate / 10) * 10
  );
}

export function formatMoney(amount: number, currency: Currency) {
  return currency === "KES"
    ? `KES ${amount.toLocaleString("en-KE")}`
    : `USD ${amount.toLocaleString("en-US")}`;
}

/** Adds required modules (e.g. Inventory needs Online Shop). */
export function withDependencies(selection: Selection): Selection {
  const next = { ...selection };
  for (const id of Object.keys(next)) {
    const requires = MODULE_BY_ID.get(id)?.requires;
    if (requires && !next[requires]) next[requires] = 1;
  }
  return next;
}

/** Modules that depend on `id` and are currently selected. */
export function dependentsOf(id: string, selection: Selection): ModuleDef[] {
  return MODULES.filter((m) => m.requires === id && selection[m.id]);
}

export function buildQuote(
  selection: Selection,
  pricing: Pricing,
  currency: Currency
): Quote {
  const { settings } = pricing;
  const base = convert(settings.basePriceKes, currency, settings);
  const lines: QuoteLine[] = [
    {
      id: "base",
      name: BASE.name,
      quantity: 1,
      unitPrice: base,
      total: base,
      monthly: false,
    },
  ];
  let days = BASE.days;

  for (const mod of MODULES) {
    const quantity = Math.floor(selection[mod.id] ?? 0);
    const live = pricing.modules[mod.id];
    if (quantity < 1 || !live?.enabled) continue;
    const unitPrice = convert(live.priceKes, currency, settings);
    lines.push({
      id: mod.id,
      name: mod.name,
      quantity,
      unit: mod.unit,
      unitPrice,
      total: unitPrice * quantity,
      monthly: Boolean(mod.monthly),
    });
    days += mod.days * quantity;
  }

  const oneOffTotal = lines
    .filter((l) => !l.monthly)
    .reduce((sum, l) => sum + l.total, 0);
  const monthlyTotal = lines
    .filter((l) => l.monthly)
    .reduce((sum, l) => sum + l.total, 0);
  const deposit = Math.round(
    (oneOffTotal * PAYMENT_TERMS.depositPercent) / 100
  );
  // Parallel work shortens the calendar: count roughly 5 working days per week.
  const weeks = Math.max(2, Math.ceil(days / 5));

  return {
    currency,
    lines,
    oneOffTotal,
    monthlyTotal,
    deposit,
    balance: oneOffTotal - deposit,
    weeks: { min: weeks, max: weeks + Math.ceil(weeks / 3) },
  };
}

/** Sanitises an untrusted selection: known, enabled modules; sane quantities. */
export function cleanSelection(input: unknown, pricing: Pricing): Selection {
  const selection: Selection = {};
  if (!input || typeof input !== "object") return selection;
  for (const [id, raw] of Object.entries(input as Record<string, unknown>)) {
    const mod = MODULE_BY_ID.get(id);
    if (!mod || !pricing.modules[id]?.enabled) continue;
    const quantity = Math.floor(Number(raw));
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    selection[id] = mod.unit ? Math.min(quantity, 50) : 1;
  }
  return withDependencies(selection);
}
