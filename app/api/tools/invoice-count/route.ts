import { NextResponse } from "next/server";

import { invoiceCount } from "@/lib/counters";

/** Public "invoices generated" number for the invoice generator page. */
export async function GET() {
  return NextResponse.json(
    { count: await invoiceCount() },
    {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=15, stale-while-revalidate=60",
      },
    },
  );
}
