import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-navy-950 py-20 text-white sm:py-24">
      <Container>
        <AnimatedSection className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Have Something You Need Built?
          </h2>
          <p className="text-navy-100">
            Tell us about it in a couple of minutes. We&rsquo;ll call you back,
            talk it through, and send a clear, itemised quote — no jargon, no
            pressure.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <MagneticButton>
              <Button
                size="lg"
                className="btn-metallic gold-line h-12 px-8 font-semibold"
                render={
                  <Link href="/get-started">
                    Start Your Project
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                }
              />
            </MagneticButton>
            <MagneticButton>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/40 bg-transparent px-8 font-semibold text-white hover:bg-white/10"
                render={<Link href="/quotation">Price a Website Now</Link>}
              />
            </MagneticButton>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
