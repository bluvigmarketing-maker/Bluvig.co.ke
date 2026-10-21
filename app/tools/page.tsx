import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  QrCode,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Free Tools",
  description:
    "Free tools from Bluvig: an Invoice & Quotation Generator with no watermark, a Readability Checker, QR Baker, and a Visibility Checker for AI-era search.",
  alternates: { canonical: "/tools" },
};

const TOOLS: {
  icon: typeof FileSearch;
  title: string;
  description: string;
  href?: string;
}[] = [
  {
    icon: ReceiptText,
    title: "Invoice & Quotation Generator",
    description:
      "Branded invoices, quotations, proformas and receipts with VAT and M-Pesa details. Free PDF download, no watermark, no sign-up.",
    href: "/tools/invoice-generator",
  },
  {
    icon: FileSearch,
    title: "Readability Checker",
    description:
      "Check how easy your website copy is to read, and get suggestions to make it clearer for both visitors and search engines.",
  },
  {
    icon: QrCode,
    title: "QR Baker",
    description:
      "Generate M-Pesa payment QR codes for your business. Instant, contactless, no app required for your customers.",
  },
  {
    icon: Sparkles,
    title: "Visibility Checker",
    description:
      "See whether your business would actually surface in an AI assistant's answer to a real customer question, as well as on Google.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Tools"
        title="Free Tools for Kenyan Businesses"
        description="Practical tools you can use today, free. More are being rebuilt on our new site."
      />
      <section className="bg-white py-20">
        <Container className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const card = (
              <div
                className={
                  tool.href
                    ? "flex h-full flex-col gap-4 rounded-2xl border border-navy-200 bg-white p-6 shadow-sm transition group-hover:border-gold-400 group-hover:shadow-md"
                    : "flex h-full flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
                }
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <tool.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span
                    className={
                      tool.href
                        ? "text-xs font-semibold tracking-wide text-gold-700 uppercase"
                        : "text-xs font-semibold tracking-wide text-navy-500 uppercase"
                    }
                  >
                    {tool.href ? "Free to use" : "Coming Soon"}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-navy-950">
                  {tool.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-700">
                  {tool.description}
                </p>
                {tool.href ? (
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                    Open the generator
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </div>
            );
            return tool.href ? (
              <Link key={tool.title} href={tool.href} className="group">
                {card}
              </Link>
            ) : (
              <div key={tool.title}>{card}</div>
            );
          })}
        </Container>
      </section>
    </>
  );
}
