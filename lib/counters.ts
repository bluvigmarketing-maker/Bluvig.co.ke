import { readDoc, updateDoc } from "@/lib/storage";

/**
 * All-time public counters (the daily funnel counts are pruned after 180
 * days, so they can't give a lifetime total).
 */

const KEY = "counters";

interface CountersDoc {
  invoices?: number;
}

/** The public invoice counter starts here; real downloads are added on top. */
export const INVOICE_COUNT_START = 121;

/** Never throws — a counter must not break the download. */
export async function bumpInvoiceCount() {
  try {
    await updateDoc<CountersDoc, void>(KEY, {}, (doc) => {
      doc.invoices = (doc.invoices ?? 0) + 1;
    });
  } catch (error) {
    console.error("[counters]", error);
  }
}

export async function invoiceCount() {
  try {
    const doc = await readDoc<CountersDoc>(KEY, {});
    return INVOICE_COUNT_START + (doc.invoices ?? 0);
  } catch {
    return INVOICE_COUNT_START;
  }
}
