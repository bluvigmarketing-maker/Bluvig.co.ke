import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroScroller } from "@/components/home/hero-story";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-[#070d1a]">
      <HeroScroller>
        <div className="flex flex-col items-start gap-6">
          <span className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
            Software Studio · Kenya
          </span>
          <h1 className="font-heading text-4xl font-bold text-balance text-white sm:text-5xl lg:text-6xl lg:[@media(max-height:820px)]:text-5xl">
            We Design and Build the Software Your Business Runs On
          </h1>
          <p className="max-w-xl text-lg text-navy-200">
            Custom business systems, web and mobile apps, websites and M-Pesa
            integrations — for businesses in Kenya and around the world.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
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
              className="h-12 border-white/30 bg-transparent px-8 font-semibold text-white hover:bg-white/10"
              render={<Link href="/work">See Our Work</Link>}
            />
          </div>
          <p className="text-sm text-navy-300">
            Need a website?{" "}
            <Link
              href="/quotation"
              className="font-semibold text-gold-300 underline-offset-4 hover:underline"
            >
              See your price in a minute →
            </Link>
          </p>
        </div>
      </HeroScroller>
    </section>
  );
}
