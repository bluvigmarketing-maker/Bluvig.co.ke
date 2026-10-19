import { formatMoney } from "@/lib/estimator/pricing";
import type { Estimate } from "@/lib/estimator/store";
import { describeAttribution } from "@/lib/funnel";
import type { Lead } from "@/lib/leads";
import { SITE } from "@/lib/site";

/**
 * Emails via Resend (resend.com):
 * - an alert to the owner on every new lead and estimate (RESEND_API_KEY + NOTIFY_EMAIL),
 * - a confirmation to the prospect, when they gave an email — only once
 *   NOTIFY_FROM uses a domain verified in Resend (the test sender can't
 *   email other people).
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

const ownerEmails = () =>
  process.env.NOTIFY_EMAIL?.split(",")
    .map((e) => e.trim())
    .filter(Boolean) ?? [];

async function deliver(message: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !message.to.length) {
    console.info("[notify] email not configured, skipped:", message.subject);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.NOTIFY_FROM || "Bluvig Cockpit <onboarding@resend.dev>",
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
    });
    if (!res.ok) console.error("[notify]", res.status, await res.text());
  } catch (error) {
    console.error("[notify]", error);
  }
}

/** Owner alert: a key/value table plus a cockpit link. */
function alertOwner(subject: string, rows: [string, string][], link: string) {
  const filled = rows.filter(([, value]) => value);
  return deliver({
    to: ownerEmails(),
    subject,
    text: [...filled.map(([k, v]) => `${k}: ${v}`), "", `Open: ${link}`].join(
      "\n"
    ),
    html: `<table style="font:14px/1.5 sans-serif;border-collapse:collapse">${filled
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#667;vertical-align:top">${escape(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${escape(v)}</td></tr>`
      )
      .join(
        ""
      )}</table><p style="font:14px sans-serif"><a href="${escape(link)}">Open in the cockpit →</a></p>`,
  });
}

/** Prospect confirmation: short paragraphs, signed by Bluvig, replies go to the owner. */
function replyToProspect(
  email: string,
  subject: string,
  paragraphs: string[],
  link?: { href: string; label: string }
) {
  if (!email || !process.env.NOTIFY_FROM) return;
  const signoff = [
    "The Bluvig team",
    `${SITE.phone} · WhatsApp ${SITE.whatsapp.replace("https://", "")}`,
  ];
  const text = [
    ...paragraphs,
    ...(link ? [`${link.label}: ${link.href}`] : []),
    "",
    ...signoff,
  ].join("\n\n");
  const html = `<div style="font:15px/1.6 sans-serif;color:#0b1b33;max-width:560px">${paragraphs
    .map((p) => `<p>${escape(p)}</p>`)
    .join("")}${
    link
      ? `<p><a href="${escape(link.href)}" style="display:inline-block;background:#297aef;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">${escape(link.label)}</a></p>`
      : ""
  }<p style="color:#556">${signoff.map(escape).join("<br>")}</p></div>`;
  return deliver({
    to: [email],
    subject,
    text,
    html,
    replyTo: ownerEmails().slice(0, 1),
  });
}

const RATING = { hot: "🔥 Hot", warm: "Warm", cold: "Cold" } as const;

export async function notifyNewLead(lead: Lead, origin: string) {
  const rating = lead.qualification ? `${RATING[lead.qualification]} ` : "";
  await alertOwner(
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
      ["Came from", lead.source ? describeAttribution(lead.source) : ""],
    ],
    `${origin}/cockpit`
  );
  await replyToProspect(
    lead.email,
    "Bluvig: we've got your request",
    [
      `Hi ${lead.name.split(" ")[0]},`,
      `Thanks for reaching out. We've received your request and someone from Bluvig will call you on ${lead.phone}${lead.bestTime ? ` (${lead.bestTime.toLowerCase()})` : " shortly"} to talk through your project.`,
      "If anything changes in the meantime, just reply to this email or message us on WhatsApp.",
    ]
  );
}

export async function notifyNewEstimate(estimate: Estimate, origin: string) {
  const { client, quote } = estimate;
  const total = formatMoney(quote.oneOffTotal, quote.currency);
  const monthly = quote.monthlyTotal
    ? ` + ${formatMoney(quote.monthlyTotal, quote.currency)}/mo`
    : "";
  await alertOwner(
    `New quotation ${estimate.reference}: ${client.name}, ${total}`,
    [
      ["Reference", estimate.reference],
      ["Client", [client.name, client.company].filter(Boolean).join(", ")],
      ["WhatsApp", client.phone],
      ["Email", client.email],
      ["Country", client.country],
      [
        "Project",
        `${estimate.industryName}${estimate.packageName ? ` · ${estimate.packageName}` : ""}`,
      ],
      ["Total", `${total}${monthly}`],
      ["Timeline", `${quote.weeks.min}–${quote.weeks.max} weeks`],
      ["Free prototype", estimate.prototype ? "Yes" : ""],
      ["Notes", client.notes],
      ["Came from", estimate.source ? describeAttribution(estimate.source) : ""],
    ],
    `${origin}/cockpit/estimates`
  );
  await replyToProspect(
    client.email,
    `Your Bluvig quotation ${estimate.reference}`,
    [
      `Hi ${client.name.split(" ")[0]},`,
      `Thanks for pricing your ${estimate.industryName.toLowerCase()} website with us. Your quotation ${estimate.reference} comes to ${total}${monthly}, with an estimated ${quote.weeks.min}–${quote.weeks.max} weeks to launch.`,
      "Your order page has the full breakdown and the proforma invoice PDF. When you're ready, send the purchase order on WhatsApp from that page, or simply reply to this email with any questions.",
    ],
    {
      href: `${origin}/quotation/order/${estimate.token}`,
      label: "View your quotation",
    }
  );
}
