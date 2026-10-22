import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/site";
import { Container } from "@/components/site/container";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { InvoiceGeneratorLoader } from "@/components/invoice/generator-loader";
import { InvoiceCounter } from "@/components/invoice/invoice-counter";
import { SoftwareAd } from "@/components/invoice/software-ad";

const PATH = "/tools/invoice-generator";

export const metadata: Metadata = {
  title: "Free Invoice & Quotation Generator (No Watermark)",
  description:
    "Create professional invoices, quotations, proforma invoices and receipts with your logo and brand colours. Add VAT, M-Pesa Paybill or Till details and download a PDF free, with no watermark and no sign-up.",
  keywords: [
    "free invoice generator Kenya",
    "quotation template Kenya",
    "proforma invoice generator",
    "receipt generator",
    "invoice with M-Pesa paybill",
    "VAT invoice template Kenya",
  ],
  alternates: { canonical: PATH },
};

const FEATURES = [
  {
    title: "Your brand, not ours",
    text: "Upload your logo, pick your colour and choose from three templates and fonts. No watermark, ever.",
  },
  {
    title: "Four document types",
    text: "Invoices, quotations, proforma invoices and receipts. Turn a quote into an invoice in one click.",
  },
  {
    title: "Built for Kenya",
    text: "KES by default, 16% VAT (added or included), KRA PIN fields, and M-Pesa Paybill, Till or Send Money details.",
  },
  {
    title: "Discounts and part payments",
    text: "Discounts per line or on the total, delivery charges, deposits paid and the balance due, worked out for you.",
  },
  {
    title: "Sign and stamp",
    text: "Draw your signature with your finger or upload it, and stamp documents Paid, Unpaid or Draft.",
  },
  {
    title: "Remembers your business",
    text: "Your details, clients and items are saved in your browser, with numbering that continues from your last document.",
  },
];

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. Make as many invoices, quotations and receipts as you like and download them as PDFs. There's no watermark, no sign-up and no trial period.",
  },
  {
    q: "Where are my invoices stored?",
    a: "Only in your own browser, on your device. Nothing you type or upload is sent to Bluvig. Use the same browser to find your saved documents again; clearing your browsing data removes them.",
  },
  {
    q: "Is this a KRA eTIMS invoice?",
    a: "No. Documents made here are not sent to KRA. If your business must issue eTIMS invoices, issue your tax invoices through eTIMS. You can still use this tool for quotations, proformas and receipts. If you want your own system connected to eTIMS, we build that as part of our custom business software.",
  },
  {
    q: "Can I add VAT?",
    a: "Yes. VAT at 16% is set by default and you can change the rate or name. Turn on 'Prices already include tax' if your prices are VAT-inclusive, and untick VAT on any item that is exempt.",
  },
  {
    q: "How do I send it on WhatsApp or email?",
    a: "Download the PDF, then attach it to a WhatsApp chat or an email like any other file.",
  },
  {
    q: "Can I turn a quotation into an invoice?",
    a: "Yes. Open the quotation, choose New, then 'Convert to invoice'. The items and client details are copied, and the quotation number is kept as the reference.",
  },
];

export default function InvoiceGeneratorPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Bluvig Invoice & Quotation Generator",
              url: `${SITE.url}${PATH}`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any (web browser)",
              offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
              provider: { "@id": `${SITE.url}/#organization` },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />

      <div className="bg-navy-950 pt-12 pb-10 text-white sm:pt-16">
        <Container className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex flex-col items-start gap-4">
            <nav aria-label="Breadcrumb" className="text-xs text-navy-300">
              <Link href="/tools" className="hover:text-white">
                Tools
              </Link>{" "}
              / Invoice Generator
            </nav>
            <h1 className="font-heading text-4xl font-bold text-balance sm:text-5xl">
              Free Invoice &amp; Quotation Generator
            </h1>
            <p className="max-w-2xl text-navy-100">
              Professional invoices, quotations, proformas and receipts with
              your logo, colours and M-Pesa details. Download the PDF free, with
              no watermark and no sign-up.
            </p>
          </div>
          <InvoiceCounter />
        </Container>
      </div>

      <section className="bg-navy-50 pt-6 pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <InvoiceGeneratorLoader />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <SoftwareAd />
        </Container>
      </section>

      <section className="bg-navy-50 py-16 sm:py-20">
        <Container className="flex flex-col gap-10">
          <SectionHeading title="Everything a Professional Invoice Needs" />
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-2 border-t border-navy-200 pt-4"
              >
                <h3 className="font-semibold text-navy-950">{f.title}</h3>
                <p className="text-sm leading-relaxed text-navy-700">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="flex max-w-3xl flex-col gap-8">
          <SectionHeading title="Questions" />
          <div className="flex flex-col divide-y divide-navy-100 rounded-2xl border border-navy-100">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-950 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-gold-600 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
          <p className="text-sm text-navy-700">
            Need invoicing that runs itself, connected to your stock, M-Pesa and
            eTIMS?{" "}
            <Link
              href="/services/custom-software"
              className="font-semibold text-gold-700 underline-offset-4 hover:underline"
            >
              See our custom business software
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
