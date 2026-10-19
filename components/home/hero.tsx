"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { cn } from "@/lib/utils";
import { Container } from "@/components/site/container";
import { DotMatrix } from "@/components/site/dot-matrix";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP);

const HEADLINE = [
  "We",
  "Design",
  "and",
  "Build",
  "the",
  "Software",
  "Your",
  "Business",
  "Runs",
  "On",
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
      className="relative overflow-hidden bg-white py-20 sm:py-28"
    >
      <DotMatrix variant="light" />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <span
          data-hero-eyebrow
          className="text-xs font-semibold tracking-wide text-gold-700 uppercase"
        >
          Software Studio · Kenya
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
              {word}
            </span>
          ))}
        </h1>
        <p data-hero-sub className="max-w-2xl text-lg text-navy-700">
          Custom business systems, web and mobile apps, websites and M-Pesa
          integrations — for businesses in Kenya and around the world.
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
              className="h-12 border-navy-200 px-8 font-semibold text-navy-900"
              render={<Link href="/work">See Our Work</Link>}
            />
          </MagneticButton>
        </div>
        <p data-hero-note className="text-sm text-navy-500">
          Need a website?{" "}
          <Link
            href="/quotation"
            className="font-semibold text-gold-700 underline-offset-4 hover:underline"
          >
            See your price in a minute →
          </Link>
        </p>
      </Container>
    </section>
  );
}
