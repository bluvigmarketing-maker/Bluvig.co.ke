"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { PROCESS } from "@/lib/process";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { useLineFill, useScrollReach } from "@/components/site/use-scroll-reach";

/**
 * Home page snapshot of /process, as a project timeline: a line runs through
 * the five steps with the scroll (across on desktop, down on smaller
 * screens) and each step switches on as the project "reaches" it.
 */
export function Process() {
  const { ref, progress, reached, reduce } = useScrollReach<HTMLOListElement>({
    offset: ["start 80%", "end 55%"],
    mode: "even",
  });
  const across = useLineFill(progress, "x", reduce);
  const down = useLineFill(progress, "y", reduce);

  return (
    <section className="bg-navy-950 py-20 text-white">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          dark
          eyebrow="How We Work"
          title="No Surprises, From First Call to Launch"
          description="You see the product before we build it, watch it come together in short milestones, and know the price up front."
        />

        <div className="relative">
          {/* Desktop: the line runs across the top of the row. */}
          <div aria-hidden="true" className="relative mb-5 hidden h-4 lg:block">
            <span className="absolute inset-x-[10%] top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-navy-800" />
            <motion.span
              className="absolute inset-x-[10%] top-1/2 h-0.5 origin-left -translate-y-1/2 rounded-full bg-gold-400"
              style={{ transform: across }}
            />
            <div className="relative grid h-full grid-cols-5 gap-4">
              {PROCESS.map((step, index) => (
                <span
                  key={step.title}
                  className={cn(
                    "mx-auto size-4 rounded-full border-2 transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    index < reached
                      ? "scale-100 border-gold-400 bg-gold-400"
                      : "scale-75 border-navy-600 bg-navy-950"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Smaller screens: it runs down the left. */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[7px] w-0.5 rounded-full bg-navy-800 lg:hidden"
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[7px] w-0.5 origin-top rounded-full bg-gold-400 lg:hidden"
            style={{ transform: down }}
          />

          <ol ref={ref} className="relative grid gap-4 lg:grid-cols-5">
            {PROCESS.map((step, index) => {
              const on = index < reached;
              return (
                <li
                  key={step.title}
                  data-step
                  className="grid grid-cols-[16px_minmax(0,1fr)] gap-4 lg:block"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 mt-6 size-4 rounded-full border-2 transition-[background-color,border-color,transform] duration-300 lg:hidden",
                      on
                        ? "scale-100 border-gold-400 bg-gold-400"
                        : "scale-75 border-navy-600 bg-navy-950"
                    )}
                  />
                  <div
                    className={cn(
                      "flex h-full flex-col gap-3 rounded-2xl border p-5 transition-[opacity,border-color,background-color] duration-500",
                      on
                        ? "border-gold-400/40 bg-navy-900 opacity-100"
                        : "border-navy-800 bg-navy-900/60 opacity-55"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                          on
                            ? "scale-100 bg-gold-400 text-navy-950"
                            : "scale-90 bg-navy-800 text-gold-300"
                        )}
                      >
                        <step.icon className="size-4.5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-semibold text-navy-300">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-navy-200">
                      {step.summary}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <Link
          href="/process"
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-200"
        >
          How we work, step by step
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  );
}
