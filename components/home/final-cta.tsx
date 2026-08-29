import Link from "next/link";
import { PhoneCall } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white sm:py-24">
      <GlowOrbs variant="dark" />
      <Container className="relative z-10">
        <AnimatedSection
          className="glass mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-3xl p-8 text-center sm:p-14"
        >
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Ready to Become Impossible to Miss Online?
          </h2>
          <p className="text-navy-100">
            Book a free, no-pressure Clarity Call. We&rsquo;ll look at where
            your business shows up today — and map out exactly what it takes
            to get found, trusted, and remembered.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <MagneticButton>
              <Button
                size="lg"
                className="btn-metallic gold-line h-12 px-8 font-semibold"
                render={
                  <Link href="/get-started">
                    <PhoneCall className="size-4" aria-hidden="true" />
                    Book a FREE Clarity Call
                  </Link>
                }
              />
            </MagneticButton>
            <MagneticButton>
              <Button
                size="lg"
                variant="outline"
                className="glass-gold h-12 px-8 font-semibold text-white hover:bg-white/10"
                render={
                  <Link href="/what-we-do">
                    What is &ldquo;Discovery Engine&rdquo;?
                  </Link>
                }
              />
            </MagneticButton>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
