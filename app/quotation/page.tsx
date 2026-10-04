import { Estimator } from "@/components/estimator/estimator";
import type { Pricing } from "@/lib/estimator/pricing";
import { getPricing } from "@/lib/estimator/store";
import { describeStorageError } from "@/lib/storage-errors";

// Prices are read live so cockpit edits show up immediately.
export const dynamic = "force-dynamic";

export default async function EstimatePage() {
  let pricing: Pricing | null = null;
  let error: string | null = null;
  try {
    pricing = await getPricing();
  } catch (e) {
    console.error("[estimate]", e);
    error = describeStorageError(e);
  }

  if (pricing) return <Estimator pricing={pricing} />;

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
