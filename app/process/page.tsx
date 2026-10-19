import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { SITE } from "@/lib/site";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { ProcessPath } from "@/components/site/process-path";
import { SectionHeading } from "@/components/site/section-heading";
import { Trust } from "@/components/home/trust";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "Discover, design, build, launch, support: how Bluvig runs software projects, with fixed quotes, a prototype before code and progress you can follow.",
  alternates: { canonical: "/process" },
};

const COMMUNICATION = [
  "One point of contact who knows your project",
  "WhatsApp, email or video calls, whatever suits you",
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

      <ProcessPath />

      <section className="bg-navy-50 py-20">
        <Container className="flex max-w-4xl flex-col gap-8">
          <div>
            <SectionHeading
              title="How We Keep You in the Loop"
              description="Software projects go wrong when communication does. Here's what you can expect from us."
            />
          </div>
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
