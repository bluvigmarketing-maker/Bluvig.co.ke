import { cn } from "@/lib/utils";

/**
 * A tick in a circle that draws itself when `on` turns true, and undraws
 * when it turns false. `delay` (ms) staggers ticks in a list.
 */
export function DrawnCheck({
  on,
  delay = 0,
  className,
}: {
  on: boolean;
  delay?: number;
  className?: string;
}) {
  const stroke = cn(
    "transition-[stroke-dashoffset,stroke] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
    on ? "stroke-gold-600" : "stroke-navy-200"
  );
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    >
      <circle cx={10} cy={10} r={8.5} className="stroke-navy-100" />
      <circle
        cx={10}
        cy={10}
        r={8.5}
        className={stroke}
        style={{
          strokeDasharray: 54,
          strokeDashoffset: on ? 0 : 54,
          transitionDelay: `${delay}ms`,
        }}
      />
      <path
        d="M6.2 10.4 L8.8 12.9 L13.8 7.4"
        className={stroke}
        style={{
          strokeDasharray: 12,
          strokeDashoffset: on ? 0 : 12,
          transitionDelay: `${delay + 180}ms`,
        }}
      />
    </svg>
  );
}
