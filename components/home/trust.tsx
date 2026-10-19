"use client";

import {
  Eye,
  Globe2,
  KeyRound,
  LifeBuoy,
  Receipt,
  Smartphone,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/site/container";
import { DrawnCheck } from "@/components/site/drawn-check";
import { SectionHeading } from "@/components/site/section-heading";
import { useScrollReach } from "@/components/site/use-scroll-reach";

/** "Working with us" assurances. */
export const ASSURANCES = [
  {
    icon: Eye,
    title: "See It Before You Pay",
    description:
      "Ask for a free prototype first. You click through the direction before you commit a shilling.",
  },
  {
    icon: Receipt,
    title: "Clear, Itemised Prices",
    description:
      "A fixed quote that lists every feature. 60% deposit to start, 40% when we launch — no hidden extras.",
  },
  {
    icon: KeyRound,
    title: "You Own What We Build",
    description:
      "Your code, content, domain and app store listings are yours once the project is paid for. NDA available on request.",
  },
  {
    icon: Smartphone,
    title: "M-Pesa and Local Know-How",
    description:
      "Daraja payments, eTIMS and how Kenyan customers actually buy — built in from day one, not bolted on.",
  },
  {
    icon: Globe2,
    title: "Easy to Work With From Abroad",
    description:
      "We work in English on East Africa Time (UTC+3), which overlaps European and Middle East business hours, and invoice international clients in USD.",
  },
  {
    icon: LifeBuoy,
    title: "Support After Launch",
    description:
      "We don't disappear at go-live. Fixes, hosting, updates and new features, on a plan that suits you.",
  },
];

/**
 * The promises, ticked off as you read them: each card's tick draws itself
 * as the scroll reaches its row.
 */
export function Trust() {
  const { ref, reached } = useScrollReach<HTMLDivElement>({
    offset: ["start 75%", "end 75%"],
    stepOffset: 48,
  });

  return (
    <section className="bg-white py-20">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          align="center"
          eyebrow="Why Bluvig"
          title="A Software Partner You Can Trust"
          description="Software projects fail on trust before they fail on code. This is how we work with every client."
        />

        <div ref={ref} className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ASSURANCES.map((point, index) => {
            const on = index < reached;
            return (
              <div
                key={point.title}
                data-step
                className={cn(
                  "relative flex h-full gap-4 rounded-2xl border bg-white p-6 transition-[border-color,box-shadow] duration-500",
                  on ? "border-gold-300 shadow-sm" : "border-navy-100"
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <point.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5 pr-6">
                  <h3 className="font-heading text-base font-semibold text-navy-950">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-navy-700">
                    {point.description}
                  </p>
                </div>
                <DrawnCheck
                  on={on}
                  delay={(index % 3) * 120}
                  className="absolute top-5 right-5"
                />
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
