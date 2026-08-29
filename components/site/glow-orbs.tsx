"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const DARK_ORBS = [
  "absolute -top-32 -left-20 size-[28rem] rounded-full bg-navy-500/40 blur-[100px]",
  "absolute top-1/4 -right-24 size-[24rem] rounded-full bg-gold-500/25 blur-[100px]",
  "absolute -bottom-32 left-1/3 size-[22rem] rounded-full bg-navy-400/25 blur-[100px]",
];

const LIGHT_ORBS = [
  "absolute -top-24 -left-16 size-80 rounded-full bg-navy-300/25 blur-[90px]",
  "absolute top-10 -right-16 size-72 rounded-full bg-gold-300/30 blur-[90px]",
];

export function GlowOrbs({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbs = variant === "dark" ? DARK_ORBS : LIGHT_ORBS;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Only drift when the visitor hasn't asked for reduced motion — orbs
      // stay put (their static CSS position) otherwise.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const els =
          containerRef.current?.querySelectorAll<HTMLElement>("[data-orb]");

        els?.forEach((el, i) => {
          gsap.to(el, {
            x: i % 2 === 0 ? 36 : -28,
            y: i % 2 === 0 ? -26 : 34,
            scale: 1.12,
            duration: 12 + i * 4,
            delay: i * 1.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {orbs.map((orbClassName) => (
        <div key={orbClassName} data-orb className={orbClassName} />
      ))}
    </div>
  );
}
