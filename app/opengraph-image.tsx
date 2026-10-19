import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bluvig: software development company in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logo = `data:image/png;base64,${await readFile(
  join(process.cwd(), "public/logo.png"),
  "base64"
)}`;

/** The preview card shown when a Bluvig link is shared on WhatsApp, LinkedIn, X… */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #ffffff 0%, #eaf2fe 100%)",
          color: "#0b1b33",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
        <img src={logo} height={88} style={{ objectFit: "contain", alignSelf: "flex-start" }} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1060 }}>
            We design and build the software your business runs on.
          </div>
          <div style={{ fontSize: 30, color: "#3b5275" }}>
            Custom software · Web & mobile apps · Websites · M-Pesa integrations
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#297aef", fontWeight: 600 }}>
          <span>bluvig.co.ke</span>
          <span>Software studio · Kenya</span>
        </div>
      </div>
    ),
    size
  );
}
