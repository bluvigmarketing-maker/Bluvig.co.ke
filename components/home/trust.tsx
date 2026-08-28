import { Globe2, ShieldCheck, Target, TrendingUp } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";

const POINTS = [
  {
    icon: Target,
    title: "Custom SEO Strategies",
    description:
      "No cookie-cutter playbooks. We run a comprehensive audit first to identify your strengths and hidden opportunities, then maximize your ROI.",
  },
  {
    icon: Globe2,
    title: "Local & Global Reach",
    description:
      "Whether you're targeting customers in Nairobi or expanding into East Africa, our expertise ensures you connect with the right audience.",
  },
  {
    icon: TrendingUp,
    title: "Proven Excellence & Experience",
    description:
      "With over eight years of hard-earned experience helping businesses grow, we don't stop optimizing until your website outperforms the competition.",
  },
  {
    icon: ShieldCheck,
    title: "Real Business Growth",
    description:
      "We build cash flow, not vanity metrics — every campaign is measured against enquiries, leads, and revenue, not just impressions.",
  },
];

export function Trust() {
  return (
    <section className="bg-white py-20">
      <Container className="flex flex-col gap-14">
        <AnimatedSection>
          <SectionHeading
            align="center"
            eyebrow="Why Bluvig"
            title="The Best SEO Company in Kenya"
            description="Are you searching for a partner to dominate search results and drive sustainable growth? Look no further."
          />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2">
          {POINTS.map((point, index) => (
            <AnimatedSection key={point.title} delay={index * 0.05}>
              <div className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <point.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-base font-semibold text-navy-950">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-navy-700">
                    {point.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-wide text-gold-700 uppercase">
            Our Mission
          </span>
          <p className="font-heading mt-3 text-xl text-balance text-navy-950 italic sm:text-2xl">
            &ldquo;We never stop optimizing until your website stands out from
            the competition and dominates the first page of Google.&rdquo;
          </p>
        </AnimatedSection>
      </Container>
    </section>
  );
}
