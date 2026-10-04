import { INDUSTRY_BY_ID, MODULE_BY_ID } from "./catalog";
import {
  buildQuote,
  convert,
  withDependencies,
  type Currency,
  type Pricing,
  type Quote,
  type Selection,
} from "./pricing";

/** Good-value extras worth adding for almost any business, best first. */
const GENERAL_PRIORITY = [
  "gbp",
  "testimonials",
  "analytics",
  "faq",
  "social-feed",
  "seo-geo",
  "portfolio",
  "blog",
  "newsletter",
  "live-chat",
];

/** The minimum budget in the client's currency (= the Standard Website price). */
export function minimumBudget(pricing: Pricing, currency: Currency) {
  return convert(pricing.settings.basePriceKes, currency, pricing.settings);
}

/**
 * Picks the best feature combination that fits the budget: the industry's
 * recommended modules first (in order of importance), then general extras.
 * Modules that don't fit are skipped, so a cheaper later one can still go in.
 * Returns null when the budget is below the Standard Website price.
 */
export function recommendForBudget(
  industryId: string,
  budget: number,
  currency: Currency,
  pricing: Pricing
): { selection: Selection; quote: Quote } | null {
  if (!Number.isFinite(budget) || budget < minimumBudget(pricing, currency))
    return null;

  const industry = INDUSTRY_BY_ID.get(industryId);
  const candidates = [
    ...(industry?.recommended ?? []),
    ...GENERAL_PRIORITY,
  ].filter((id, i, all) => all.indexOf(id) === i);

  let selection: Selection = {};
  for (const id of candidates) {
    const mod = MODULE_BY_ID.get(id);
    if (!mod || mod.monthly || !pricing.modules[id]?.enabled) continue;
    const next = withDependencies({ ...selection, [id]: 1 });
    if (buildQuote(next, pricing, currency).oneOffTotal <= budget)
      selection = next;
  }
  return { selection, quote: buildQuote(selection, pricing, currency) };
}
