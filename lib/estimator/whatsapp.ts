import { formatMoney } from "./pricing";
import type { Estimate } from "./store";

export const BLUVIG_WHATSAPP = "254700574125";

/** wa.me link that opens WhatsApp with the purchase order typed out, ready to send. */
export function purchaseOrderLink(estimate: Estimate, orderUrl: string) {
  const { quote, client } = estimate;
  const modules = quote.lines.filter((l) => l.id !== "base" && !l.monthly);
  const monthly = quote.lines.filter((l) => l.monthly);

  const lines = [
    `*Purchase Order ${estimate.reference}*`,
    `${client.name}${client.company ? ` — ${client.company}` : ""} (${client.country})`,
    `Industry: ${estimate.industryName}`,
    `Package: Standard Website${modules.length ? ` + ${modules.length} module${modules.length > 1 ? "s" : ""}` : ""}`,
    ...modules.map(
      (l) => `• ${l.name}${l.quantity > 1 ? ` ×${l.quantity}` : ""}`
    ),
    `Total: ${formatMoney(quote.oneOffTotal, quote.currency)}`,
    ...(monthly.length
      ? [
          `Monthly: ${formatMoney(quote.monthlyTotal, quote.currency)}/month (${monthly.map((l) => l.name).join(", ")})`,
        ]
      : []),
    estimate.prototype
      ? "I'd like a FREE prototype first before paying the deposit."
      : `Ready to pay the ${formatMoney(quote.deposit, quote.currency)} deposit.`,
    `View order: ${orderUrl}`,
  ];

  return `https://wa.me/${BLUVIG_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}
