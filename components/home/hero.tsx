"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { cn } from "@/lib/utils";
import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP);

const HEADLINE = [
  "AI-Powered",
  "Digital",
  "Marketing",
  "Agency",
  "in",
  "Kenya",
  "Driving",
  "Real",
  "Business",
  "Growth",
];

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from("[data-hero-eyebrow]", { y: -12, autoAlpha: 0, duration: 0.5 })
          .from(
            "[data-hero-word]",
            { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.04 },
            "-=0.2"
          )
          .from(
            "[data-hero-sub]",
            { y: 16, autoAlpha: 0, duration: 0.5 },
            "-=0.3"
          )
          .from(
            "[data-hero-cta]",
            { y: 16, autoAlpha: 0, duration: 0.5 },
            "-=0.3"
          )
          .from("[data-hero-note]", { autoAlpha: 0, duration: 0.4 }, "-=0.2");

        return () => {
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-b from-navy-50 via-white to-white py-20 sm:py-28"
    >
      <GlowOrbs variant="light" />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <span
          data-hero-eyebrow
          className="glass-gold w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-gold-700 uppercase"
        >
          The Discovery Engine
        </span>
        <h1 className="font-heading max-w-3xl text-4xl font-bold text-balance text-navy-950 sm:text-5xl lg:text-6xl">
          {HEADLINE.map((word, i) => (
            <span
              key={word + i}
              data-hero-word
              className={cn(
                "inline-block",
                i < HEADLINE.length - 1 && "mr-[0.28em]"
              )}
            >
              {word === "Kenya" ? (
                <span className="relative inline-block text-navy-600">
                  {word}
                  <span
                    aria-hidden="true"
                    className="text-underline-sweep absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full"
                  />
                </span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>
        <p data-hero-sub className="max-w-2xl text-lg text-navy-700">
          Helping Kenyan businesses grow online through AI-driven digital
          marketing, SEO, and high-performance website development.
        </p>
        <div
          data-hero-cta
          className="flex flex-col gap-3 pt-2 sm:flex-row"
        >
          <MagneticButton>
            <Button
              size="lg"
              className="btn-metallic gold-line h-12 px-8 font-semibold"
              render={
                <Link href="/get-started">
                  Get Started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </MagneticButton>
          <MagneticButton>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-navy-200 px-8 font-semibold text-navy-900"
              render={<Link href="/what-we-do">Explore Services</Link>}
            />
          </MagneticButton>
        </div>
        <p data-hero-note className="text-xs text-navy-400">
          It takes a minute to get started.
        </p>
      </Container>
    </section>
  );
}
