import { after, NextResponse } from "next/server";

import { INDUSTRY_BY_ID } from "@/lib/estimator/catalog";
import { buildPackages, matchPackage } from "@/lib/estimator/packages";
import { cleanSelection, type Currency } from "@/lib/estimator/pricing";
import { createEstimate, getPricing } from "@/lib/estimator/store";
import { purchaseOrderLink } from "@/lib/estimator/whatsapp";
import { cleanAttribution, recordEvent } from "@/lib/funnel";
import { cleanMaterials } from "@/lib/materials";
import { notifyNewEstimate } from "@/lib/notify";
import { allow, tooManyRequests } from "@/lib/rate-limit";
import { withStorageErrors } from "@/lib/storage-errors";
import { visitorInKenya } from "@/lib/visitor-location";

const text = (value: unknown, max = 200) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

/** Saves an estimate. Prices are recalculated here from the live price list. */
export const POST = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot: real visitors never fill this hidden field.
  if (text(body.website))
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const industry = INDUSTRY_BY_ID.get(text(body.industry, 40));
  const client = body.client as Record<string, unknown> | undefined;
  const country = text(client?.country, 60) || "Kenya";
  // Currency follows where the visitor is (KES in Kenya, USD elsewhere) —
  // never the browser's choice. Unknown location (local dev): the country typed.
  const inKenya = (await visitorInKenya()) ?? country === "Kenya";
  const currency: Currency = inKenya ? "KES" : "USD";
  const name = text(client?.name, 100);
  const email = text(client?.email, 200);
  const phone = text(client?.phone, 40);

  if (!industry)
    return NextResponse.json(
      { error: "Please choose an industry." },
      { status: 400 }
    );
  if (!name || !phone || (email && !/^\S+@\S+\.\S+$/.test(email))) {
    return NextResponse.json(
      {
        error: email
          ? "That email doesn't look right. Check it or leave it blank."
          : "Please add your name and a WhatsApp number.",
      },
      { status: 400 }
    );
  }

  if (!(await allow("estimate", request))) return tooManyRequests();

  const pricing = await getPricing();
  const selection = cleanSelection(body.selection, pricing);
  const packages = buildPackages(industry, pricing);
  const packageId = matchPackage(packages, selection);
  const estimate = await createEstimate({
    industryId: industry.id,
    industryName: industry.name,
    selection,
    packageName: packages.find((p) => p.id === packageId)?.name,
    currency,
    prototype: Boolean(body.prototype),
    materials: cleanMaterials(body.materials),
    source: cleanAttribution(body.attribution),
    client: {
      name,
      company: text(client?.company, 120),
      email,
      phone,
      country,
      notes: text(client?.notes, 1000),
    },
  });

  const origin = new URL(request.url).origin;
  after(async () => {
    await recordEvent("quote_submitted");
    await notifyNewEstimate(estimate, origin);
  });
  const orderUrl = `${origin}/quotation/order/${estimate.token}`;
  return NextResponse.json(
    {
      token: estimate.token,
      reference: estimate.reference,
      orderUrl,
      pdfUrl: `/api/estimates/${estimate.token}/pdf`,
      whatsappUrl: purchaseOrderLink(estimate, orderUrl),
    },
    { status: 201 }
  );
});
