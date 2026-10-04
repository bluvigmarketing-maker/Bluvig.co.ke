import {
  Estimator,
  type EstimatorInitial,
} from "@/components/estimator/estimator";
import { INDUSTRY_BY_ID } from "@/lib/estimator/catalog";
import { cleanSelection, type Pricing } from "@/lib/estimator/pricing";
import { getPricing } from "@/lib/estimator/store";
import { describeStorageError } from "@/lib/storage-errors";

// Prices are read live so cockpit edits show up immediately.
export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

/**
 * Optional pre-fill from the budget recommender:
 * /quotation?i=restaurant&m=menu,tables,extra-page:3&loc=ke
 */
function parseInitial(
  params: Record<string, string | string[] | undefined>,
  pricing: Pricing
) {
  const industryId = typeof params.i === "string" ? params.i : "";
  if (!INDUSTRY_BY_ID.has(industryId)) return undefined;
  const raw = typeof params.m === "string" ? params.m : "";
  const requested = Object.fromEntries(
    raw
      .split(",")
      .filter(Boolean)
      .map((entry) => {
        const [id, qty] = entry.split(":");
        return [id, Number(qty ?? 1) || 1];
      })
  );
  const initial: EstimatorInitial = {
    industryId,
    selection: cleanSelection(requested, pricing),
  };
  if (params.loc === "ke") initial.inKenya = true;
  if (params.loc === "intl") initial.inKenya = false;
  return initial;
}

export default async function QuotationPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  let pricing: Pricing | null = null;
  let error: string | null = null;
  try {
    pricing = await getPricing();
  } catch (e) {
    console.error("[quotation]", e);
    error = describeStorageError(e);
  }

  if (pricing) {
    return (
      <Estimator
        pricing={pricing}
        initial={parseInitial(await searchParams, pricing)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold text-navy-950">
        Quotations are temporarily unavailable
      </h1>
      <p className="mt-3 text-navy-700">
        Please message us on WhatsApp at +254 700 574 125 and we&rsquo;ll price
        your project directly.
      </p>
      <p className="mt-6 text-xs text-navy-400">{error}</p>
    </div>
  );
}
