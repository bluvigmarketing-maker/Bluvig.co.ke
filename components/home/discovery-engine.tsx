import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { SectionHeading } from "@/components/site/section-heading";
import { PillarGrid } from "@/components/home/pillar-grid";

export function DiscoveryEngine() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white">
      <GlowOrbs variant="dark" />
      <Container className="relative z-10 flex flex-col gap-14">
        <AnimatedSection>
          <SectionHeading
            dark
            eyebrow="Introducing the Discovery Engine"
            title="Your Website Works. Your Visibility Needs Work."
            description="Even a stunning website is useless if nobody can find it. We combined SEO, AI optimization, and social content into one system that puts your business in front of the right people — everywhere they look — without you doing the tech work."
          />
        </AnimatedSection>

        <PillarGrid />

        <AnimatedSection className="text-center">
          <p className="font-heading text-xl font-semibold text-gold-300 sm:text-2xl">
            All these = More traffic + Better leads + Clear ROI
          </p>
        </AnimatedSection>
      </Container>
    </section>
  );
}
