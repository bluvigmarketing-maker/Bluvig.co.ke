"use client";

import Image from "next/image";
import {
  motion,
  transform as interpolate,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * The hero's backdrop: Nairobi's skyline (a photo with its sky cut out) as a
 * band along the bottom, under a sky that runs from night to midday with the
 * scroll, with a sun that rises from behind the city. The photo is relit by
 * crossfading three grades of it — night, golden hour, midday — so only
 * opacity changes while scrolling; re-running a CSS filter on a picture this
 * size every frame is too heavy for phones.
 *
 * `time` 0–1 drives the sky, the sun, the stars and the light on the city.
 */

const SKYLINE = "/hero/nairobi-skyline.webp";
const SKYLINE_W = 1376;
const SKYLINE_H = 586;

// When each time of day is reached, as a share of the scroll: night through
// the idea, dawn while designing, sunrise as it's built, midday once live.
const TIME = [0, 0.2, 0.42, 0.6, 0.72];

// A deep equatorial blue at midday, so white copy still reads against it.
const SKY_TOP = ["#070d1a", "#0c1630", "#213a6b", "#2f6cbf", "#2a67bd"];
// The night horizon keeps a faint city glow, so the towers stand out.
const SKY_HORIZON = ["#1b2a48", "#2a2f55", "#f3a35f", "#8ec0ea", "#a8d1f2"];

// Deterministic "random" so server and client agree.
function noise(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// Sparse, fixed stars in the top of the sky.
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: noise(i * 4.1) * 100,
  y: noise(i * 9.3) * 55,
  r: 0.6 + noise(i * 2.7) * 1,
}));

/**
 * Map scroll time through keyframes. Uses the function form on purpose: the
 * range form hands opacity and colours to the browser's native scroll
 * timeline, which doesn't know this hero's track offsets and drifts out of
 * step with everything else.
 */
function useRange(
  time: MotionValue<number>,
  input: number[],
  output: number[]
) {
  return useTransform(time, (v) => interpolate(v, input, output));
}

function useRangeOf(
  time: MotionValue<number>,
  input: number[],
  output: string[]
) {
  return useTransform(time, (v) => interpolate(v, input, output));
}

/**
 * Layouts. The skyline is a band along the bottom, cropped from the top so
 * the tower tops are always in; the copy and the illustration sit above it.
 * On desktop the sun climbs through the gutter between the copy and the
 * illustration (the grid's 32rem column + 4rem gap puts that at 50% + 8px,
 * or 100% − 568px on narrower screens). On small screens the illustration
 * fills the middle, so the sun stays low over the city at the right.
 */
const LAYOUT = {
  desktop: {
    band: "h-[36svh]",
    focus: "50% 0%",
    sunX: "min(calc(50cqw + 8px), calc(100cqw - 568px))",
    // Hidden behind the city → clearing the rooftops at sunrise → high noon.
    sunY: [104, 62, 9],
    sunSize: 72,
    wash: "linear-gradient(to right, rgba(7, 13, 26, 0.7) 0%, rgba(7, 13, 26, 0.42) 30%, rgba(7, 13, 26, 0) 48%)",
    // The wash stays in the sky; the skyline below it is left clear.
    washMask: "linear-gradient(to bottom, #000 0%, #000 48%, transparent 60%)",
  },
  // The closing call to action: centred copy, sun setting off to the right.
  cta: {
    band: "h-[30svh] lg:h-[36svh]",
    focus: "45% 0%",
    sunX: "82cqw",
    sunY: [104, 64, 14],
    sunSize: 56,
    wash: "radial-gradient(ellipse 70% 55% at 50% 32%, rgba(7, 13, 26, 0.72) 0%, rgba(7, 13, 26, 0.4) 55%, rgba(7, 13, 26, 0) 80%)",
    washMask: "none",
  },
  mobile: {
    band: "h-[30svh] sm:h-[34svh]",
    focus: "42% 0%",
    sunX: "86cqw",
    sunY: [104, 78, 72],
    sunSize: 48,
    wash: "linear-gradient(to bottom, rgba(7, 13, 26, 0.75) 0%, rgba(7, 13, 26, 0.45) 20%, rgba(7, 13, 26, 0) 36%)",
    washMask: "none",
  },
};

export function HeroCity({
  time,
  layout = "desktop",
  className,
}: {
  time: MotionValue<number>;
  layout?: keyof typeof LAYOUT;
  className?: string;
}) {
  const l = LAYOUT[layout];

  const top = useRangeOf(time, TIME, SKY_TOP);
  const horizon = useRangeOf(time, TIME, SKY_HORIZON);
  const sky = useMotionTemplate`linear-gradient(to bottom, ${top} 0%, ${horizon} 100%)`;

  const stars = useRange(time, [0, 0.22, 0.36], [1, 0.75, 0]);

  // The city's light: night grade fades out by sunrise, midday grade in.
  const night = useRange(time, [0, 0.22, 0.32, 0.42], [1, 0.9, 0.5, 0]);
  const midday = useRange(time, [0.46, 0.72], [0, 1]);

  // The sun: rises from behind the skyline and climbs to midday, warming the
  // sky around it as it goes.
  const sunY = useRange(time, [0.26, 0.42, 0.72], l.sunY);
  const sunTransform = useMotionTemplate`translate(${l.sunX}, ${sunY}cqh) translate(-50%, -50%)`;
  const sunOpacity = useRange(time, [0.24, 0.3], [0, 1]);
  const rim = useRangeOf(time, [0.3, 0.46, 0.72], ["#ff7a2e", "#ffb347", "#fff1b8"]);
  const core = useRangeOf(time, [0.3, 0.46, 0.72], ["#ffd2a1", "#fff0c9", "#ffffff"]);
  const disc = useMotionTemplate`radial-gradient(circle, ${core} 0%, ${core} 38%, ${rim} 70%, ${rim} 100%)`;
  const glow = useRangeOf(
    time,
    [0.3, 0.46, 0.72],
    [
      "0 0 40px 12px rgba(255, 122, 46, 0.7)",
      "0 0 46px 14px rgba(255, 179, 71, 0.6)",
      "0 0 60px 18px rgba(255, 246, 214, 0.75)",
    ]
  );
  const bloomColour = useRangeOf(
    time,
    [0.3, 0.46, 0.72],
    [
      "rgba(255, 122, 46, 0.55)",
      "rgba(255, 190, 110, 0.4)",
      "rgba(255, 250, 225, 0.32)",
    ]
  );
  const bloom = useMotionTemplate`radial-gradient(circle, ${bloomColour} 0%, transparent 62%)`;

  const photo = (grade: string) => (
    <Image
      src={SKYLINE}
      alt=""
      width={SKYLINE_W}
      height={SKYLINE_H}
      sizes="(min-width: 1024px) 100vw, 230vw"
      // The hero's city is above the fold; the closing section's isn't.
      fetchPriority={layout === "cta" ? "auto" : "high"}
      loading={layout === "cta" ? "lazy" : undefined}
      className={cn("absolute inset-0 size-full object-cover", grade)}
      style={{ objectPosition: l.focus }}
    />
  );

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none overflow-hidden", className)}
    >
      <motion.div className="absolute inset-0" style={{ backgroundImage: sky }} />

      {/* Stars and sun sit behind the city. */}
      <div className="absolute inset-0 [container-type:size]">
        <motion.svg
          className="absolute inset-0 size-full"
          style={{ opacity: stars }}
        >
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              className="fill-white"
            />
          ))}
        </motion.svg>

        <motion.div
          className="absolute top-0 left-0"
          style={{ transform: sunTransform, opacity: sunOpacity }}
        >
          <motion.span
            className="absolute top-1/2 left-1/2 size-[44rem] -translate-1/2 rounded-full"
            style={{ backgroundImage: bloom }}
          />
          <motion.span
            className="relative block rounded-full"
            style={{
              width: l.sunSize,
              height: l.sunSize,
              backgroundImage: disc,
              boxShadow: glow,
            }}
          />
        </motion.div>
      </div>

      {/* A steady navy wash keeps the copy readable, day or night. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: l.wash,
          maskImage: l.washMask,
          WebkitMaskImage: l.washMask,
        }}
      />

      {/* The city: golden hour as shot, with midday and night grades over it. */}
      <div className={cn("absolute inset-x-0 bottom-0", l.band)}>
        {photo("")}
        <motion.div className="absolute inset-0" style={{ opacity: midday }}>
          {photo("brightness-[1.12] saturate-[0.75] contrast-[0.96]")}
        </motion.div>
        <motion.div className="absolute inset-0" style={{ opacity: night }}>
          {photo("brightness-[0.4] saturate-[0.6] contrast-[1.1]")}
          {/* City lights: only the photo's bright points (windows, street
              lamps) survive this grade, screened back over the dark city. */}
          {photo("brightness-[0.55] contrast-[2.6] saturate-[1.3] mix-blend-screen")}
        </motion.div>
      </div>
    </div>
  );
}
