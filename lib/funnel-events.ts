/**
 * Conversion events counted per day for the cockpit's Insights page.
 * Shared by the browser (sends client events) and the server (validates).
 */
export const FUNNEL_EVENTS = [
  { id: "quote_started", label: "Quotation started", client: true },
  { id: "quote_priced", label: "Saw their price", client: true },
  { id: "quote_submitted", label: "Quotation submitted", client: false },
  { id: "callback_started", label: "Call-back started", client: true },
  { id: "callback_submitted", label: "Call-back submitted", client: false },
  { id: "whatsapp_click", label: "WhatsApp clicked", client: true },
  { id: "whatsapp_brief", label: "Sent a brief on WhatsApp", client: true },
  { id: "invoice_downloaded", label: "Invoice tool: PDF downloaded", client: true },
  { id: "invoice_ad_click", label: "Invoice tool: software ad clicked", client: true },
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number]["id"];

export function isClientEvent(value: unknown): value is FunnelEvent {
  return FUNNEL_EVENTS.some((e) => e.client && e.id === value);
}

/** Where a visitor came from — captured on their first page view. */
export interface Attribution {
  source: string;
  medium?: string;
  campaign?: string;
  landing?: string;
}
