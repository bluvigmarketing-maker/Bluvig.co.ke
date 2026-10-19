"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { PROCESS } from "@/lib/process";
import { Container } from "@/components/site/container";
import { DrawnCheck } from "@/components/site/drawn-check";
import { useLineFill, useScrollReach } from "@/components/site/use-scroll-reach";

/**
 * /process: the five steps on a path that draws with the scroll. Each step
 * switches on when the line reaches it and its deliverables tick off.
 */
export function ProcessPath() {
  const { ref, progress, reached, reduce } = useScrollReach<HTMLOListElement>({
    offset: ["start 60%", "end 60%"],
    stepOffset: 40,
  });
  const fill = useLineFill(progress, "y", reduce);

  return (
    <section className="bg-white py-20">
      <Container className="max-w-4xl">
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[7px] w-0.5 rounded-full bg-navy-100"
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[7px] w-0.5 origin-top rounded-full bg-gold-500"
            style={{ transform: fill }}
          />

          <ol ref={ref} className="relative flex flex-col gap-6">
            {PROCESS.map((step, index) => {
              const on = index < reached;
              return (
                <li
                  key={step.title}
                  data-step
                  className="grid grid-cols-[16px_minmax(0,1fr)] gap-5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 mt-8 size-4 rounded-full border-2 transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                      on
                        ? "scale-100 border-gold-500 bg-gold-500"
                        : "scale-75 border-navy-300 bg-white"
                    )}
                  />
                  <div
                    className={cn(
                      "flex gap-5 rounded-2xl border bg-white p-6 transition-[opacity,border-color,box-shadow] duration-500",
                      on
                        ? "border-gold-300 opacity-100 shadow-sm"
                        : "border-navy-100 opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl transition-[background-color,color] duration-300",
                        on ? "bg-gold-500 text-white" : "bg-gold-100 text-gold-700"
                      )}
                    >
                      <step.icon className="size-6" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                        Step {index + 1}
                      </p>
                      <h2 className="font-heading text-xl font-semibold text-navy-950">
                        {step.title}
                      </h2>
                      <p className="text-navy-700">{step.summary}</p>
                      <ul className="mt-1 flex flex-col gap-1.5">
                        {step.deliverables.map((d, i) => (
                          <li key={d} className="flex gap-2 text-sm text-navy-800">
                            <DrawnCheck on={on} delay={250 + i * 140} className="size-4.5" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
