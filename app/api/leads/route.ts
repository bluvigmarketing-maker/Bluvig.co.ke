import { NextResponse } from "next/server";

import { INDUSTRY_BY_ID } from "@/lib/estimator/catalog";
import { addLead } from "@/lib/leads";
import { cleanMaterials } from "@/lib/materials";
import {
  BEST_TIMES,
  isBestTime,
  isBudgetBand,
  isTimeline,
  qualify,
  TIMELINES,
} from "@/lib/qualify";
import { withStorageErrors } from "@/lib/storage-errors";

const text = (value: unknown, max = 200) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

export const POST = withStorageErrors(async (request: Request) => {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  // Honeypot: real visitors never fill this hidden field.
  if (text(body.website)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = text(body.name, 100);
  const email = text(body.email, 200);
  const phone = text(body.phone, 40);

  // Call-back request from the Get Started wizard.
  if (body.kind === "callback") {
    const industry = INDUSTRY_BY_ID.get(text(body.industry, 40));
    const band = body.budgetBand;
    const timeline = body.timeline;
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Please add your name and a phone number we can call." },
        { status: 400 }
      );
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "That email address doesn't look right." },
        { status: 400 }
      );
    }
    if (!industry || !isBudgetBand(band) || !isTimeline(timeline)) {
      return NextResponse.json(
        { error: "Please answer the industry, budget and timeline questions." },
        { status: 400 }
      );
    }
    const bestTime = isBestTime(body.bestTime) ? body.bestTime : undefined;
    const qualification = qualify(band, timeline);

    const lead = await addLead({
      kind: "callback",
      name,
      email,
      phone,
      businessType: industry.name,
      goal: "Call back",
      budget: text(body.budgetLabel, 60),
      message: text(body.message, 1000),
      industry: industry.id,
      location: body.location === "international" ? "international" : "kenya",
      budgetBand: band,
      timeline: TIMELINES.find((t) => t.id === timeline)!.label,
      bestTime: bestTime
        ? BEST_TIMES.find((t) => t.id === bestTime)!.label
        : undefined,
      materials: cleanMaterials(body.materials),
      qualification,
    });
    return NextResponse.json(
      { ok: true, id: lead.id, qualification },
      { status: 201 }
    );
  }

  // Legacy single-page form.
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }
  const lead = await addLead({
    name,
    email,
    phone,
    businessType: text(body.businessType),
    goal: text(body.goal),
    budget: text(body.budget),
    message: text(body.message, 2000),
  });
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
});
