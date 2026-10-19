"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import {
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type UseScrollOptions,
} from "framer-motion";

/**
 * Scroll-driven "reach": a line that draws through a list as you scroll, and
 * how many of the list's steps it has reached. Put `ref` on a positioned
 * (`relative`) element and `data-step` on each step inside it.
 *
 * - `measure` (default): a step is reached when the progress passes its own
 *   position in the list — right for lists that flow down the page.
 * - `even`: steps are spread evenly along the progress — right for rows.
 *
 * Scrolling back up un-reaches steps. Reduced motion reaches everything.
 */
export function useScrollReach<T extends HTMLElement>({
  offset,
  mode = "measure",
  stepOffset = 32,
}: {
  offset: UseScrollOptions["offset"];
  mode?: "measure" | "even";
  /** For `measure`: how far into each step (px) counts as reaching it. */
  stepOffset?: number;
}) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });

  const subscribe = useCallback(
    (onChange: () => void) => scrollYProgress.on("change", onChange),
    [scrollYProgress]
  );
  const reached = useSyncExternalStore(
    subscribe,
    () => countReached(ref.current, scrollYProgress.get(), mode, stepOffset),
    () => 0
  );

  return {
    ref,
    progress: scrollYProgress,
    reached: reduce ? Number.POSITIVE_INFINITY : reached,
    reduce: Boolean(reduce),
  };
}

function countReached(
  root: HTMLElement | null,
  progress: number,
  mode: "measure" | "even",
  stepOffset: number
) {
  if (!root) return 0;
  const steps = root.querySelectorAll<HTMLElement>("[data-step]");
  if (mode === "even") {
    const n = steps.length;
    if (n <= 1) return progress > 0 ? n : 0;
    return Math.min(n, Math.floor(progress * (n - 1) + 1.001));
  }
  const height = root.offsetHeight || 1;
  let count = 0;
  for (const step of steps) {
    if ((step.offsetTop + stepOffset) / height <= progress + 0.001) count++;
  }
  return count;
}

/**
 * The drawn part of the line, as a transform. Function form on purpose: the
 * range form hands the value to the browser's native scroll timeline, which
 * drifts out of step with these offsets.
 */
export function useLineFill(
  progress: MotionValue<number>,
  axis: "x" | "y",
  full = false
) {
  return useTransform(progress, (v) => {
    const t = full ? 1 : Math.min(1, Math.max(0, v));
    return axis === "x" ? `scaleX(${t})` : `scaleY(${t})`;
  });
}
