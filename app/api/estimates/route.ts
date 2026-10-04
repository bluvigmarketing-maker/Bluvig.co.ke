import { NextResponse } from "next/server";

import { INDUSTRY_BY_ID } from "@/lib/estimator/catalog";
import { cleanSelection, type Currency } from "@/lib/estimator/pricing";
import { createEstimate, getPricing } from "@/lib/estimator/store";
import { purchaseOrderLink } from "@/lib/estimator/whatsapp";
import { cleanMaterials } from "@/lib/materials";
import { withStorageErrors } from "@/lib/storage-errors";

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
  // Currency follows the client's country (spec §4) — never the browser's choice.
  const currency: Currency = country === "Kenya" ? "KES" : "USD";
  const name = text(client?.name, 100);
  const email = text(client?.email, 200);
  const phone = text(client?.phone, 40);

  if (!industry)
    return NextResponse.json(
      { error: "Please choose an industry." },
      { status: 400 }
    );
  if (!name || !phone || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please add your name, a valid email and a phone number." },
      { status: 400 }
    );
  }

  const pricing = await getPricing();
  const estimate = await createEstimate({
    industryId: industry.id,
    industryName: industry.name,
    selection: cleanSelection(body.selection, pricing),
    currency,
    prototype: Boolean(body.prototype),
    materials: cleanMaterials(body.materials),
    client: {
      name,
      company: text(client?.company, 120),
      email,
      phone,
      country,
      notes: text(client?.notes, 1000),
    },
  });

  const orderUrl = `${new URL(request.url).origin}/quotation/order/${estimate.token}`;
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
