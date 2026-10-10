import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { BASE } from "./catalog";
import { formatMoney, PAYMENT_TERMS } from "./pricing";
import type { Estimate } from "./store";

const BLUE = "#2a7cef";
const NAVY = "#0d1726";
const MUTED = "#4d75ac";
const LINE = "#cbd6e7";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9.5, color: NAVY, fontFamily: "Helvetica" },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 2,
  },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", textAlign: "right" },
  muted: { color: MUTED },
  label: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  section: { marginTop: 22 },
  th: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: NAVY,
    paddingBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: LINE,
    paddingVertical: 6,
  },
  colItem: { flex: 1 },
  colQty: { width: 40, textAlign: "right" },
  colPrice: { width: 90, textAlign: "right" },
  colTotal: { width: 95, textAlign: "right" },
  totals: { marginTop: 10, marginLeft: "auto", width: 230 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grand: {
    borderTopWidth: 1,
    borderColor: NAVY,
    marginTop: 4,
    paddingTop: 6,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  box: {
    borderWidth: 0.5,
    borderColor: LINE,
    borderRadius: 4,
    padding: 10,
    flex: 1,
  },
  note: { marginTop: 22, fontSize: 8, color: MUTED, lineHeight: 1.5 },
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InvoiceDocument({
  estimate,
  orderUrl,
}: {
  estimate: Estimate;
  orderUrl: string;
}) {
  const { quote, client } = estimate;
  const money = (n: number) => formatMoney(n, quote.currency);
  const oneOff = quote.lines.filter((l) => !l.monthly);
  const monthly = quote.lines.filter((l) => l.monthly);
  const validUntil = new Date(
    new Date(estimate.createdAt).getTime() + 14 * 86_400_000
  ).toISOString();

  return (
    <Document title={`Proforma ${estimate.reference}`} author="Bluvig">
      <Page size="A4" style={s.page}>
        <View style={s.between}>
          <View>
            <Text style={s.brand}>BLUVIG</Text>
            <Text style={[s.muted, { marginTop: 4 }]}>
              Websites · Web apps · Business software
            </Text>
            <Text style={s.muted}>collins@bluvig.co.ke · +254 700 574 125</Text>
            <Text style={s.muted}>www.bluvig.co.ke · Kenya</Text>
          </View>
          <View>
            <Text style={s.title}>PROFORMA INVOICE</Text>
            <Text style={{ textAlign: "right", marginTop: 4 }}>
              {estimate.reference}
            </Text>
            <Text style={[s.muted, { textAlign: "right" }]}>
              Date: {formatDate(estimate.createdAt)}
            </Text>
            <Text style={[s.muted, { textAlign: "right" }]}>
              Valid until: {formatDate(validUntil)}
            </Text>
          </View>
        </View>

        <View style={[s.section, s.row, { gap: 12 }]}>
          <View style={s.box}>
            <Text style={s.label}>Prepared for</Text>
            <Text style={s.bold}>{client.name}</Text>
            {client.company ? <Text>{client.company}</Text> : null}
            {client.email ? <Text>{client.email}</Text> : null}
            <Text>{client.phone}</Text>
            <Text>{client.country}</Text>
          </View>
          <View style={s.box}>
            <Text style={s.label}>Project</Text>
            <Text style={s.bold}>{estimate.industryName} website</Text>
            <Text>
              Estimated delivery: {quote.weeks.min}–{quote.weeks.max} weeks
            </Text>
            <Text>Currency: {quote.currency}</Text>
            {estimate.prototype ? (
              <Text style={[s.bold, { color: BLUE, marginTop: 4 }]}>
                Free prototype requested first
              </Text>
            ) : null}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.th}>
            <Text style={s.colItem}>Item</Text>
            <Text style={s.colQty}>Qty</Text>
            <Text style={s.colPrice}>Unit price</Text>
            <Text style={s.colTotal}>Amount</Text>
          </View>
          {oneOff.map((line) => (
            <View key={line.id} style={s.tr} wrap={false}>
              <View style={s.colItem}>
                <Text style={s.bold}>{line.name}</Text>
                {line.id === "base" ? (
                  <Text style={[s.muted, { fontSize: 8, marginTop: 2 }]}>
                    {BASE.includes.join(" · ")}
                  </Text>
                ) : null}
              </View>
              <Text style={s.colQty}>{line.quantity}</Text>
              <Text style={s.colPrice}>{money(line.unitPrice)}</Text>
              <Text style={s.colTotal}>{money(line.total)}</Text>
            </View>
          ))}

          <View style={s.totals}>
            <View style={[s.totalRow, s.grand]}>
              <Text>Total (one-off)</Text>
              <Text>{money(quote.oneOffTotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>Deposit ({PAYMENT_TERMS.depositPercent}%)</Text>
              <Text style={s.bold}>{money(quote.deposit)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text>
                Balance on launch ({100 - PAYMENT_TERMS.depositPercent}%)
              </Text>
              <Text>{money(quote.balance)}</Text>
            </View>
            <Text style={[s.muted, { fontSize: 8, marginTop: 2 }]}>
              No VAT charged.
            </Text>
          </View>
        </View>

        {monthly.length ? (
          <View style={s.section}>
            <Text style={s.label}>Monthly care plans (billed separately)</Text>
            {monthly.map((line) => (
              <View key={line.id} style={s.between}>
                <Text>{line.name}</Text>
                <Text>{money(line.total)} / month</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[s.section, s.row, { gap: 12 }]} wrap={false}>
          <View style={s.box}>
            <Text style={s.label}>How to pay</Text>
            <Text>
              M-Pesa Paybill:{" "}
              <Text style={s.bold}>{PAYMENT_TERMS.paybill}</Text>
            </Text>
            <Text>
              Account no: <Text style={s.bold}>{PAYMENT_TERMS.account}</Text>
            </Text>
            <Text style={[s.muted, { marginTop: 3 }]}>
              Use reference {estimate.reference}
            </Text>
          </View>
          <View style={s.box}>
            <Text style={s.label}>Terms</Text>
            <Text>
              {PAYMENT_TERMS.depositPercent}% deposit to start; balance on
              launch.
            </Text>
            <Text>Hosting & domain included for the first year.</Text>
            {quote.renewal ? (
              <Text>Renewal from year 2: {money(quote.renewal)} per year.</Text>
            ) : null}
            <Text>
              You can request a free prototype before paying the deposit.
            </Text>
          </View>
        </View>

        <Text style={s.note}>
          This is a proforma invoice / quotation, not a tax invoice. Prices are
          indicative and are confirmed after a short discovery call; the final
          quote may differ if the scope changes. View this order online:{" "}
          {orderUrl}
        </Text>
      </Page>
    </Document>
  );
}
