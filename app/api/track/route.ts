import { NextResponse } from "next/server";

import { recordEvent } from "@/lib/funnel";
import { isClientEvent } from "@/lib/funnel-events";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

/** Counts one browser-side funnel event (see lib/funnel-events.ts). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    event?: unknown;
  } | null;
  if (!isClientEvent(body?.event)) {
    return NextResponse.json({ error: "Unknown event." }, { status: 400 });
  }
  if (!BOT.test(request.headers.get("user-agent") ?? "")) {
    await recordEvent(body.event);
  }
  return new NextResponse(null, { status: 204 });
}
