import { formatMoney } from "@/lib/estimator/pricing";
import type { Estimate } from "@/lib/estimator/store";
import type { Lead } from "@/lib/leads";

/**
 * Emails the owner about new leads and estimates via Resend (resend.com).
 * Needs RESEND_API_KEY and NOTIFY_EMAIL; without them it does nothing.
 * Never throws — a failed email must not lose the lead.
 */

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  );

async function send(subject: string, rows: [string, string][], link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL?.split(",").map((e) => e.trim()).filter(Boolean);
  if (!apiKey || !to?.length) {
    console.info("[notify] RESEND_API_KEY / NOTIFY_EMAIL not set — skipped:", subject);
    return;
  }

  const filled = rows.filter(([, value]) => value);
  const text = [...filled.map(([k, v]) => `${k}: ${v}`), "", `Open: ${link}`].join("\n");
  const html = `<table style="font:14px/1.5 sans-serif;border-collapse:collapse">${filled
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#667;vertical-align:top">${escape(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${escape(v)}</td></tr>`
    )
    .join("")}</table><p style="font:14px sans-serif"><a href="${escape(link)}">Open in the cockpit →</a></p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || "Bluvig Cockpit <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) console.error("[notify]", res.status, await res.text());
  } catch (error) {
    console.error("[notify]", error);
  }
}

const RATING = { hot: "🔥 Hot", warm: "Warm", cold: "Cold" } as const;

export function notifyNewLead(lead: Lead, origin: string) {
  const rating = lead.qualification ? `${RATING[lead.qualification]} ` : "";
  return send(
    `${rating}call-back: ${lead.name} (${lead.businessType || "enquiry"})`,
    [
      ["Name", lead.name],
      ["Phone", lead.phone],
      ["Email", lead.email],
      ["Business", lead.businessType],
      ["Budget", lead.budget],
      ["Launch", lead.timeline ?? ""],
      ["Best time to call", lead.bestTime ?? ""],
      ["Location", lead.location === "international" ? "Outside Kenya" : ""],
      ["Message", lead.message],
    ],
    `${origin}/cockpit`
  );
}

export function notifyNewEstimate(estimate: Estimate, origin: string) {
  const { client, quote } = estimate;
  const total = formatMoney(quote.oneOffTotal, quote.currency);
  const monthly = quote.monthlyTotal
    ? ` + ${formatMoney(quote.monthlyTotal, quote.currency)}/mo`
    : "";
  return send(
    `New quotation ${estimate.reference}: ${client.name} — ${total}`,
    [
      ["Reference", estimate.reference],
      ["Client", [client.name, client.company].filter(Boolean).join(", ")],
      ["WhatsApp", client.phone],
      ["Email", client.email],
      ["Country", client.country],
      ["Project", `${estimate.industryName}${estimate.packageName ? ` · ${estimate.packageName}` : ""}`],
      ["Total", `${total}${monthly}`],
      ["Timeline", `${quote.weeks.min}–${quote.weeks.max} weeks`],
      ["Free prototype", estimate.prototype ? "Yes" : ""],
      ["Notes", client.notes],
    ],
    `${origin}/cockpit/estimates`
  );
}
