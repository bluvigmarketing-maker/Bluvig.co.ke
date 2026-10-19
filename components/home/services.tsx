"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { SERVICES } from "@/lib/services";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { useLineFill, useScrollReach } from "@/components/site/use-scroll-reach";
import { SERVICE_SKETCHES } from "@/components/home/service-sketches";

/**
 * The services as a growth path: the order a business usually needs them,
 * from first website to the system the whole company runs on. A line draws
 * down the path with the scroll and each service lights up as the line
 * reaches it. Nothing pins — the page keeps moving.
 */

const GROWTH = [
  { slug: "websites", stage: "Get found online" },
  { slug: "integrations", stage: "Get paid automatically" },
  { slug: "web-applications", stage: "Serve customers online" },
  { slug: "mobile-apps", stage: "Be in their pocket" },
  { slug: "custom-software", stage: "Run the whole business" },
  { slug: "launch-and-grow", stage: "Keep growing" },
];

const PATH = GROWTH.map(({ slug, stage }) => {
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return { service, stage };
});

export function Services({
  heading = true,
}: {
  /** Off on /services, where the page hero already introduces them. */
  heading?: boolean;
}) {
  // 0 when the list's top reaches 60% down the screen, 1 when its bottom does.
  const {
    ref: listRef,
    progress,
    reached: lit,
    reduce,
  } = useScrollReach<HTMLOListElement>({ offset: ["start 60%", "end 60%"] });
  const fill = useLineFill(progress, "y", reduce);

  return (
    <section className="bg-navy-50 py-20 sm:py-24">
      <Container
        className={cn(
          "grid grid-cols-[minmax(0,1fr)] gap-12",
          heading && "lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16"
        )}
      >
        {heading ? (
          <div className="flex flex-col gap-6 self-start lg:sticky lg:top-32">
            <SectionHeading
              eyebrow="What We Build"
              title="Software for Every Stage of Your Business"
              description="From your first website to the system your whole company runs on. Designed, built and supported by one team."
            />
            <p className="text-sm text-navy-600">
              Most clients start with one and add the next when they&rsquo;re
              ready. Everything we build connects to what came before.
            </p>
          </div>
        ) : null}

        <div className={cn("relative", !heading && "mx-auto w-full max-w-3xl")}>
          {/* The path, and the part of it the scroll has drawn. */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[7px] w-0.5 rounded-full bg-navy-200"
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[7px] w-0.5 origin-top rounded-full bg-gold-500"
            style={{ transform: fill }}
          />

          <ol ref={listRef} className="relative flex flex-col gap-5">
            {PATH.map(({ service, stage }, index) => {
              const on = index < lit;
              const Sketch = SERVICE_SKETCHES[service.slug];
              return (
                <li
                  key={service.slug}
                  data-step
                  data-lit={on}
                  className="group relative grid grid-cols-[16px_minmax(0,1fr)] gap-5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 mt-[25px] size-4 rounded-full border-2 transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                      on
                        ? "scale-100 border-gold-500 bg-gold-500"
                        : "scale-75 border-navy-300 bg-navy-50"
                    )}
                  />
                  <Link
                    href={`/services/${service.slug}`}
                    className={cn(
                      "flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-[opacity,border-color,box-shadow] duration-500 sm:flex-row sm:items-center sm:gap-6",
                      on
                        ? "border-gold-400/60 opacity-100 shadow-sm"
                        : "border-navy-100 opacity-60",
                      "hover:border-gold-400 hover:shadow-md"
                    )}
                  >
                    {Sketch ? <Sketch /> : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="text-xs font-semibold tracking-wide text-gold-700 uppercase">
                        {stage}
                      </span>
                      <h3 className="font-heading text-lg font-semibold text-navy-950">
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-navy-700">
                        {service.summary}
                      </p>
                      <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                        {service.quote === "instant" ? "See prices" : "Learn more"}
                        <ArrowRight
                          className="size-3.5 transition-transform duration-200 [@media(hover:hover)]:group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
