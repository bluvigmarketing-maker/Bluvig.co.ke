import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { FinalCta } from "@/components/home/final-cta";

export interface ServiceDetailData {
  eyebrow: string;
  title: string;
  heroDescription: string;
  intro: string;
  features: { icon: LucideIcon; title: string; description: string }[];
}

export function ServiceDetail({ data }: { data: ServiceDetailData }) {
  return (
    <>
      <PageHero
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.heroDescription}
      />

      <section className="bg-white py-20">
        <Container className="flex flex-col gap-14">
          <AnimatedSection>
            <SectionHeading
              title="How It Works"
              description={data.intro}
            />
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.05}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-base font-semibold text-navy-950">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-navy-700">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="flex justify-center">
            <Button
              size="lg"
              className="btn-metallic gold-line font-semibold"
              render={
                <Link href="/get-started">
                  Get Started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </AnimatedSection>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
