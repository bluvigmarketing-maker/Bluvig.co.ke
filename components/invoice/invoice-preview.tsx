import type { CSSProperties, ReactNode } from "react";

import type { DocView } from "@/lib/invoice/view";

/**
 * Live on-screen preview. Drawn at A4 size in CSS pixels that equal PDF
 * points (595 × 842), so it mirrors invoice-pdf.tsx exactly; the editor
 * scales it to fit.
 */

const INK = "#0d1726";
const MUTED = "#5b6b82";

export const A4 = { width: 595, height: 842 };

const row: CSSProperties = { display: "flex", flexDirection: "row" };
const muted: CSSProperties = { color: MUTED };
const small: CSSProperties = {
  fontSize: 7.5,
  color: MUTED,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 3,
};
const pre: CSSProperties = { whiteSpace: "pre-line" };

export function InvoicePreview({ view }: { view: DocView }) {
  const bold: CSSProperties = { fontWeight: 700 };
  return (
    <div
      style={{
        width: A4.width,
        minHeight: A4.height,
        padding: view.template === "modern" ? "0 40px 48px" : "40px 40px 48px",
        fontFamily: view.font.css,
        fontSize: 9,
        lineHeight: 1.4,
        color: INK,
        background: "#ffffff",
        boxSizing: "border-box",
        overflowWrap: "anywhere",
      }}
    >
      {view.template === "classic" ? (
        <ClassicHeader view={view} bold={bold} />
      ) : null}
      {view.template === "modern" ? (
        <ModernHeader view={view} bold={bold} />
      ) : null}
      {view.template === "minimal" ? (
        <MinimalHeader view={view} bold={bold} />
      ) : null}
      <ItemsTable view={view} bold={bold} />
      <TotalsBlock view={view} bold={bold} />
      <Closing view={view} bold={bold} />
    </div>
  );
}

type Part = { view: DocView; bold: CSSProperties };

function Logo({ view }: { view: DocView }) {
  if (!view.logo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
    <img
      src={view.logo}
      alt="Logo"
      style={{
        height: view.logoHeight,
        maxWidth: 180,
        objectFit: "contain",
        marginBottom: 8,
        display: "block",
      }}
    />
  );
}

function Lines({ lines, color = MUTED }: { lines: string[]; color?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <div key={i} style={{ color }}>
          {line}
        </div>
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
    <div style={{ marginTop: 8 }}>
      {view.meta.map((m) => (
        <div
          key={m.label}
          style={{
            ...row,
            justifyContent: align === "right" ? "flex-end" : "flex-start",
            gap: 8,
          }}
        >
          <span
            style={{
              color: color === INK ? MUTED : color,
              opacity: color === INK ? 1 : 0.8,
              width: align === "left" ? 58 : undefined,
            }}
          >
            {m.label}
          </span>
          <span style={{ ...bold, color, minWidth: 70, textAlign: align }}>
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BillTo({ view, bold }: Part) {
  return (
    <div style={{ flex: 1 }}>
      <div style={small}>{view.toLabel}</div>
      {view.toName ? (
        <div style={{ ...bold, fontSize: 10.5 }}>{view.toName}</div>
      ) : (
        <Placeholder>Client name</Placeholder>
      )}
      <Lines lines={view.toLines} />
    </div>
  );
}

function Placeholder({
  children,
  color = "#b4c0d0",
}: {
  children: ReactNode;
  color?: string;
}) {
  return <div style={{ color, fontStyle: "italic" }}>{children}</div>;
}

function ClassicHeader({ view, bold }: Part) {
  return (
    <div>
      <div style={{ ...row, justifyContent: "space-between", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <Logo view={view} />
          {view.fromName ? (
            <div style={{ ...bold, fontSize: 13, lineHeight: 1.3 }}>
              {view.fromName}
            </div>
          ) : (
            <Placeholder>Your business name</Placeholder>
          )}
          <Lines lines={view.fromLines} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              ...bold,
              fontSize: 24,
              lineHeight: 1.15,
              color: view.brand,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {view.title}
          </div>
          <Meta view={view} bold={bold} />
        </div>
      </div>
      <div
        style={{
          height: 2,
          background: view.brand,
          marginTop: 18,
          marginBottom: 16,
        }}
      />
      <div style={{ ...row, gap: 20, marginBottom: 20 }}>
        <BillTo view={view} bold={bold} />
        <div
          style={{
            background: view.soft,
            borderRadius: 6,
            padding: 12,
            minWidth: 170,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div style={small}>{view.due.label}</div>
          <div
            style={{
              ...bold,
              fontSize: 16,
              lineHeight: 1.2,
              color: view.brand,
            }}
          >
            {view.due.value}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernHeader({ view, bold }: Part) {
  return (
    <div>
      <div
        style={{
          background: view.brand,
          margin: "0 -40px",
          padding: "34px 40px 26px",
          ...row,
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          {view.logo ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 6,
                padding: 6,
                display: "inline-block",
                marginBottom: 8,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL */}
              <img
                src={view.logo}
                alt="Logo"
                style={{
                  height: view.logoHeight,
                  maxWidth: 170,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          ) : null}
          {view.fromName ? (
            <div
              style={{
                ...bold,
                fontSize: 14,
                lineHeight: 1.3,
                color: view.onBrand,
              }}
            >
              {view.fromName}
            </div>
          ) : (
            <Placeholder color={view.onBrand}>Your business name</Placeholder>
          )}
          <Lines lines={view.fromLines} color={view.onBrand} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              ...bold,
              fontSize: 26,
              lineHeight: 1.15,
              color: view.onBrand,
            }}
          >
            {view.title}
          </div>
          <Meta view={view} bold={bold} color={view.onBrand} />
        </div>
      </div>
      <div style={{ ...row, gap: 20, marginTop: 22, marginBottom: 20 }}>
        <BillTo view={view} bold={bold} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div style={small}>{view.due.label}</div>
          <div
            style={{
              ...bold,
              fontSize: 18,
              lineHeight: 1.2,
              color: view.brand,
            }}
          >
            {view.due.value}
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalHeader({ view, bold }: Part) {
  return (
    <div>
      <div
        style={{
          ...row,
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              ...bold,
              fontSize: 28,
              lineHeight: 1.15,
              letterSpacing: -0.5,
            }}
          >
            {view.title}
          </div>
          <div
            style={{
              width: 36,
              height: 3,
              background: view.brand,
              marginTop: 8,
            }}
          />
        </div>
        <Logo view={view} />
      </div>
      <div style={{ ...row, gap: 20, marginTop: 24, marginBottom: 22 }}>
        <div style={{ flex: 1 }}>
          <div style={small}>From</div>
          {view.fromName ? (
            <div style={{ ...bold, fontSize: 10.5 }}>{view.fromName}</div>
          ) : (
            <Placeholder>Your business name</Placeholder>
          )}
          <Lines lines={view.fromLines} />
        </div>
        <BillTo view={view} bold={bold} />
        <div style={{ width: 150 }}>
          <div style={small}>Details</div>
          <Meta view={view} bold={bold} align="left" />
        </div>
      </div>
    </div>
  );
}

function ItemsTable({ view, bold }: Part) {
  const { columns } = view;
  const head: CSSProperties =
    view.template === "classic"
      ? {
          background: view.brand,
          color: view.onBrand,
          padding: "6px 8px",
          borderRadius: 3,
        }
      : view.template === "modern"
        ? { background: view.soft, color: view.brand, padding: "6px 8px" }
        : { color: MUTED, padding: "5px 0", borderBottom: `1px solid ${INK}` };
  const headText: CSSProperties =
    view.template === "minimal"
      ? { fontSize: 7.5, textTransform: "uppercase", letterSpacing: 0.6 }
      : bold;
  const cellX = view.template === "minimal" ? 0 : 8;
  const right: CSSProperties = { textAlign: "right", flexShrink: 0 };

  return (
    <div>
      <div style={{ ...row, ...head }}>
        {columns.number ? (
          <span style={{ ...headText, width: 20, flexShrink: 0 }}>#</span>
        ) : null}
        <span style={{ ...headText, flex: 1 }}>Item</span>
        {columns.qty ? (
          <span style={{ ...headText, ...right, width: 62 }}>Qty</span>
        ) : null}
        {columns.qty ? (
          <span style={{ ...headText, ...right, width: 82 }}>Rate</span>
        ) : null}
        {columns.discount ? (
          <span style={{ ...headText, ...right, width: 42 }}>Disc.</span>
        ) : null}
        <span style={{ ...headText, ...right, width: 92 }}>Amount</span>
      </div>
      {view.rows.length === 0 ? (
        <div
          style={{
            padding: `10px ${cellX}px`,
            borderBottom: `0.5px solid ${view.line}`,
          }}
        >
          <Placeholder>Add your first item</Placeholder>
        </div>
      ) : null}
      {view.rows.map((r) => (
        <div
          key={r.key}
          style={{
            ...row,
            padding: `7px ${cellX}px`,
            borderBottom: `0.5px solid ${view.line}`,
          }}
        >
          {columns.number ? (
            <span style={{ ...muted, width: 20, flexShrink: 0 }}>{r.n}</span>
          ) : null}
          <div style={{ flex: 1, paddingRight: 8, minWidth: 0 }}>
            {r.name ? <div style={bold}>{r.name}</div> : null}
            {r.description ? (
              <div style={{ ...muted, fontSize: 8.5, ...pre }}>
                {r.description}
              </div>
            ) : null}
          </div>
          {columns.qty ? (
            <span style={{ ...right, width: 62 }}>{r.qty}</span>
          ) : null}
          {columns.qty ? (
            <span style={{ ...right, width: 82 }}>{r.rate}</span>
          ) : null}
          {columns.discount ? (
            <span style={{ ...right, width: 42 }}>{r.discount}</span>
          ) : null}
          <span style={{ ...bold, ...right, width: 92 }}>{r.amount}</span>
        </div>
      ))}
    </div>
  );
}

function TotalsBlock({ view, bold }: Part) {
  const due: CSSProperties =
    view.template === "classic"
      ? {
          background: view.brand,
          color: view.onBrand,
          padding: "7px 8px",
          borderRadius: 3,
          marginTop: 4,
        }
      : view.template === "modern"
        ? {
            borderTop: `2px solid ${view.brand}`,
            color: view.brand,
            padding: "7px 8px 0",
            marginTop: 4,
          }
        : {
            borderTop: `1px solid ${INK}`,
            color: view.brand,
            paddingTop: 7,
            marginTop: 4,
          };
  const px = view.template === "minimal" ? 0 : 8;
  return (
    <div style={{ ...row, marginTop: 12, alignItems: "center" }}>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {view.stamp ? (
          <div
            style={{
              border: `3px solid ${view.stamp.color}`,
              borderRadius: 6,
              padding: "4px 14px",
              transform: "rotate(-12deg)",
              opacity: 0.8,
              ...bold,
              fontSize: 24,
              lineHeight: 1.2,
              color: view.stamp.color,
              letterSpacing: 3,
            }}
          >
            {view.stamp.label}
          </div>
        ) : null}
      </div>
      <div style={{ width: 250, flexShrink: 0 }}>
        {view.totals.map((t) => (
          <div
            key={t.label}
            style={{
              ...row,
              justifyContent: "space-between",
              padding: `3px ${px}px`,
            }}
          >
            <span style={muted}>{t.label}</span>
            <span>{t.value}</span>
          </div>
        ))}
        <div style={{ ...row, justifyContent: "space-between", ...due }}>
          <span style={{ ...bold, fontSize: 11 }}>{view.due.label}</span>
          <span style={{ ...bold, fontSize: 11 }}>{view.due.value}</span>
        </div>
      </div>
    </div>
  );
}

function Closing({ view, bold }: Part) {
  const hasSignature = view.signature || view.signatoryName;
  return (
    <div>
      {view.payment.length ? (
        <div style={{ marginTop: 24 }}>
          <div style={{ ...small, color: view.brand }}>How to pay</div>
          <div style={{ ...row, gap: 10 }}>
            {view.payment.map((p) => (
              <div
                key={p.title}
                style={{
                  flex: 1,
                  border: `0.5px solid ${view.line}`,
                  borderRadius: 5,
                  padding: 9,
                }}
              >
                <div style={{ ...bold, marginBottom: 2 }}>{p.title}</div>
                <Lines lines={p.lines} color={INK} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view.notes || view.terms || hasSignature ? (
        <div style={{ ...row, gap: 24, marginTop: 22, alignItems: "flex-end" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {view.notes ? (
              <div>
                <div style={small}>Notes</div>
                <div style={pre}>{view.notes}</div>
              </div>
            ) : null}
            {view.terms ? (
              <div>
                <div style={small}>Terms &amp; conditions</div>
                <div style={{ ...muted, ...pre }}>{view.terms}</div>
              </div>
            ) : null}
          </div>
          {hasSignature ? (
            <div
              style={{
                width: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {view.signature ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-drawn data URL
                <img
                  src={view.signature}
                  alt="Signature"
                  style={{ height: 46, maxWidth: 150, objectFit: "contain" }}
                />
              ) : (
                <div style={{ height: 46 }} />
              )}
              <div
                style={{
                  width: "100%",
                  borderTop: `0.75px solid ${INK}`,
                  marginTop: 4,
                  paddingTop: 4,
                  textAlign: "center",
                }}
              >
                {view.signatoryName ? (
                  <div style={bold}>{view.signatoryName}</div>
                ) : null}
                <div style={{ ...muted, fontSize: 8 }}>
                  {view.signatoryTitle || "Authorised signature"}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
