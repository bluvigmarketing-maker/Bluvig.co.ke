import { cn } from "@/lib/utils";

/**
 * Small line drawings for the services path. Each one acts out what the
 * service does, once, when its card lights up: the parent sets
 * `data-lit="true"` on an element with the `group` class.
 *
 * Off: thin navy-300 strokes, nothing drawn in. Lit: strokes darken and the
 * moving parts play. Pure CSS transitions on transform, opacity and
 * stroke-dashoffset.
 */

const BOX = "0 0 96 64";
const FILL_BOX = { transformBox: "fill-box", transformOrigin: "50% 100%" } as const;
const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

// A stroke that draws itself in. `len` must be at least the path's length.
function draw(base: string, len: number, delay = 0) {
  return {
    className: cn(
      base,
      "transition-[stroke-dashoffset] duration-700",
      EASE,
      "[stroke-dashoffset:var(--len)] group-data-[lit=true]:[stroke-dashoffset:0]"
    ),
    style: {
      "--len": len,
      strokeDasharray: len,
      transitionDelay: `${delay}ms`,
    } as React.CSSProperties,
  };
}

const frame =
  "stroke-navy-300 transition-colors duration-300 group-data-[lit=true]:stroke-navy-700";
const accent =
  "stroke-navy-300 transition-colors duration-300 group-data-[lit=true]:stroke-gold-600";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={BOX}
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-16 w-24 shrink-0"
    >
      {children}
    </svg>
  );
}

/** A browser window whose page draws itself in. */
function WebsiteSketch() {
  return (
    <Svg>
      <rect x={6} y={6} width={84} height={52} rx={5} className={frame} />
      <path d="M6 16 H90" className={frame} />
      <path d="M16 27 H54" {...draw(accent, 40, 150)} />
      <path d="M16 35 H44" {...draw(frame, 30, 300)} />
      <path d="M16 46 H34" {...draw(accent, 20, 450)} strokeWidth={5} />
      <rect x={62} y={24} width={20} height={24} rx={3} {...draw(frame, 90, 250)} />
    </Svg>
  );
}

/** A payment travelling from a phone to the shop, then confirmed. */
function PaymentsSketch() {
  return (
    <Svg>
      <rect x={6} y={16} width={18} height={32} rx={4} className={frame} />
      <path d="M72 30 L82 22 L92 30 V48 H72 Z" className={frame} />
      <path d="M28 32 H68" className={frame} strokeDasharray="3 4" />
      <circle
        cx={30}
        cy={32}
        r={5}
        className={cn(
          "fill-navy-200 stroke-none transition-[transform,fill] duration-[900ms] group-data-[lit=true]:translate-x-[36px] group-data-[lit=true]:fill-gold-500",
          EASE
        )}
        style={{ transformBox: "fill-box" }}
      />
      <path d="M77 39 L81 43 L88 35" {...draw(accent, 16, 850)} />
    </Svg>
  );
}

/** A dashboard whose bars grow. */
function WebAppSketch() {
  const bars = [
    { x: 22, h: 14 },
    { x: 36, h: 24 },
    { x: 50, h: 18 },
    { x: 64, h: 30 },
  ];
  return (
    <Svg>
      <rect x={6} y={6} width={84} height={52} rx={5} className={frame} />
      <path d="M16 50 H80" className={frame} />
      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x}
          y={50 - b.h}
          width={8}
          height={b.h}
          rx={1.5}
          className={cn(
            "fill-navy-200 stroke-none transition-[transform,fill] duration-500 [transform:scaleY(0.25)] group-data-[lit=true]:[transform:scaleY(1)] group-data-[lit=true]:fill-gold-500",
            EASE
          )}
          style={{ ...FILL_BOX, transitionDelay: `${i * 90}ms` }}
        />
      ))}
    </Svg>
  );
}

/** A phone with a notification dropping in. */
function MobileSketch() {
  return (
    <Svg>
      <rect x={32} y={4} width={32} height={56} rx={6} className={frame} />
      <path d="M44 9 H52" className={frame} />
      <rect
        x={36}
        y={16}
        width={24}
        height={9}
        rx={3}
        className={cn(
          "fill-gold-500 stroke-none opacity-0 transition-[transform,opacity] duration-500 [transform:translateY(-8px)] group-data-[lit=true]:opacity-100 group-data-[lit=true]:[transform:translateY(0)]",
          EASE
        )}
        style={{ transformBox: "fill-box", transitionDelay: "200ms" }}
      />
      <path d="M38 34 H58 M38 41 H52 M38 48 H56" className={frame} />
    </Svg>
  );
}

/** Three steps of a process joined into one flow. */
function CustomSketch() {
  return (
    <Svg>
      <rect x={4} y={22} width={20} height={20} rx={4} className={frame} />
      <rect x={38} y={22} width={20} height={20} rx={4} className={frame} />
      <rect x={72} y={22} width={20} height={20} rx={4} className={frame} />
      <path d="M24 32 H38 M33 27 L38 32 L33 37" {...draw(accent, 26, 150)} />
      <path d="M58 32 H72 M67 27 L72 32 L67 37" {...draw(accent, 26, 400)} />
      <path d="M14 22 V12 H82 V22" {...draw(frame, 100, 650)} />
    </Svg>
  );
}

/** A growth line climbing. */
function GrowSketch() {
  return (
    <Svg>
      <path d="M10 8 V54 H88" className={frame} />
      <path d="M16 46 L34 38 L48 42 L64 26 L80 16" {...draw(accent, 90, 100)} />
      <path d="M72 15 H81 V24" {...draw(accent, 20, 650)} />
    </Svg>
  );
}

export const SERVICE_SKETCHES: Record<string, () => React.ReactElement> = {
  websites: WebsiteSketch,
  integrations: PaymentsSketch,
  "web-applications": WebAppSketch,
  "mobile-apps": MobileSketch,
  "custom-software": CustomSketch,
  "launch-and-grow": GrowSketch,
};
