import {
  bankLines,
  computeTotals,
  docTitle,
  FONT_BY_ID,
  formatDate,
  formatMoney,
  formatNumber,
  KIND_BY_ID,
  LOGO_HEIGHT,
  mpesaLines,
  partyLines,
  readableOn,
  tint,
  type InvoiceDoc,
} from "./model";

/**
 * Everything a template needs, already worked out and formatted. The live
 * HTML preview and the PDF both render from this, so they always agree.
 */
export interface DocView {
  title: string;
  template: InvoiceDoc["branding"]["template"];
  font: { css: string; pdf: string; pdfBold: string };
  brand: string;
  onBrand: string;
  soft: string;
  line: string;
  logo: string;
  logoHeight: number;
  fromName: string;
  fromLines: string[];
  toLabel: string;
  toName: string;
  toLines: string[];
  meta: { label: string; value: string }[];
  columns: { qty: boolean; discount: boolean; number: boolean };
  rows: {
    key: string;
    n: string;
    name: string;
    description: string;
    qty: string;
    rate: string;
    discount: string;
    amount: string;
  }[];
  totals: { label: string; value: string }[];
  due: { label: string; value: string };
  payment: { title: string; lines: string[] }[];
  notes: string;
  terms: string;
  signature: string;
  signatoryName: string;
  signatoryTitle: string;
  stamp: { label: string; color: string } | null;
}

const STAMPS = {
  paid: { label: "PAID", color: "#15803d" },
  unpaid: { label: "UNPAID", color: "#b91c1c" },
  draft: { label: "DRAFT", color: "#64748b" },
} as const;

export function buildView(doc: InvoiceDoc): DocView {
  const kind = KIND_BY_ID.get(doc.kind)!;
  const t = computeTotals(doc);
  const money = (n: number) => formatMoney(n, doc);
  const font = FONT_BY_ID.get(doc.branding.font) ?? FONT_BY_ID.get("sans")!;
  const hasDiscount =
    doc.showQuantities && doc.items.some((i) => (i.discount || 0) > 0);

  const meta = [
    { label: `${kind.label} no.`, value: doc.number },
    {
      label: doc.kind === "receipt" ? "Payment date" : "Date",
      value: formatDate(doc.issueDate),
    },
    ...(kind.dueLabel && doc.dueDate
      ? [{ label: kind.dueLabel, value: formatDate(doc.dueDate) }]
      : []),
    ...(doc.reference.trim()
      ? [{ label: "Reference", value: doc.reference.trim() }]
      : []),
  ].filter((m) => m.value);

  const rows = doc.items
    .filter((i) => i.name.trim() || i.description.trim() || i.rate)
    .map((item, index) => {
      const line = t.lines[doc.items.indexOf(item)];
      return {
        key: item.id,
        n: String(index + 1),
        name: item.name.trim(),
        description: item.description.trim(),
        qty: `${formatNumber(item.qty || 0)}${item.unit.trim() ? ` ${item.unit.trim()}` : ""}`,
        rate: money(item.rate || 0),
        discount: item.discount ? `${formatNumber(item.discount)}%` : "",
        amount: money(line.net),
      };
    });

  const totals: { label: string; value: string }[] = [
    { label: "Subtotal", value: money(t.subtotal) },
  ];
  if (t.discount > 0)
    totals.push({
      label:
        doc.discountType === "percent"
          ? `Discount (${formatNumber(doc.discountValue)}%)`
          : "Discount",
      value: `- ${money(t.discount)}`,
    });
  if (doc.taxRate > 0 && t.tax > 0)
    totals.push({
      label: `${doc.taxLabel.trim() || "Tax"} ${formatNumber(doc.taxRate)}%${doc.taxInclusive ? " (included)" : ""}`,
      value: money(t.tax),
    });
  if (t.shipping > 0)
    totals.push({
      label: doc.shippingLabel.trim() || "Shipping",
      value: money(t.shipping),
    });

  let due: DocView["due"];
  if (doc.kind === "receipt") {
    due = { label: "Amount received", value: money(t.total) };
  } else if (doc.kind === "quote") {
    due = { label: "Total", value: money(t.total) };
  } else if (t.paid > 0) {
    totals.push({ label: "Total", value: money(t.total) });
    totals.push({ label: "Amount paid", value: `- ${money(t.paid)}` });
    due = { label: "Balance due", value: money(t.balance) };
  } else {
    due = {
      label: doc.kind === "proforma" ? "Total" : "Amount due",
      value: money(t.total),
    };
  }

  const payment = [
    { title: "M-Pesa", lines: mpesaLines(doc.payment) },
    { title: "Bank transfer", lines: bankLines(doc.payment) },
    {
      title: "Other",
      lines: doc.payment.other.trim()
        ? doc.payment.other.trim().split("\n")
        : [],
    },
  ].filter((p) => p.lines.length);

  const brand = /^#[0-9a-f]{6}$/i.test(doc.branding.color)
    ? doc.branding.color
    : "#2a7cef";

  return {
    title: docTitle(doc),
    template: doc.branding.template,
    font,
    brand,
    onBrand: readableOn(brand),
    soft: tint(brand, 0.92),
    line: "#dbe3ee",
    logo: doc.branding.logo,
    logoHeight: LOGO_HEIGHT[doc.branding.logoSize] ?? LOGO_HEIGHT.m,
    fromName: doc.from.name.trim(),
    fromLines: partyLines(doc.from),
    toLabel: kind.toLabel,
    toName: doc.to.name.trim(),
    toLines: partyLines(doc.to),
    meta,
    columns: {
      qty: doc.showQuantities,
      discount: hasDiscount,
      number: doc.showItemNumbers,
    },
    rows,
    totals,
    due,
    payment: doc.kind === "receipt" ? [] : payment,
    notes: doc.notes.trim(),
    terms: doc.terms.trim(),
    signature: doc.signature,
    signatoryName: doc.signatoryName.trim(),
    signatoryTitle: doc.signatoryTitle.trim(),
    stamp: doc.stamp === "none" ? null : STAMPS[doc.stamp],
  };
}

/** A safe download name: "Invoice INV-0001 Savannah Coffee House.pdf". */
export function fileName(doc: InvoiceDoc) {
  const parts = [docTitle(doc), doc.number, doc.to.name]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .slice(0, 90);
  return `${parts || "document"}.pdf`;
}
