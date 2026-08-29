"use client";

import { useRef } from "react";
import { Search, Share2, Sparkles, type LucideIcon } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { AnimatedSection } from "@/components/site/animated-section";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PILLARS: { icon: LucideIcon; title: string; points: string[] }[] = [
  {
    icon: Search,
    title: "Search Engine Visibility (Google SEO)",
    points: [
      "We fix technical SEO issues so Google can actually understand your site.",
      "We write helpful, keyword-rich content — no fluff, no jargon.",
      "We build topical authority that earns long-term rankings.",
    ],
  },
  {
    icon: Share2,
    title: "Social Media Visibility",
    points: [
      "Your blog content is repurposed into short, scroll-stopping posts.",
      "We keep your brand active where your customers spend time daily.",
      "Content built around your customers' psychology, per platform.",
    ],
  },
  {
    icon: Sparkles,
    title: "AI Assistant Visibility (ChatGPT, Gemini, etc.)",
    points: [
      "We structure content so AI assistants can read and quote your business.",
      'We target real queries like "best digital marketing agency in Kenya."',
      "This gets your business recommended automatically.",
    ],
  },
];

export function PillarGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // The connecting line only draws on desktop, where the three pillars
      // sit in a single row — and never for reduced-motion visitors.
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };

          if (!isDesktop || reduceMotion) return;

          const grid = gridRef.current;
          const path = pathRef.current;
          if (!grid || !path) return;

          const drawPath = () => {
            const gridRect = grid.getBoundingClientRect();
            const points = iconRefs.current.map((icon) => {
              if (!icon) return { x: 0, y: 0 };
              const r = icon.getBoundingClientRect();
              return {
                x: r.left + r.width / 2 - gridRect.left,
                y: r.top + r.height / 2 - gridRect.top,
              };
            });
            path.setAttribute(
              "d",
              `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y}`
            );
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
          };

          drawPath();

          const trigger = ScrollTrigger.create({
            trigger: grid,
            start: "top 75%",
            end: "top 30%",
            scrub: 1,
            onRefresh: drawPath,
            animation: gsap.to(path, { strokeDashoffset: 0, ease: "none" }),
          });

          const onResize = () => {
            drawPath();
            ScrollTrigger.refresh();
          };
          window.addEventListener("resize", onResize);

          return () => {
            window.removeEventListener("resize", onResize);
            trigger.kill();
          };
        }
      );

      // Idle icon loops — a scan sweep, a pulse, a twinkle — skipped entirely
      // for reduced-motion visitors.
      if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        iconRefs.current.forEach((icon, i) => {
          if (!icon) return;
          if (i === 0) {
            gsap.to(icon, {
              rotate: -14,
              duration: 1.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          } else if (i === 1) {
            gsap.to(icon, {
              scale: 1.18,
              duration: 1.2,
              delay: 0.3,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          } else {
            gsap.to(icon, {
              autoAlpha: 0.45,
              duration: 1,
              delay: 0.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          }
        });
      }

      return () => mm.revert();
    },
    { scope: gridRef }
  );

  return (
    <div ref={gridRef} className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <svg
        className="pointer-events-none absolute inset-0 hidden size-full lg:block"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="var(--gold-400)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>

      {PILLARS.map((pillar, index) => (
        <AnimatedSection
          key={pillar.title}
          delay={index * 0.1}
          className="relative z-10"
        >
          <div className="glass flex h-full flex-col gap-4 rounded-2xl p-6 transition-colors hover:bg-white/10">
            <span
              ref={(el) => {
                iconRefs.current[index] = el;
                return () => {
                  iconRefs.current[index] = null;
                };
              }}
              className="glass-gold flex size-10 items-center justify-center rounded-xl text-gold-300"
            >
              <pillar.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold text-white">
              {pillar.title}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-navy-200">
              {pillar.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-gold-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
