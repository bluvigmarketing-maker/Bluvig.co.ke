import type { Metadata } from "next";
import { Globe2, Handshake, Wrench } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Trust } from "@/components/home/trust";
import { FinalCta } from "@/components/home/final-cta";

const VALUES = [
  {
    icon: Wrench,
    title: "Software That Gets Used",
    description:
      "We measure success by whether your team and customers actually use what we build — not by how many features we ship.",
  },
  {
    icon: Globe2,
    title: "Built in Kenya, Ready for the World",
    description:
      "M-Pesa, eTIMS and how Kenyan customers buy are second nature to us — and we build to the same standard for clients abroad.",
  },
  {
    icon: Handshake,
    title: "Straight Talk",
    description:
      "Clear prices, honest advice (including when you don't need custom software), and no jargon.",
  },
];

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bluvig is a software studio in Kenya that designs and builds custom business software, web and mobile apps, websites and M-Pesa integrations.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="A Software Studio in Kenya"
        description="We design and build the software businesses run on — and stay around to keep it running."
      />

      <section className="bg-white py-20">
        <Container className="flex flex-col gap-14">
          <AnimatedSection className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
            <SectionHeading
              align="center"
              eyebrow="Our Story"
              title="From Getting Businesses Found to Building What They Run On"
              description="Bluvig started by helping Kenyan businesses get found online — websites, SEO and digital marketing. Along the way our clients kept asking for more: online shops, booking systems, M-Pesa payments, tools for their teams. Today we're a software studio first, building custom systems, web and mobile apps and websites for businesses in Kenya and abroad — and we still make sure what we build gets found."
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

      <Trust />
      <FinalCta />
    </>
  );
}
