import type { Metadata } from "next";
import { Check, MessageCircle } from "lucide-react";

import { PROCESS } from "@/lib/process";
import { SITE } from "@/lib/site";
import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Trust } from "@/components/home/trust";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "Discover, design, build, launch, support: how Bluvig runs software projects — fixed quotes, a prototype before code, and progress you can follow.",
  alternates: { canonical: "/process" },
};

const COMMUNICATION = [
  "One point of contact who knows your project",
  "WhatsApp, email or video calls — whatever suits you",
  `Working hours on ${SITE.timezone}, with overlap for European and Middle East clients`,
  "A live project tracker showing each phase and what we're waiting on",
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="How We Work"
        title="Clear Steps, No Surprises"
        description="Every project follows the same five steps. You always know what's happening, what it costs, and what comes next."
      />

      <section className="bg-white py-20">
        <Container className="flex max-w-4xl flex-col gap-6">
          {PROCESS.map((step, index) => (
            <AnimatedSection key={step.title} delay={index * 0.04}>
              <div className="flex gap-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                    Step {index + 1}
                  </p>
                  <h2 className="font-heading text-xl font-semibold text-navy-950">
                    {step.title}
                  </h2>
                  <p className="text-navy-700">{step.summary}</p>
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {step.deliverables.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2 text-sm text-navy-800"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-gold-600"
                          aria-hidden="true"
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </Container>
      </section>

      <section className="bg-navy-50 py-20">
        <Container className="flex max-w-4xl flex-col gap-8">
          <AnimatedSection>
            <SectionHeading
              title="How We Keep You in the Loop"
              description="Software projects go wrong when communication does. Here's what you can expect from us."
            />
          </AnimatedSection>
          <ul className="grid gap-3 sm:grid-cols-2">
            {COMMUNICATION.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-navy-100 bg-white p-5 text-sm text-navy-800"
              >
                <MessageCircle
                  className="mt-0.5 size-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Trust />
      <FinalCta />
    </>
  );
}
