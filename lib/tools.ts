import { ReceiptText, type LucideIcon } from "lucide-react";

/**
 * Every Bluvig tool, free or paid. Drives /tools, the header menu and the
 * footer. A tool without `href` is shown as "Coming soon".
 */
export interface Tool {
  title: string;
  /** Menu / footer label. */
  short: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  /** "free", or a paid tool's price label, e.g. "From KES 200". */
  price: "free" | { label: string };
}

export const TOOLS: Tool[] = [
  {
    title: "Invoice & Quotation Generator",
    short: "Invoice & Quote Generator",
    description:
      "Branded invoices, quotations, proformas and receipts with VAT and M-Pesa details. Free PDF download, no watermark, no sign-up.",
    icon: ReceiptText,
    href: "/tools/invoice-generator",
    price: "free",
  },
];

export function priceLabel(tool: Tool) {
  return tool.price === "free" ? "Free" : tool.price.label;
}

/** Tools people can use today — for the menu and footer. */
export const LIVE_TOOLS = TOOLS.filter((t) => t.href).map((t) => ({
  label: t.short,
  href: t.href!,
}));
