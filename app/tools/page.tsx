import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { priceLabel, TOOLS } from "@/lib/tools";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Business Tools",
  description:
    "Practical tools for Kenyan businesses from Bluvig, including a free Invoice & Quotation Generator with no watermark.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tools"
        title="Tools for Kenyan Businesses"
        description="Practical, affordable tools you can use today. Some are free; paid tools show their price up front."
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
                    {tool.href ? priceLabel(tool) : "Coming Soon"}
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
                    Open {tool.short}
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
