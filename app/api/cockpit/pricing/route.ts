import { NextResponse } from "next/server";

import { isCockpitAuthed, verifyPassword } from "@/lib/admin-auth";
import { MODULES } from "@/lib/estimator/catalog";
import type { Pricing } from "@/lib/estimator/pricing";
import { getPricing, savePricing } from "@/lib/estimator/store";
import { withStorageErrors } from "@/lib/storage-errors";

const wholeNumber = (v: unknown, max: number) =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max;

/**
 * Save prices. Needs a cockpit session — or, while cockpit sign-in is switched
 * off, the ADMIN_PASSWORD — so the public can't change prices.
 */
export const PUT = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    pricing?: Pricing;
  } | null;

  const allowed =
    (await isCockpitAuthed()) ||
    (body?.password ? verifyPassword(body.password) : false);
  if (!allowed) {
    return NextResponse.json(
      { error: "Incorrect admin password." },
      { status: 401 }
    );
  }

  const next = body?.pricing;
  const s = next?.settings;
  if (
    !s ||
    !wholeNumber(s.basePriceKes, 100_000_000) ||
    !(typeof s.fxRate === "number" && s.fxRate > 0 && s.fxRate <= 10_000) ||
    !(
      typeof s.intlMultiplier === "number" &&
      s.intlMultiplier > 0 &&
      s.intlMultiplier <= 20
    ) ||
    !wholeNumber(s.renewalKes, 10_000_000) ||
    !wholeNumber(s.bookedWeeks, 52)
  ) {
    return NextResponse.json(
      { error: "Check the base price, exchange rate, multiplier and booked weeks." },
      { status: 400 }
    );
  }

  const current = await getPricing();
  const modules: Pricing["modules"] = {};
  for (const m of MODULES) {
    const incoming = next.modules?.[m.id];
    if (incoming && !wholeNumber(incoming.priceKes, 100_000_000)) {
      return NextResponse.json(
        { error: `Invalid price for ${m.name}.` },
        { status: 400 }
      );
    }
    modules[m.id] = {
      priceKes: incoming?.priceKes ?? current.modules[m.id].priceKes,
      enabled:
        typeof incoming?.enabled === "boolean"
          ? incoming.enabled
          : current.modules[m.id].enabled,
    };
  }

  const saved = await savePricing({
    settings: {
      basePriceKes: s.basePriceKes,
      fxRate: s.fxRate,
      intlMultiplier: s.intlMultiplier,
      renewalKes: s.renewalKes,
      bookedWeeks: s.bookedWeeks,
    },
    modules,
  });
  return NextResponse.json({ pricing: saved });
});
