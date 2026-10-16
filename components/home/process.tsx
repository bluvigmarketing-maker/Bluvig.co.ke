import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PROCESS } from "@/lib/process";
import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { SectionHeading } from "@/components/site/section-heading";

/** Home page snapshot of /process. */
export function Process() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white">
      <GlowOrbs variant="dark" />
      <Container className="relative z-10 flex flex-col gap-12">
        <AnimatedSection>
          <SectionHeading
            dark
            eyebrow="How We Work"
            title="No Surprises, From First Call to Launch"
            description="You see the product before we build it, watch it come together in short milestones, and know the price up front."
          />
        </AnimatedSection>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((step, index) => (
            <AnimatedSection key={step.title} delay={index * 0.06}>
              <li className="glass flex h-full flex-col gap-3 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="glass-gold flex size-9 items-center justify-center rounded-xl text-gold-300">
                    <step.icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-navy-300">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-200">
                  {step.summary}
                </p>
              </li>
            </AnimatedSection>
          ))}
        </ol>

        <AnimatedSection>
          <Link
            href="/process"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-200"
          >
            How we work, step by step
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </AnimatedSection>
      </Container>
    </section>
  );
}
