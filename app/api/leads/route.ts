import { after, NextResponse } from "next/server";

import { INDUSTRY_BY_ID } from "@/lib/estimator/catalog";
import { cleanAttribution, recordEvent } from "@/lib/funnel";
import { addLead } from "@/lib/leads";
import { cleanMaterials } from "@/lib/materials";
import { notifyNewLead } from "@/lib/notify";
import {
  BEST_TIMES,
  isBestTime,
  isBudgetBand,
  isTimeline,
  qualify,
  TIMELINES,
} from "@/lib/qualify";
import { allow, tooManyRequests } from "@/lib/rate-limit";
import { withStorageErrors } from "@/lib/storage-errors";
import { isSystemKind, MIN_BRIEF, SYSTEM_KINDS } from "@/lib/system-flow";
import { visitorInKenya } from "@/lib/visitor-location";

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

  // App or business system brief: described in full, for a discovery call.
  if (body.kind === "system") {
    const brief = text(body.message, 4000);
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
    if (!isSystemKind(body.systemKind)) {
      return NextResponse.json(
        { error: "Please choose what you need built." },
        { status: 400 }
      );
    }
    if (brief.length < MIN_BRIEF) {
      return NextResponse.json(
        { error: `Please describe your project in full (at least ${MIN_BRIEF} characters).` },
        { status: 400 }
      );
    }
    if (!(await allow("lead", request))) return tooManyRequests();
    const bestTime = isBestTime(body.bestTime) ? body.bestTime : undefined;
    const timeline = isTimeline(body.timeline) ? body.timeline : undefined;

    const lead = await addLead({
      kind: "system",
      name,
      email,
      phone,
      businessType: SYSTEM_KINDS.find((k) => k.id === body.systemKind)!.label,
      goal: "Discovery call",
      budget: "",
      message: brief,
      location:
        ((await visitorInKenya()) ?? body.location !== "international")
          ? "kenya"
          : "international",
      timeline: timeline
        ? TIMELINES.find((t) => t.id === timeline)!.label
        : undefined,
      bestTime: bestTime
        ? BEST_TIMES.find((t) => t.id === bestTime)!.label
        : undefined,
      materials: cleanMaterials(body.materials),
      source: cleanAttribution(body.attribution),
    });
    after(async () => {
      await recordEvent("callback_submitted");
      await notifyNewLead(lead, new URL(request.url).origin);
    });
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  }

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
    if (!(await allow("lead", request))) return tooManyRequests();
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
      location:
        ((await visitorInKenya()) ?? body.location !== "international")
          ? "kenya"
          : "international",
      budgetBand: band,
      timeline: TIMELINES.find((t) => t.id === timeline)!.label,
      bestTime: bestTime
        ? BEST_TIMES.find((t) => t.id === bestTime)!.label
        : undefined,
      materials: cleanMaterials(body.materials),
      qualification,
      source: cleanAttribution(body.attribution),
    });
    after(async () => {
      await recordEvent("callback_submitted");
      await notifyNewLead(lead, new URL(request.url).origin);
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
  if (!(await allow("lead", request))) return tooManyRequests();
  const lead = await addLead({
    name,
    email,
    phone,
    businessType: text(body.businessType),
    goal: text(body.goal),
    budget: text(body.budget),
    message: text(body.message, 2000),
    source: cleanAttribution(body.attribution),
  });
  after(() => notifyNewLead(lead, new URL(request.url).origin));
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
});
