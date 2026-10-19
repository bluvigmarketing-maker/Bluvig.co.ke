"use client";

import { DrawnCheck } from "@/components/site/drawn-check";
import { useScrollReach } from "@/components/site/use-scroll-reach";

/**
 * A checklist that ticks itself off as it scrolls into view — for "what's
 * included" lists.
 */
export function TickList({ items }: { items: string[] }) {
  const { ref, reached } = useScrollReach<HTMLUListElement>({
    offset: ["start 85%", "end 65%"],
    stepOffset: 10,
  });

  return (
    <ul ref={ref} className="relative grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={item} data-step className="flex gap-2 text-sm text-navy-800">
          <DrawnCheck
            on={index < reached}
            delay={(index % 2) * 120}
            className="size-4.5"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
