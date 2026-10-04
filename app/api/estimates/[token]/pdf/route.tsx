import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { InvoiceDocument } from "@/lib/estimator/invoice-pdf";
import { getEstimate } from "@/lib/estimator/store";
import { withStorageErrors } from "@/lib/storage-errors";

export const GET = withStorageErrors(
  async (
    request: Request,
    { params }: { params: Promise<{ token: string }> }
  ) => {
    const { token } = await params;
    const estimate = await getEstimate(token);
    if (!estimate)
      return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const orderUrl = `${new URL(request.url).origin}/estimate/order/${estimate.token}`;
    const pdf = await renderToBuffer(
      <InvoiceDocument estimate={estimate} orderUrl={orderUrl} />
    );

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Bluvig-Proforma-${estimate.reference}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
);
