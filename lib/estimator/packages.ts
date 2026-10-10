/**
 * Ready-made packages — three outcome-named bundles per industry, so most
 * visitors pick one instead of assembling a site from ~60 add-ons. Built from
 * each industry's `recommended` list, so they follow the catalog automatically
 * and are priced by the live price list.
 */
import { MODULE_BY_ID, type IndustryDef, type ModuleDef } from "./catalog";
import { withDependencies, type Pricing, type Selection } from "./pricing";

export type PackageId = "found" | "customers" | "complete";

export interface Package {
  id: PackageId;
  name: string;
  /** The outcome the package buys, in the owner's words. */
  promise: string;
  selection: Selection;
}

/** Cheap, high-value extras for any business, best first. */
const ESSENTIAL_EXTRAS = ["gbp", "testimonials", "faq"];
const COMPLETE_EXTRAS = ["gbp", "testimonials", "seo-geo", "analytics"];

/** The package the page pre-selects (the default most visitors keep). */
export const DEFAULT_PACKAGE: PackageId = "customers";

export function buildPackages(
  industry: IndustryDef,
  pricing: Pricing
): Package[] {
  const usable = (id: string) => {
    const mod = MODULE_BY_ID.get(id);
    return Boolean(mod && !mod.monthly && pricing.modules[id]?.enabled);
  };
  const pick = (ids: string[]): Selection =>
    withDependencies(
      Object.fromEntries(ids.filter(usable).map((id) => [id, 1]))
    );

  const recommended = industry.recommended.filter(usable);
  // Industries with no recommendations ("Other") grow through visibility extras.
  const growth = recommended.length
    ? [...recommended.slice(0, 3), "gbp"]
    : ESSENTIAL_EXTRAS;

  return [
    {
      id: "found",
      name: "Get Found",
      promise: "A professional site customers can find on Google.",
      selection: {},
    },
    {
      id: "customers",
      name: "Win Customers",
      promise: "Turn visitors into enquiries, bookings and sales.",
      selection: pick(growth),
    },
    {
      id: "complete",
      name: "Run It Online",
      promise: "Everything your business needs, working for you 24/7.",
      selection: pick([...recommended, ...COMPLETE_EXTRAS]),
    },
  ];
}

/** The package whose selection matches exactly, or null when customised. */
export function matchPackage(
  packages: Package[],
  selection: Selection
): PackageId | null {
  const key = (s: Selection) =>
    Object.entries(s)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, q]) => `${id}:${q}`)
      .join(",");
  const current = key(selection);
  return packages.find((p) => key(p.selection) === current)?.id ?? null;
}

/** Modules worth showing first when customising: this industry's picks plus broad extras. */
export function relevantModules(
  industry: IndustryDef,
  modules: ModuleDef[]
): ModuleDef[] {
  const ids = new Set([
    ...industry.recommended,
    ...COMPLETE_EXTRAS,
    ...ESSENTIAL_EXTRAS,
    "extra-page",
    "blog",
    "portfolio",
    "live-chat",
    "maintenance",
  ]);
  return modules.filter((m) => ids.has(m.id));
}
