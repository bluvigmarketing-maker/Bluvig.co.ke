import type { Metadata } from "next";
import { FileSearch, QrCode, Sparkles } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Free Tools",
  description:
    "Free tools from Bluvig — a Readability Checker, QR Baker, and a Visibility Checker for AI-era search.",
};

const TOOLS = [
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
      "Generate M-Pesa payment QR codes for your business — instant, contactless, no app required for your customers.",
  },
  {
    icon: Sparkles,
    title: "Visibility Checker",
    description:
      "See whether your business would actually surface in an AI assistant's answer to a real customer question — not just Google.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Tools"
        title="Tools Built to Make You More Visible"
        description="Free, practical tools — being rebuilt on our new site. Rejoining shortly."
      />
      <section className="bg-white py-20">
        <Container className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, index) => (
            <AnimatedSection key={tool.title} delay={index * 0.05}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <tool.icon className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant="outline" className="gold-line text-navy-800">
                    Coming Soon
                  </Badge>
                </div>
                <h3 className="font-heading text-lg font-semibold text-navy-950">
                  {tool.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-700">
                  {tool.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </Container>
      </section>
    </>
  );
}
