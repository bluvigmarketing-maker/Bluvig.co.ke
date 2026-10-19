"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  transform as interpolate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { Container } from "@/components/site/container";
import { WhatsAppBrief } from "@/components/site/whatsapp-brief";
import { Button } from "@/components/ui/button";
import { HeroCity } from "@/components/home/hero-city";

/**
 * The closing call to action on every page, and the bookend to the hero:
 * the hero's day ends here. As the section scrolls in, the sun sets over
 * Nairobi and the city lights come on — the business keeps running after
 * hours. Reduced motion shows it at night.
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // 0 as the section enters at the bottom, 1 once its bottom reaches it.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const night = useMotionValue(0);
  // Afternoon → night: the hero's time of day, run backwards.
  const sunset = useTransform(scrollYProgress, (v) =>
    interpolate(v, [0.4, 1], [0.72, 0])
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#070d1a] text-white"
    >
      <HeroCity
        time={reduce ? night : sunset}
        layout="cta"
        className="absolute inset-0"
      />
      <Container className="relative grid gap-10 pt-20 pb-[34svh] sm:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-16 lg:pb-[40svh]">
        <div className="flex flex-col items-start gap-6">
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Have Something You Need Built?
          </h2>
          <p className="max-w-xl text-navy-100">
            Describe it in one message on WhatsApp, or tell us more in a couple
            of minutes. We&rsquo;ll talk it through and send a clear, itemised
            quote — no jargon, no pressure.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
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
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/40 bg-transparent px-8 font-semibold text-white hover:bg-white/10"
              render={<Link href="/quotation">Price a Website Now</Link>}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-navy-950/70 p-5 sm:p-6">
          <WhatsAppBrief tone="dark" />
        </div>
      </Container>
    </section>
  );
}
