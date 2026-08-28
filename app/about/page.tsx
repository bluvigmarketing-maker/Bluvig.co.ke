import type { Metadata } from "next";
import { Globe2, ShieldCheck, Target } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { FinalCta } from "@/components/home/final-cta";

const VALUES = [
  {
    icon: Target,
    title: "Cash Flow, Not Vanity Metrics",
    description:
      "We measure our work against enquiries, leads, and revenue — not just impressions or follower counts.",
  },
  {
    icon: Globe2,
    title: "Built for Kenya, Ready for the Region",
    description:
      "Local search behavior, payment habits (like M-Pesa), and customer psychology inform everything we build.",
  },
  {
    icon: ShieldCheck,
    title: "No Cookie-Cutter Playbooks",
    description:
      "Every engagement starts with a real audit of your business, not a template pulled off the shelf.",
  },
];

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bluvig is an AI-powered digital marketing agency in Kenya, helping businesses get found, trusted, and remembered online.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Bluvig"
        title="We Build Cash Flow, Not Vanity Metrics"
        description="An AI-powered digital marketing agency helping Kenyan businesses get found, trusted, and remembered online."
      />

      <section className="bg-white py-20">
        <Container className="flex flex-col gap-14">
          <AnimatedSection className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
            <SectionHeading
              align="center"
              eyebrow="Our Mission"
              title="Getting Kenyan Businesses Found — Everywhere Customers Look"
              description="Many businesses think website design is everything. It isn't. The money is in showing up where your customers are searching — on Google, AI tools like ChatGPT, and social platforms. We never stop optimizing until your business stands out from the competition and dominates the first page of Google."
            />
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 0.05}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                    <value.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-base font-semibold text-navy-950">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-navy-700">
                    {value.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
