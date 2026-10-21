import type { ComponentProps } from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { DocView } from "@/lib/invoice/view";

/**
 * The downloadable PDF. Loaded on demand in the browser (never on page load).
 * Measurements are in points and match invoice-preview.tsx one for one.
 */

type Style = Exclude<
  NonNullable<ComponentProps<typeof View>["style"]>,
  readonly unknown[]
>;

const INK = "#0d1726";
const MUTED = "#5b6b82";

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    color: INK,
    lineHeight: 1.4,
  },
  row: { flexDirection: "row" },
  muted: { color: MUTED },
  small: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "right",
  },
});

export function InvoicePdf({ view, title }: { view: DocView; title: string }) {
  const bold = { fontFamily: view.font.pdfBold };
  return (
    <Document
      title={title}
      creator="Bluvig Invoice Generator"
      producer="bluvig.co.ke"
    >
      <Page
        size="A4"
        style={[
          s.page,
          { fontFamily: view.font.pdf },
          view.template === "modern" ? { paddingTop: 0 } : {},
        ]}
      >
        {view.template === "modern" ? (
          <ModernHeader view={view} bold={bold} />
        ) : null}
        {view.template === "classic" ? (
          <ClassicHeader view={view} bold={bold} />
        ) : null}
        {view.template === "minimal" ? (
          <MinimalHeader view={view} bold={bold} />
        ) : null}

        <ItemsTable view={view} bold={bold} />
        <TotalsBlock view={view} bold={bold} />
        <Closing view={view} bold={bold} />

        <Text
          fixed
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1
              ? `${title} · Page ${pageNumber} of ${totalPages}`
              : ""
          }
        />
      </Page>
    </Document>
  );
}

type Part = { view: DocView; bold: Style };

function Logo({ view }: { view: DocView }) {
  if (!view.logo) return null;
  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt
    <Image
      src={view.logo}
      style={{
        height: view.logoHeight,
        maxWidth: 180,
        objectFit: "contain",
        marginBottom: 8,
      }}
    />
  );
}

function Lines({ lines, color = MUTED }: { lines: string[]; color?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <Text key={i} style={{ color }}>
          {line}
        </Text>
      ))}
    </>
  );
}

function Meta({
  view,
  bold,
  color = INK,
  align = "right",
}: Part & { color?: string; align?: "left" | "right" }) {
  return (
    <View style={{ marginTop: 8 }}>
      {view.meta.map((m) => (
        <View
          key={m.label}
          style={[
            s.row,
            {
              justifyContent: align === "right" ? "flex-end" : "flex-start",
              gap: 8,
            },
          ]}
        >
          <Text
            style={{
              color: color === INK ? MUTED : color,
              opacity: color === INK ? 1 : 0.8,
              width: align === "left" ? 58 : undefined,
            }}
          >
            {m.label}
          </Text>
          <Text style={[bold, { color, minWidth: 70, textAlign: align }]}>
            {m.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function BillTo({ view, bold }: Part) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.small}>{view.toLabel}</Text>
      {view.toName ? (
        <Text style={[bold, { fontSize: 10.5 }]}>{view.toName}</Text>
      ) : null}
      <Lines lines={view.toLines} />
    </View>
  );
}

function ClassicHeader({ view, bold }: Part) {
  return (
    <View>
      <View style={[s.row, { justifyContent: "space-between", gap: 20 }]}>
        <View style={{ flex: 1 }}>
          <Logo view={view} />
          {view.fromName ? (
            <Text style={[bold, { fontSize: 13, lineHeight: 1.3 }]}>
              {view.fromName}
            </Text>
          ) : null}
          <Lines lines={view.fromLines} />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              bold,
              {
                fontSize: 24,
                lineHeight: 1.15,
                color: view.brand,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              },
            ]}
          >
            {view.title}
          </Text>
          <Meta view={view} bold={bold} />
        </View>
      </View>
      <View
        style={{
          height: 2,
          backgroundColor: view.brand,
          marginTop: 18,
          marginBottom: 16,
        }}
      />
      <View style={[s.row, { gap: 20, marginBottom: 20 }]}>
        <BillTo view={view} bold={bold} />
        <View
          style={{
            backgroundColor: view.soft,
            borderRadius: 6,
            padding: 12,
            minWidth: 170,
            alignItems: "flex-end",
          }}
        >
          <Text style={s.small}>{view.due.label}</Text>
          <Text
            style={[bold, { fontSize: 16, lineHeight: 1.2, color: view.brand }]}
          >
            {view.due.value}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ModernHeader({ view, bold }: Part) {
  return (
    <View>
      <View
        style={{
          backgroundColor: view.brand,
          marginHorizontal: -40,
          paddingHorizontal: 40,
          paddingTop: 34,
          paddingBottom: 26,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <View style={{ flex: 1 }}>
          {view.logo ? (
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 6,
                padding: 6,
                alignSelf: "flex-start",
                marginBottom: 8,
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
              <Image
                src={view.logo}
                style={{
                  height: view.logoHeight,
                  maxWidth: 170,
                  objectFit: "contain",
                }}
              />
            </View>
          ) : null}
          {view.fromName ? (
            <Text
              style={[
                bold,
                { fontSize: 14, lineHeight: 1.3, color: view.onBrand },
              ]}
            >
              {view.fromName}
            </Text>
          ) : null}
          <Lines lines={view.fromLines} color={view.onBrand} />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              bold,
              { fontSize: 26, lineHeight: 1.15, color: view.onBrand },
            ]}
          >
            {view.title}
          </Text>
          <Meta view={view} bold={bold} color={view.onBrand} />
        </View>
      </View>
      <View style={[s.row, { gap: 20, marginTop: 22, marginBottom: 20 }]}>
        <BillTo view={view} bold={bold} />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={s.small}>{view.due.label}</Text>
          <Text
            style={[bold, { fontSize: 18, lineHeight: 1.2, color: view.brand }]}
          >
            {view.due.value}
          </Text>
        </View>
      </View>
    </View>
  );
}

function MinimalHeader({ view, bold }: Part) {
  return (
    <View>
      <View
        style={[
          s.row,
          {
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
          },
        ]}
      >
        <View>
          <Text
            style={[
              bold,
              { fontSize: 28, lineHeight: 1.15, letterSpacing: -0.5 },
            ]}
          >
            {view.title}
          </Text>
          <View
            style={{
              width: 36,
              height: 3,
              backgroundColor: view.brand,
              marginTop: 8,
            }}
          />
        </View>
        <Logo view={view} />
      </View>
      <View style={[s.row, { gap: 20, marginTop: 24, marginBottom: 22 }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.small}>From</Text>
          {view.fromName ? (
            <Text style={[bold, { fontSize: 10.5 }]}>{view.fromName}</Text>
          ) : null}
          <Lines lines={view.fromLines} />
        </View>
        <BillTo view={view} bold={bold} />
        <View style={{ width: 150 }}>
          <Text style={s.small}>Details</Text>
          <Meta view={view} bold={bold} align="left" />
        </View>
      </View>
    </View>
  );
}

function ItemsTable({ view, bold }: Part) {
  const { columns } = view;
  const headStyle: Style[] =
    view.template === "classic"
      ? [
          {
            backgroundColor: view.brand,
            color: view.onBrand,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 3,
          },
        ]
      : view.template === "modern"
        ? [
            {
              backgroundColor: view.soft,
              color: view.brand,
              paddingVertical: 6,
              paddingHorizontal: 8,
            },
          ]
        : [
            {
              color: MUTED,
              paddingVertical: 5,
              paddingHorizontal: 0,
              borderBottomWidth: 1,
              borderColor: INK,
            },
          ];
  const cellX = view.template === "minimal" ? 0 : 8;
  const headText: Style =
    view.template === "minimal"
      ? { fontSize: 7.5, textTransform: "uppercase", letterSpacing: 0.6 }
      : bold;

  return (
    <View>
      <View style={[s.row, ...headStyle]} fixed>
        {columns.number ? (
          <Text style={[headText, { width: 20 }]}>#</Text>
        ) : null}
        <Text style={[headText, { flex: 1 }]}>Item</Text>
        {columns.qty ? (
          <Text style={[headText, { width: 62, textAlign: "right" }]}>Qty</Text>
        ) : null}
        {columns.qty ? (
          <Text style={[headText, { width: 82, textAlign: "right" }]}>
            Rate
          </Text>
        ) : null}
        {columns.discount ? (
          <Text style={[headText, { width: 42, textAlign: "right" }]}>
            Disc.
          </Text>
        ) : null}
        <Text style={[headText, { width: 92, textAlign: "right" }]}>
          Amount
        </Text>
      </View>
      {view.rows.map((r) => (
        <View
          key={r.key}
          wrap={false}
          style={[
            s.row,
            {
              paddingVertical: 7,
              paddingHorizontal: cellX,
              borderBottomWidth: 0.5,
              borderColor: view.line,
            },
          ]}
        >
          {columns.number ? (
            <Text style={[s.muted, { width: 20 }]}>{r.n}</Text>
          ) : null}
          <View style={{ flex: 1, paddingRight: 8 }}>
            {r.name ? <Text style={bold}>{r.name}</Text> : null}
            {r.description ? (
              <Text style={[s.muted, { fontSize: 8.5 }]}>{r.description}</Text>
            ) : null}
          </View>
          {columns.qty ? (
            <Text style={{ width: 62, textAlign: "right" }}>{r.qty}</Text>
          ) : null}
          {columns.qty ? (
            <Text style={{ width: 82, textAlign: "right" }}>{r.rate}</Text>
          ) : null}
          {columns.discount ? (
            <Text style={{ width: 42, textAlign: "right" }}>{r.discount}</Text>
          ) : null}
          <Text style={[bold, { width: 92, textAlign: "right" }]}>
            {r.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TotalsBlock({ view, bold }: Part) {
  const dueStyle: Style =
    view.template === "classic"
      ? {
          backgroundColor: view.brand,
          color: view.onBrand,
          paddingVertical: 7,
          paddingHorizontal: 8,
          borderRadius: 3,
          marginTop: 4,
        }
      : view.template === "modern"
        ? {
            borderTopWidth: 2,
            borderColor: view.brand,
            color: view.brand,
            paddingTop: 7,
            paddingHorizontal: 8,
            marginTop: 4,
          }
        : {
            borderTopWidth: 1,
            borderColor: INK,
            color: view.brand,
            paddingTop: 7,
            marginTop: 4,
          };
  const px = view.template === "minimal" ? 0 : 8;
  return (
    <View wrap={false} style={[s.row, { marginTop: 12, alignItems: "center" }]}>
      <View style={{ flex: 1, alignItems: "center" }}>
        {view.stamp ? (
          <View
            style={{
              borderWidth: 3,
              borderColor: view.stamp.color,
              borderRadius: 6,
              paddingVertical: 4,
              paddingHorizontal: 14,
              transform: "rotate(-12deg)",
              opacity: 0.8,
            }}
          >
            <Text
              style={[
                bold,
                {
                  fontSize: 24,
                  lineHeight: 1.2,
                  color: view.stamp.color,
                  letterSpacing: 3,
                },
              ]}
            >
              {view.stamp.label}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ width: 250 }}>
        {view.totals.map((t) => (
          <View
            key={t.label}
            style={[
              s.row,
              {
                justifyContent: "space-between",
                paddingVertical: 3,
                paddingHorizontal: px,
              },
            ]}
          >
            <Text style={s.muted}>{t.label}</Text>
            <Text>{t.value}</Text>
          </View>
        ))}
        <View style={[s.row, { justifyContent: "space-between" }, dueStyle]}>
          <Text style={[bold, { fontSize: 11 }]}>{view.due.label}</Text>
          <Text style={[bold, { fontSize: 11 }]}>{view.due.value}</Text>
        </View>
      </View>
    </View>
  );
}

function Closing({ view, bold }: Part) {
  const hasSignature = view.signature || view.signatoryName;
  return (
    <View>
      {view.payment.length ? (
        <View wrap={false} style={{ marginTop: 24 }}>
          <Text style={[s.small, { color: view.brand }]}>How to pay</Text>
          <View style={[s.row, { gap: 10 }]}>
            {view.payment.map((p) => (
              <View
                key={p.title}
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: view.line,
                  borderRadius: 5,
                  padding: 9,
                }}
              >
                <Text style={[bold, { marginBottom: 2 }]}>{p.title}</Text>
                <Lines lines={p.lines} color={INK} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {view.notes || view.terms || hasSignature ? (
        <View
          wrap={false}
          style={[s.row, { gap: 24, marginTop: 22, alignItems: "flex-end" }]}
        >
          <View style={{ flex: 1, gap: 10 }}>
            {view.notes ? (
              <View>
                <Text style={s.small}>Notes</Text>
                <Text>{view.notes}</Text>
              </View>
            ) : null}
            {view.terms ? (
              <View>
                <Text style={s.small}>Terms &amp; conditions</Text>
                <Text style={s.muted}>{view.terms}</Text>
              </View>
            ) : null}
          </View>
          {hasSignature ? (
            <View style={{ width: 160, alignItems: "center" }}>
              {view.signature ? (
                // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt
                <Image
                  src={view.signature}
                  style={{ height: 46, maxWidth: 150, objectFit: "contain" }}
                />
              ) : (
                <View style={{ height: 46 }} />
              )}
              <View
                style={{
                  width: "100%",
                  borderTopWidth: 0.75,
                  borderColor: INK,
                  marginTop: 4,
                  paddingTop: 4,
                  alignItems: "center",
                }}
              >
                {view.signatoryName ? (
                  <Text style={bold}>{view.signatoryName}</Text>
                ) : null}
                <Text style={[s.muted, { fontSize: 8 }]}>
                  {view.signatoryTitle || "Authorised signature"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
