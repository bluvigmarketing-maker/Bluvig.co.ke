/**
 * Free invoice & quotation generator (/tools/invoice-generator).
 * Everything runs in the browser: documents, logos and signatures are kept
 * in the visitor's own browser storage and never sent to Bluvig.
 */

export type DocKind = "invoice" | "quote" | "proforma" | "receipt";
export type TemplateId = "classic" | "modern" | "minimal";
export type FontId = "sans" | "serif" | "mono";
export type Stamp = "none" | "paid" | "unpaid" | "draft";

export interface Party {
  name: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  /** KRA PIN (or any tax number abroad). */
  taxId: string;
}

export interface LineItem {
  id: string;
  name: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  /** Line-level discount, in percent. */
  discount: number;
  taxable: boolean;
}

export interface Branding {
  /** PNG data URL, resized on upload. */
  logo: string;
  logoSize: "s" | "m" | "l";
  color: string;
  template: TemplateId;
  font: FontId;
}

export interface Payment {
  mpesa: "none" | "paybill" | "till" | "phone";
  mpesaNumber: string;
  mpesaAccount: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  swift: string;
  other: string;
}

export interface InvoiceDoc {
  id: string;
  kind: DocKind;
  /** Overrides the default title ("Invoice", "Quotation"…) when set. */
  customTitle: string;
  number: string;
  issueDate: string;
  /** Due date (invoice) or valid-until date (quote / proforma). */
  dueDate: string;
  reference: string;
  currency: string;
  decimals: boolean;
  from: Party & { website: string };
  to: Party;
  items: LineItem[];
  discountType: "percent" | "amount";
  discountValue: number;
  taxLabel: string;
  taxRate: number;
  /** Prices already include tax (common for VAT in Kenya). */
  taxInclusive: boolean;
  shipping: number;
  shippingLabel: string;
  amountPaid: number;
  payment: Payment;
  notes: string;
  terms: string;
  signature: string;
  signatoryName: string;
  signatoryTitle: string;
  stamp: Stamp;
  showItemNumbers: boolean;
  showQuantities: boolean;
  branding: Branding;
  updatedAt: string;
}

export const KINDS: {
  id: DocKind;
  label: string;
  title: string;
  prefix: string;
  dueLabel: string | null;
  toLabel: string;
}[] = [
  {
    id: "invoice",
    label: "Invoice",
    title: "Invoice",
    prefix: "INV",
    dueLabel: "Due date",
    toLabel: "Bill to",
  },
  {
    id: "quote",
    label: "Quotation",
    title: "Quotation",
    prefix: "QT",
    dueLabel: "Valid until",
    toLabel: "Prepared for",
  },
  {
    id: "proforma",
    label: "Proforma",
    title: "Proforma Invoice",
    prefix: "PRO",
    dueLabel: "Valid until",
    toLabel: "Bill to",
  },
  {
    id: "receipt",
    label: "Receipt",
    title: "Receipt",
    prefix: "RCT",
    dueLabel: null,
    toLabel: "Received from",
  },
];

export const KIND_BY_ID = new Map(KINDS.map((k) => [k.id, k]));

export const CURRENCIES = [
  "KES",
  "USD",
  "EUR",
  "GBP",
  "UGX",
  "TZS",
  "RWF",
  "ZAR",
  "NGN",
  "AED",
  "INR",
  "CNY",
];

export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

export const FONTS: {
  id: FontId;
  label: string;
  css: string;
  pdf: string;
  pdfBold: string;
}[] = [
  {
    id: "sans",
    label: "Sans",
    css: "Helvetica, Arial, sans-serif",
    pdf: "Helvetica",
    pdfBold: "Helvetica-Bold",
  },
  {
    id: "serif",
    label: "Serif",
    css: "'Times New Roman', Times, serif",
    pdf: "Times-Roman",
    pdfBold: "Times-Bold",
  },
  {
    id: "mono",
    label: "Mono",
    css: "'Courier New', Courier, monospace",
    pdf: "Courier",
    pdfBold: "Courier-Bold",
  },
];

export const FONT_BY_ID = new Map(FONTS.map((f) => [f.id, f]));

export const BRAND_COLORS = [
  "#2a7cef",
  "#0d1726",
  "#0f766e",
  "#15803d",
  "#b45309",
  "#b91c1c",
  "#7c3aed",
  "#be185d",
];

export const LOGO_HEIGHT = { s: 32, m: 46, l: 62 } as const;

export function uid() {
  return (
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
  );
}

export function today(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function blankItem(): LineItem {
  return {
    id: uid(),
    name: "",
    description: "",
    qty: 1,
    unit: "",
    rate: 0,
    discount: 0,
    taxable: true,
  };
}

const EMPTY_PARTY: Party = {
  name: "",
  contact: "",
  address: "",
  email: "",
  phone: "",
  taxId: "",
};

export function blankDoc(kind: DocKind = "invoice"): InvoiceDoc {
  return {
    id: uid(),
    kind,
    customTitle: "",
    number: `${KIND_BY_ID.get(kind)!.prefix}-0001`,
    issueDate: today(),
    dueDate: today(14),
    reference: "",
    currency: "KES",
    decimals: true,
    from: { ...EMPTY_PARTY, website: "" },
    to: { ...EMPTY_PARTY },
    items: [blankItem()],
    discountType: "percent",
    discountValue: 0,
    taxLabel: "VAT",
    taxRate: 16,
    taxInclusive: false,
    shipping: 0,
    shippingLabel: "Delivery",
    amountPaid: 0,
    payment: {
      mpesa: "none",
      mpesaNumber: "",
      mpesaAccount: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankBranch: "",
      swift: "",
      other: "",
    },
    notes: "Thank you for your business.",
    terms: "",
    signature: "",
    signatoryName: "",
    signatoryTitle: "",
    stamp: "none",
    showItemNumbers: true,
    showQuantities: true,
    branding: {
      logo: "",
      logoSize: "m",
      color: BRAND_COLORS[0],
      template: "classic",
      font: "sans",
    },
    updatedAt: new Date().toISOString(),
  };
}

/** A filled-in example so first-time visitors see what the result looks like. */
export function sampleDoc(): InvoiceDoc {
  const doc = blankDoc("invoice");
  return {
    ...doc,
    from: {
      name: "Amani Interiors Ltd",
      contact: "Grace Wanjiru",
      address: "Ngong Road, Kilimani\nNairobi, Kenya",
      email: "hello@amani-interiors.co.ke",
      phone: "+254 712 345 678",
      taxId: "P051234567X",
      website: "amani-interiors.co.ke",
    },
    to: {
      name: "Savannah Coffee House",
      contact: "Brian Otieno",
      address: "Westlands, Nairobi",
      email: "brian@savannahcoffee.co.ke",
      phone: "+254 723 456 789",
      taxId: "",
    },
    items: [
      {
        ...blankItem(),
        name: "Interior design concept",
        description: "Moodboard, layout and 3D renders",
        qty: 1,
        unit: "project",
        rate: 45000,
      },
      {
        ...blankItem(),
        name: "Custom seating",
        description: "Upholstered booth seating",
        qty: 6,
        unit: "pcs",
        rate: 18500,
      },
      {
        ...blankItem(),
        name: "Installation",
        description: "On-site fitting, 2 days",
        qty: 2,
        unit: "days",
        rate: 12000,
      },
    ],
    payment: {
      ...doc.payment,
      mpesa: "paybill",
      mpesaNumber: "522522",
      mpesaAccount: "INV-0001",
    },
    terms: "50% deposit to start. Balance due on installation.",
  };
}

export interface Totals {
  lines: { gross: number; net: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  paid: number;
  balance: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(doc: InvoiceDoc): Totals {
  const lines = doc.items.map((item) => {
    const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const net =
      gross *
      (1 - Math.min(Math.max(Number(item.discount) || 0, 0), 100) / 100);
    return { gross, net };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.net, 0);
  const rawDiscount =
    doc.discountType === "percent"
      ? subtotal * (Math.min(Math.max(doc.discountValue || 0, 0), 100) / 100)
      : Math.max(doc.discountValue || 0, 0);
  const discount = Math.min(rawDiscount, subtotal);
  const factor = subtotal > 0 ? (subtotal - discount) / subtotal : 0;
  const taxableBase = doc.items.reduce(
    (sum, item, i) => (item.taxable ? sum + lines[i].net * factor : sum),
    0,
  );
  const rate = Math.max(doc.taxRate || 0, 0);
  const tax = doc.taxInclusive
    ? (taxableBase * rate) / (100 + rate)
    : (taxableBase * rate) / 100;
  const shipping = Math.max(doc.shipping || 0, 0);
  const total = subtotal - discount + (doc.taxInclusive ? 0 : tax) + shipping;
  const paid =
    doc.kind === "receipt" ? total : Math.max(doc.amountPaid || 0, 0);
  return {
    lines,
    subtotal: round(subtotal),
    discount: round(discount),
    tax: round(tax),
    shipping: round(shipping),
    total: round(total),
    paid: round(paid),
    balance: round(total - paid),
  };
}

export function formatMoney(
  n: number,
  doc: Pick<InvoiceDoc, "currency" | "decimals">,
) {
  const digits = doc.decimals ? 2 : 0;
  const value = n.toLocaleString("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${doc.currency} ${value}`;
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-KE", { maximumFractionDigits: 2 });
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function docTitle(doc: InvoiceDoc) {
  return doc.customTitle.trim() || KIND_BY_ID.get(doc.kind)!.title;
}

/** White or near-black text, whichever reads better on the brand color. */
export function readableOn(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum =
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255);
  return lum > 0.4 ? "#0d1726" : "#ffffff";
}

/** The brand color mixed toward white — for soft table stripes and boxes. */
export function tint(hex: string, amount: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#f4f7fa";
  const n = parseInt(m[1], 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function mpesaLines(p: Payment): string[] {
  if (p.mpesa === "none" || !p.mpesaNumber.trim()) return [];
  if (p.mpesa === "paybill")
    return [
      `Paybill: ${p.mpesaNumber}`,
      ...(p.mpesaAccount ? [`Account: ${p.mpesaAccount}`] : []),
    ];
  if (p.mpesa === "till") return [`Buy Goods Till: ${p.mpesaNumber}`];
  return [
    `Send Money: ${p.mpesaNumber}`,
    ...(p.mpesaAccount ? [`Name: ${p.mpesaAccount}`] : []),
  ];
}

export function bankLines(p: Payment): string[] {
  return [
    p.bankName && `Bank: ${p.bankName}`,
    p.bankAccountName && `Account name: ${p.bankAccountName}`,
    p.bankAccountNumber && `Account no: ${p.bankAccountNumber}`,
    p.bankBranch && `Branch: ${p.bankBranch}`,
    p.swift && `SWIFT: ${p.swift}`,
  ].filter(Boolean) as string[];
}

export function partyLines(p: Party & { website?: string }): string[] {
  return [
    p.contact,
    ...p.address.split("\n"),
    p.phone,
    p.email,
    p.website ?? "",
    p.taxId && `PIN: ${p.taxId}`,
  ].filter((l) => l && l.trim()) as string[];
}

/** Next number in a series: INV-0007 → INV-0008, 2026/14 → 2026/15. */
export function nextNumber(current: string, prefix: string) {
  const m = /^(.*?)(\d+)(\D*)$/.exec(current.trim());
  if (!m) return `${prefix}-0001`;
  const next = String(Number(m[2]) + 1).padStart(m[2].length, "0");
  return `${m[1]}${next}${m[3]}`;
}

/** Swaps INV-/QT-/… when switching kind, but leaves custom numbering alone. */
export function renumberForKind(number: string, kind: DocKind) {
  const prefix = KIND_BY_ID.get(kind)!.prefix;
  for (const k of KINDS) {
    if (number.startsWith(`${k.prefix}-`))
      return `${prefix}-${number.slice(k.prefix.length + 1)}`;
  }
  return number;
}

/** Fills in fields added after a document was saved. */
export function normalizeDoc(raw: unknown): InvoiceDoc | null {
  if (!raw || typeof raw !== "object") return null;
  const base = blankDoc();
  const d = raw as Partial<InvoiceDoc>;
  return {
    ...base,
    ...d,
    from: { ...base.from, ...d.from },
    to: { ...base.to, ...d.to },
    payment: { ...base.payment, ...d.payment },
    branding: { ...base.branding, ...d.branding },
    items:
      Array.isArray(d.items) && d.items.length
        ? d.items.map((i) => ({ ...blankItem(), ...i }))
        : [blankItem()],
  };
}
