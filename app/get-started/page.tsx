import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";

import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { AnimatedSection } from "@/components/site/animated-section";
import { GetStartedForm } from "@/components/get-started/get-started-form";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Tell us about your business and goals — Bluvig will get back to you with a plan to get you found, trusted, and remembered online.",
};

export default function GetStartedPage() {
  return (
    <>
      <PageHero
        eyebrow="Get Started"
        title="Let's Build Your Visibility Engine"
        description="Tell us a bit about your business. We'll come back with a clear, no-jargon plan — not a generic sales pitch."
      />
      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <AnimatedSection>
            <GetStartedForm />
          </AnimatedSection>

          <AnimatedSection
            delay={0.1}
            className="flex flex-col gap-6 rounded-2xl border border-navy-100 bg-navy-50 p-8"
          >
            <h2 className="font-heading text-xl font-semibold text-navy-950">
              Prefer to talk directly?
            </h2>
            <p className="text-sm leading-relaxed text-navy-700">
              Book a free, no-pressure Clarity Call — we&rsquo;ll look at
              where your business shows up today and map out what it takes to
              get found.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+254700574125"
                className="flex items-center gap-2 text-sm font-medium text-navy-900 hover:text-navy-600"
              >
                <Phone className="size-4" aria-hidden="true" />
                +254 700 574 125
              </a>
              <a
                href="mailto:collins@bluvig.co.ke"
                className="flex items-center gap-2 text-sm font-medium text-navy-900 hover:text-navy-600"
              >
                <Mail className="size-4" aria-hidden="true" />
                collins@bluvig.co.ke
              </a>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
