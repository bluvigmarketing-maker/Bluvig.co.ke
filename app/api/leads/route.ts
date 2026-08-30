import { NextResponse } from "next/server";

import { addLead, type NewLead } from "@/lib/leads";

export async function POST(request: Request) {
  let body: Partial<NewLead>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

  const lead = addLead({
    name,
    email,
    phone: String(body.phone ?? "").trim(),
    businessType: String(body.businessType ?? "").trim(),
    goal: String(body.goal ?? "").trim(),
    budget: String(body.budget ?? "").trim(),
    message: String(body.message ?? "").trim(),
  });

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
