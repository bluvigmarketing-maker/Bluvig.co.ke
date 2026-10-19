import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SERVICES } from "@/lib/services";
import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";

export function Services({
  heading = true,
}: {
  /** Off on /services, where the page hero already introduces them. */
  heading?: boolean;
}) {
  return (
    <section className="bg-navy-50 py-20">
      <Container className="flex flex-col gap-12">
        {heading ? (
          <AnimatedSection>
            <SectionHeading
              eyebrow="What We Build"
              title="Software for Every Stage of Your Business"
              description="From your first website to the system your whole company runs on — designed, built and supported by one team."
            />
          </AnimatedSection>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <AnimatedSection key={service.slug} delay={index * 0.05}>
              <Link
                href={`/services/${service.slug}`}
                className={cn(
                  "group flex h-full flex-col gap-4 rounded-2xl p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md",
                  service.supporting
                    ? "border border-dashed border-navy-200 bg-white/70"
                    : index === 0
                      ? "gold-line bg-white"
                      : "border border-navy-100 bg-white"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    index === 0
                      ? "bg-gold-500/15 text-gold-700"
                      : "bg-navy-50 text-navy-600"
                  )}
                >
                  <service.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-navy-950">
                  {service.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-navy-700">
                  {service.summary}
                </p>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                  {service.quote === "instant"
                    ? "See prices"
                    : "Learn more"}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
