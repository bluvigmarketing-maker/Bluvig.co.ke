import { Search, Share2, Sparkles } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { SectionHeading } from "@/components/site/section-heading";

const PILLARS = [
  {
    icon: Search,
    title: "Search Engine Visibility (Google SEO)",
    points: [
      "We fix technical SEO issues so Google can actually understand your site.",
      "We write helpful, keyword-rich content — no fluff, no jargon.",
      "We build topical authority that earns long-term rankings.",
    ],
  },
  {
    icon: Share2,
    title: "Social Media Visibility",
    points: [
      "Your blog content is repurposed into short, scroll-stopping posts.",
      "We keep your brand active where your customers spend time daily.",
      "Content built around your customers' psychology, per platform.",
    ],
  },
  {
    icon: Sparkles,
    title: "AI Assistant Visibility (ChatGPT, Gemini, etc.)",
    points: [
      "We structure content so AI assistants can read and quote your business.",
      'We target real queries like "best digital marketing agency in Kenya."',
      "This gets your business recommended automatically.",
    ],
  },
];

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <AnimatedSection key={pillar.title} delay={index * 0.1}>
              <div className="glass flex h-full flex-col gap-4 rounded-2xl p-6 transition-colors hover:bg-white/10">
                <span className="glass-gold flex size-10 items-center justify-center rounded-xl text-gold-300">
                  <pillar.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {pillar.title}
                </h3>
                <ul className="flex flex-col gap-2 text-sm text-navy-200">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-gold-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center">
          <p className="font-heading text-xl font-semibold text-gold-300 sm:text-2xl">
            All these = More traffic + Better leads + Clear ROI
          </p>
        </AnimatedSection>
      </Container>
    </section>
  );
}
