// Branded blog images as WebP: a 1600×900 cover and horizontal-bar charts.
// SVG drawn here, rasterised by sharp (already installed with Next.js).
import path from "node:path";
import { createRequire } from "node:module";

const C = {
  navy950: "#0d1726",
  navy900: "#172840",
  navy700: "#2e4a70",
  navy500: "#4d75ac",
  navy100: "#e6ecf4",
  navy50: "#f4f7fa",
  blue600: "#0f64db",
  blue400: "#4b90f1",
  blue300: "#71a8f4",
  white: "#ffffff",
};
const SERIF = "Georgia, 'DejaVu Serif', 'Times New Roman', serif";
const SANS = "'Segoe UI', 'DejaVu Sans', Arial, Helvetica, sans-serif";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Greedy word wrap by an approximate character budget. */
function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if ((line + " " + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function toWebp(root, svg, file) {
  const sharp = createRequire(path.join(root, "package.json"))("sharp");
  await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(file);
  return file;
}

/** Cover: navy field, blue rule, kicker, serif title, byline. */
export async function renderCover(root, { title, kicker, author }, file) {
  const W = 1600;
  const H = 900;
  let size = 84;
  let lines = wrap(title, 28);
  if (lines.length > 4) {
    size = 68;
    lines = wrap(title, 36);
  }
  const lineH = size * 1.18;
  const blockH = lines.length * lineH;
  const top = (H - blockH) / 2 + size * 0.35;
  const grid = Array.from({ length: 17 }, (_, i) => i * 100)
    .map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.navy900}" stroke-width="2"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.navy950}"/>
  ${grid}
  <rect x="120" y="${top - size - 70}" width="96" height="6" fill="${C.blue400}"/>
  <text x="120" y="${top - size - 20}" font-family="${SANS}" font-size="30" font-weight="600" letter-spacing="3" fill="${C.blue300}">${esc((kicker || "Insights").toUpperCase())}</text>
  ${lines
    .map(
      (l, i) =>
        `<text x="120" y="${top + i * lineH}" font-family="${SERIF}" font-size="${size}" font-weight="700" fill="${C.white}">${esc(l)}</text>`
    )
    .join("\n  ")}
  <text x="120" y="${H - 90}" font-family="${SANS}" font-size="30" fill="${C.navy100}">${esc(author ? `By ${author}` : "")}</text>
  <text x="${W - 120}" y="${H - 90}" text-anchor="end" font-family="${SANS}" font-size="34" font-weight="700" fill="${C.white}">bluvig<tspan fill="${C.blue400}">.co.ke</tspan></text>
</svg>`;
  return toWebp(root, svg, file);
}

/**
 * Horizontal bar chart. spec = { title, subtitle?, source?, rows: [{ label,
 * value, display? , highlight? }] }. `value` sizes the bar; `display` is the
 * text shown at its end (defaults to the value). Ranges: give `from` and
 * `value` (to) and the bar spans between them.
 */
export async function renderChart(root, spec, file) {
  const W = 1600;
  const rowH = 92;
  const top = spec.subtitle ? 230 : 190;
  const H = top + spec.rows.length * rowH + (spec.source ? 120 : 70);
  const labelW = 520;
  const barX = 120 + labelW;
  // Leave room after the longest bar for its value label (~16px per character at 28px).
  const longestLabel = Math.max(...spec.rows.map((r) => String(r.display ?? r.value).length));
  const barMax = W - barX - 140 - longestLabel * 16;
  const max = Math.max(...spec.rows.map((r) => r.value));
  const rows = spec.rows
    .map((r, i) => {
      const y = top + i * rowH;
      const x0 = barX + ((r.from ?? 0) / max) * barMax;
      const x1 = barX + (r.value / max) * barMax;
      const fill = r.highlight ? C.blue600 : C.navy500;
      const labels = wrap(r.label, 30);
      return `
  <rect x="120" y="${y - 8}" width="${W - 240}" height="${rowH - 14}" rx="10" fill="${i % 2 ? C.white : C.navy50}"/>
  ${labels
    .slice(0, 2)
    .map(
      (l, j) =>
        `<text x="144" y="${y + 40 + (j - (labels.length > 1 ? 0.5 : 0)) * 32}" font-family="${SANS}" font-size="28" font-weight="${r.highlight ? 700 : 500}" fill="${C.navy950}">${esc(l)}</text>`
    )
    .join("")}
  <rect x="${x0}" y="${y + 16}" width="${Math.max(8, x1 - x0)}" height="40" rx="8" fill="${fill}"/>
  <text x="${x1 + 18}" y="${y + 46}" font-family="${SANS}" font-size="28" font-weight="700" fill="${C.navy950}">${esc(r.display ?? r.value)}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.white}"/>
  <rect x="120" y="70" width="80" height="6" fill="${C.blue600}"/>
  <text x="120" y="140" font-family="${SERIF}" font-size="50" font-weight="700" fill="${C.navy950}">${esc(spec.title)}</text>
  ${spec.subtitle ? `<text x="120" y="190" font-family="${SANS}" font-size="28" fill="${C.navy700}">${esc(spec.subtitle)}</text>` : ""}
  ${rows}
  ${spec.source ? `<text x="120" y="${H - 60}" font-family="${SANS}" font-size="24" fill="${C.navy700}">${esc(spec.source)}</text>` : ""}
  <text x="${W - 120}" y="${H - 60}" text-anchor="end" font-family="${SANS}" font-size="26" font-weight="700" fill="${C.navy950}">bluvig<tspan fill="${C.blue600}">.co.ke</tspan></text>
</svg>`;
  return toWebp(root, svg, file);
}
