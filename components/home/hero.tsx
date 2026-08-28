import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-50 via-white to-white py-20 sm:py-28">
      <GlowOrbs variant="light" />
      <Container className="relative z-10 flex flex-col items-center gap-6 text-center">
        <span className="glass-gold w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-gold-700 uppercase">
          The Discovery Engine
        </span>
        <h1 className="font-heading max-w-3xl text-4xl font-bold text-balance text-navy-950 sm:text-5xl lg:text-6xl">
          AI-Powered Digital Marketing Agency in{" "}
          <span className="text-navy-600">Kenya</span> Driving Real Business
          Growth
        </h1>
        <p className="max-w-2xl text-lg text-navy-700">
          Helping Kenyan businesses grow online through AI-driven digital
          marketing, SEO, and high-performance website development.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
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
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-navy-200 px-8 font-semibold text-navy-900"
            render={<Link href="/what-we-do">Explore Services</Link>}
          />
        </div>
        <p className="text-xs text-navy-400">
          It takes a minute to get started.
        </p>
      </Container>
    </section>
  );
}
