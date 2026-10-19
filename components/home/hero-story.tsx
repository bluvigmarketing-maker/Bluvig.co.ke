"use client";

import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Caveat } from "next/font/google";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  Check,
  ImageIcon,
  LayoutDashboard,
  Package,
  Settings,
  Smartphone,
  Trees,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { HeroCity } from "@/components/home/hero-city";

/**
 * Scroll-driven hero. The hero pins while the visitor scrolls one client
 * project through Idea → Design → Build → Live: the copy on the left turns
 * into a description of each stage, the product on the right grows from a
 * napkin sketch into a working system, and a city skyline behind it all goes
 * from blueprint to lit-up windows. Scrolling back up rewinds it. This is the
 * one signature animation on the site; everything else stays still.
 */

const hand = Caveat({ subsets: ["latin"] });

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SNAP = { type: "spring", duration: 0.5, bounce: 0.3 } as const;
const POP = { type: "spring", duration: 0.45, bounce: 0.25 } as const;

// One pass through a project, as shares of the scroll distance.
//   0 sketch · 1 wireframe · 2 colour · 3 build · 4 payment · 5 new order · 6 hold
const STAGES = [
  { span: 0.18, milestone: 0 },
  { span: 0.09, milestone: 1 },
  { span: 0.11, milestone: 1 },
  { span: 0.2, milestone: 2 },
  { span: 0.11, milestone: 3 },
  { span: 0.11, milestone: 3 },
  { span: 0.2, milestone: 3 },
];
const LAST_STAGE = STAGES.length - 1;

// Before this point the hero shows its normal headline copy.
const INTRO_END = 0.05;

// Where each stage starts, 0–1.
const STAGE_START = STAGES.map((_, i) =>
  STAGES.slice(0, i).reduce((sum, s) => sum + s.span, 0)
);

function stageAt(progress: number) {
  for (let i = LAST_STAGE; i > 0; i--) {
    if (progress >= STAGE_START[i]) return i;
  }
  return 0;
}

const MILESTONES = [
  {
    label: "Idea",
    title: "It starts with your idea",
    body: "A free call to understand your business, the people who use it and where time gets lost. Then a fixed, itemised quote.",
  },
  {
    label: "Design",
    title: "You see it before we build it",
    body: "We design every screen first. You click through it, ask for changes and sign it off before building starts.",
  },
  {
    label: "Build",
    title: "Built in short milestones",
    body: "Working software on a live preview link along the way, with M-Pesa and your other tools connected properly.",
  },
  {
    label: "Live",
    title: "Live, and working for you",
    body: "We test on real devices, launch, train your team and stay on for support. Bookings, payments and orders now run themselves.",
  },
];

// Scroll range each milestone's bar fills over.
const MILESTONE_RANGE = MILESTONES.map((_, m) => {
  const stages = STAGES.map((s, i) => ({ ...s, i })).filter(
    (s) => s.milestone === m
  );
  const first = stages[0].i;
  const last = stages[stages.length - 1].i;
  // The last milestone is full once the new order lands, not at the very end.
  const end =
    m === MILESTONES.length - 1
      ? STAGE_START[last]
      : STAGE_START[last] + STAGES[last].span;
  return [STAGE_START[first], end] as const;
});

const BUILD_RANGE = [STAGE_START[3], STAGE_START[3] + STAGES[3].span] as const;

const PROJECTS = [
  {
    kind: "Website",
    brief: "A booking website for a landscaping company",
    note: "Customers see our prices, book a visit and pay with M-Pesa",
  },
  {
    kind: "Business system",
    brief: "An orders and stock system for a hardware shop",
    note: "Orders, stock and M-Pesa payments, all in one place",
  },
];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function useScaleX(
  progress: MotionValue<number>,
  [from, to]: readonly [number, number]
) {
  return useTransform(
    progress,
    (v) => `scaleX(${clamp01((v - from) / (to - from))})`
  );
}

const DESKTOP_QUERY = "(min-width: 1024px)";

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  );
}

// Swaps copy in place: earlier blocks leave upward, later ones wait below.
function swapClasses(index: number, current: number) {
  if (index === current) return "opacity-100 translate-y-0 visible";
  return cn(
    "pointer-events-none invisible opacity-0",
    index < current ? "-translate-y-4" : "translate-y-4"
  );
}

const SWAP_TRANSITION =
  "transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]";

/* ------------------------------------------------------------------ */

/**
 * Hero layout with the scroll track. On desktop the whole hero pins below
 * the header and the headline copy gives way to stage descriptions; on
 * smaller screens the headline scrolls past first, then the stage copy and
 * the illustration pin together. Reduced motion drops the track and shows
 * the finished product.
 */
export function HeroScroller({ children }: { children: ReactNode }) {
  const desktopTrack = useRef<HTMLDivElement>(null);
  const mobileTrack = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();

  const { scrollYProgress: desktopProgress } = useScroll({
    target: desktopTrack,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileTrack,
    offset: ["start 64px", "end end"],
  });

  const finished = useMotionValue(1);
  const progress = reduce
    ? finished
    : isDesktop
      ? desktopProgress
      : mobileProgress;

  // Read straight from whichever progress is active, so switching between
  // the desktop and mobile tracks never leaves a stale stage behind.
  const subscribe = useCallback(
    (onChange: () => void) => progress.on("change", onChange),
    [progress]
  );
  const stage = useSyncExternalStore(
    subscribe,
    () => stageAt(progress.get()),
    () => 0
  );
  const intro = useSyncExternalStore(
    subscribe,
    () => progress.get() < INTRO_END,
    () => true
  );

  const shownStage = reduce ? LAST_STAGE : stage;
  const milestone = STAGES[shownStage].milestone;
  // -1 is the headline copy.
  const copyIndex = reduce ? -1 : intro ? -1 : milestone;

  // The sky runs night → midday with the scroll; reduced motion keeps it at
  // night, with the city lit up.
  const night = useMotionValue(0);
  const time = reduce ? night : progress;

  return (
    <div
      ref={desktopTrack}
      className="relative lg:h-[300svh] motion-reduce:lg:h-auto"
    >
      <div className="lg:sticky lg:top-20 lg:h-[calc(100svh-5rem)] lg:overflow-hidden motion-reduce:lg:static motion-reduce:lg:h-auto">
        {isDesktop ? (
          <HeroCity
            time={time}
            className="absolute inset-0"
          />
        ) : null}

        <div className="relative mx-auto grid h-full w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-center lg:gap-16 lg:pt-0 lg:pb-[28svh] motion-reduce:lg:pt-16 motion-reduce:lg:pb-[46svh]">
          {/* Headline copy, then one description per stage, stacked in one cell. */}
          <div className="grid lg:items-center [&>*]:col-start-1 [&>*]:row-start-1">
            <div
              className={cn(
                SWAP_TRANSITION,
                "lg:transition-[opacity,transform,visibility]",
                copyIndex !== -1 &&
                  "lg:pointer-events-none lg:invisible lg:-translate-y-4 lg:opacity-0"
              )}
            >
              {children}
            </div>
            {MILESTONES.map((m, i) => (
              <div
                key={m.label}
                aria-hidden={i !== copyIndex}
                className={cn(
                  "hidden flex-col items-start gap-5 lg:flex",
                  SWAP_TRANSITION,
                  swapClasses(i, copyIndex)
                )}
              >
                <span className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
                  {m.label} · Step {i + 1} of {MILESTONES.length}
                </span>
                <h2 className="font-heading text-4xl font-bold text-balance text-white lg:text-5xl">
                  {m.title}
                </h2>
                <p className="max-w-lg text-lg text-navy-200">
                  {m.body}
                </p>
                <Link
                  href="/get-started"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-200"
                >
                  Start your project
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>

          <div
            ref={mobileTrack}
            className="h-[260svh] lg:h-auto motion-reduce:h-auto"
          >
            <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col gap-4 py-4 sm:top-20 sm:h-[calc(100svh-5rem)] sm:justify-center sm:pb-[36svh] lg:static lg:h-auto lg:py-0 motion-reduce:static motion-reduce:h-auto motion-reduce:pb-[32svh]">
              {!isDesktop ? (
                <HeroCity
                  time={time}
                  layout="mobile"
                  className="absolute -inset-x-4 inset-y-0 sm:-inset-x-6"
                />
              ) : null}

              {/* Stage copy for small screens, above the illustration. */}
              <div className="relative grid lg:hidden [&>*]:col-start-1 [&>*]:row-start-1">
                {MILESTONES.map((m, i) => (
                  <div
                    key={m.label}
                    aria-hidden={i !== milestone}
                    className={cn(
                      "flex flex-col gap-1",
                      SWAP_TRANSITION,
                      swapClasses(i, milestone)
                    )}
                  >
                    <span className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
                      {m.label} · Step {i + 1} of {MILESTONES.length}
                    </span>
                    <h2 className="font-heading text-xl font-bold text-white">
                      {m.title}
                    </h2>
                    <p className="text-sm text-navy-200">
                      {m.body}
                    </p>
                  </div>
                ))}
              </div>

              <HeroStory
                progress={progress}
                stage={shownStage}
                milestone={milestone}
                hint={!reduce && shownStage === 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HeroStory({
  progress,
  stage,
  milestone,
  hint,
}: {
  progress: MotionValue<number>;
  stage: number;
  milestone: number;
  hint: boolean;
}) {
  const [project, setProject] = useState(0);
  const brief = PROJECTS[project];
  const buildScale = useScaleX(progress, BUILD_RANGE);

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-navy-800 bg-navy-900 p-4 text-white sm:p-5">
      <p className="sr-only">
        An illustration of a Bluvig project: a client&rsquo;s idea is sketched,
        designed, built and goes live, taking payments and orders on its own.
      </p>

      <MilestoneTrack progress={progress} milestone={milestone} />

      <div className="flex items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Example project"
          className="flex shrink-0 rounded-lg bg-navy-950 p-0.5 text-xs"
        >
          {PROJECTS.map((item, i) => (
            <button
              key={item.kind}
              type="button"
              aria-pressed={i === project}
              onClick={() => setProject(i)}
              className={cn(
                "rounded-md px-2.5 py-1 font-semibold transition-colors duration-150",
                i === project
                  ? "bg-white text-navy-950"
                  : "text-navy-300 hover:text-white"
              )}
            >
              {item.kind}
            </button>
          ))}
        </div>
        <span className="hidden truncate text-xs text-navy-300 sm:block">
          {brief.brief}
        </span>
      </div>

      <div aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={project}
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(-8px)" }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            {project === 0 ? (
              <WebsiteMock stage={stage} note={brief.note} buildScale={buildScale} />
            ) : (
              <SystemMock stage={stage} note={brief.note} buildScale={buildScale} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <span
        aria-hidden="true"
        className={cn(
          "absolute right-4 -bottom-7 flex items-center gap-1 text-xs text-navy-300 transition-opacity duration-300 sm:right-5",
          hint ? "opacity-100" : "opacity-0"
        )}
      >
        Scroll to build it
        <ArrowDown className="size-3.5" />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MilestoneTrack({
  progress,
  milestone,
}: {
  progress: MotionValue<number>;
  milestone: number;
}) {
  return (
    <ol aria-hidden="true" className="grid grid-cols-4 gap-2">
      {MILESTONES.map((m, i) => (
        <MilestoneStep
          key={m.label}
          label={m.label}
          state={i < milestone ? "past" : i === milestone ? "current" : "future"}
          progress={progress}
          range={MILESTONE_RANGE[i]}
        />
      ))}
    </ol>
  );
}

function MilestoneStep({
  label,
  state,
  progress,
  range,
}: {
  label: string;
  state: "past" | "current" | "future";
  progress: MotionValue<number>;
  range: readonly [number, number];
}) {
  const transform = useScaleX(progress, range);
  return (
    <li className="flex flex-col gap-1.5">
      <span
        className={cn(
          "text-xs font-semibold transition-colors duration-300",
          state === "current"
            ? "text-white"
            : state === "past"
              ? "text-gold-300"
              : "text-navy-500"
        )}
      >
        {label}
      </span>
      <span className="h-1 overflow-hidden rounded-full bg-navy-800">
        <motion.span
          className="block h-full origin-left bg-gold-400"
          style={{ transform }}
        />
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */

// The classic wobbly "drawn by hand" outline.
const SKETCH_RADIUS = "255px 15px 225px 15px / 15px 225px 15px 255px";

/**
 * One piece of the product. In the sketch stage it is a tilted pencil
 * outline with a handwritten label; from the wireframe on it straightens
 * and snaps into place, then takes on its real content.
 */
function Block({
  stage,
  index,
  tilt,
  label,
  className,
  styled,
  children,
}: {
  stage: number;
  index: number;
  tilt: number;
  label: string;
  className?: string;
  /** Classes applied once the block is designed (stage 2+). */
  styled?: string;
  children: ReactNode;
}) {
  const sketch = stage === 0;
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden border transition-[background-color,border-color,border-radius] duration-500",
        sketch
          ? "border-[1.5px] border-navy-400 bg-transparent"
          : stage >= 2 && styled
            ? cn("rounded-md border-navy-100", styled)
            : "rounded-md border-navy-100 bg-white",
        className
      )}
      style={sketch ? { borderRadius: SKETCH_RADIUS } : undefined}
      initial={{ opacity: 0, transform: `rotate(${tilt}deg) scale(0.96)` }}
      animate={{
        opacity: 1,
        transform: sketch ? `rotate(${tilt}deg) scale(1)` : "rotate(0deg) scale(1)",
      }}
      transition={
        sketch
          ? { duration: 0.4, ease: EASE_OUT, delay: 0.15 + index * 0.12 }
          : { ...SNAP, delay: stage === 1 ? index * 0.06 : 0 }
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {sketch ? (
          <motion.span
            key="sketch"
            className={cn(
              hand.className,
              "absolute inset-0 flex items-center justify-center px-1 text-center text-[15px] leading-none text-navy-600"
            )}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        ) : (
          <motion.div
            key="built"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: index * 0.06 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Placeholder bar until `ready`, then the real content. */
function Fill({
  ready,
  bar = "w-12",
  className,
  children,
}: {
  ready: boolean;
  bar?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {ready ? (
        <motion.span
          key="real"
          className={cn("block truncate", className)}
          initial={{ opacity: 0, transform: "translateY(3px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          {children}
        </motion.span>
      ) : (
        <motion.span
          key="bar"
          className={cn("my-[3px] block h-2 rounded-full bg-navy-100", bar)}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        />
      )}
    </AnimatePresence>
  );
}

/** A number that rolls to its new value. */
function Ticker({ value }: { value: string }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ transform: "translateY(100%)", opacity: 0 }}
          animate={{ transform: "translateY(0%)", opacity: 1 }}
          exit={{ transform: "translateY(-100%)", opacity: 0 }}
          transition={POP}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Browser window that starts life as a sheet of sketch paper. */
function Window({
  stage,
  url,
  note,
  toast,
  buildScale,
  children,
}: {
  stage: number;
  url: string;
  note: string;
  toast: ReactNode;
  buildScale: MotionValue<string>;
  children: ReactNode;
}) {
  const sketch = stage === 0;
  const live = stage >= 4;
  return (
    <div
      className={cn(
        "relative flex h-[15rem] flex-col overflow-hidden rounded-xl text-navy-950 transition-colors duration-500 sm:h-[19rem]",
        sketch ? "bg-[#fbf9f3]" : "bg-navy-50"
      )}
    >
      {/* Squared paper, only while it's a sketch. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          sketch ? "opacity-100" : "opacity-0"
        )}
        style={{
          backgroundImage:
            "linear-gradient(#e7e3d6 1px, transparent 1px), linear-gradient(90deg, #e7e3d6 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div
        className={cn(
          "relative flex items-center gap-2 border-b px-3 py-1.5 transition-[opacity,border-color] duration-300",
          sketch ? "border-transparent opacity-0" : "border-navy-100 bg-white opacity-100"
        )}
      >
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-navy-200" />
          <span className="size-1.5 rounded-full bg-navy-200" />
          <span className="size-1.5 rounded-full bg-navy-200" />
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 truncate rounded bg-navy-50 px-2 py-0.5 font-mono text-[10px] text-navy-500">
          {url}
          <AnimatePresence>
            {live ? (
              <motion.span
                className="rounded bg-emerald-100 px-1 font-sans text-[9px] font-semibold text-emerald-700"
                initial={{ opacity: 0, transform: "scale(0.9)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.9)" }}
                transition={POP}
              >
                Live
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>

      <div className="relative flex-1 p-2.5">{children}</div>

      {/* The client's brief, pinned to the sketch. */}
      <AnimatePresence>
        {sketch ? (
          <motion.div
            className={cn(
              hand.className,
              "absolute top-3 right-3 w-36 bg-amber-100 p-2.5 text-[15px] leading-tight text-amber-950 shadow-md"
            )}
            initial={{ opacity: 0, transform: "rotate(8deg) scale(0.9)" }}
            animate={{ opacity: 1, transform: "rotate(4deg) scale(1)" }}
            exit={{ opacity: 0, transform: "rotate(10deg) translate(24px, -16px)" }}
            transition={{ ...POP, delay: 0.6 }}
          >
            {note}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Build progress. */}
      <AnimatePresence>
        {stage === 3 ? (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-navy-950 px-3 py-1.5 font-mono text-[10px] text-navy-200"
            initial={{ transform: "translateY(100%)" }}
            animate={{ transform: "translateY(0%)" }}
            exit={{ transform: "translateY(100%)" }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <span className="shrink-0">Building</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-navy-800">
              <motion.span
                className="block h-full origin-left bg-gold-400"
                style={{ transform: buildScale }}
              />
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Business coming in. */}
      <AnimatePresence>
        {live ? (
          <motion.div
            className="absolute right-3 bottom-3 left-3 flex items-center gap-2.5 rounded-lg bg-white p-2.5 shadow-lg ring-1 ring-navy-950/5 sm:left-auto sm:w-64"
            initial={{ opacity: 0, transform: "translateY(16px) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transform: "translateY(16px) scale(0.96)" }}
            transition={POP}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Smartphone className="size-3.5" />
            </span>
            <span className="min-w-0 text-[11px] leading-snug">{toast}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project 1: a website                                                */

const GARDEN_SERVICES = [
  { name: "Lawn care", price: "Ksh 3,000" },
  { name: "Hedge trim", price: "Ksh 2,500" },
  { name: "Full garden", price: "Ksh 4,500" },
];

function WebsiteMock({
  stage,
  note,
  buildScale,
}: {
  stage: number;
  note: string;
  buildScale: MotionValue<string>;
}) {
  const designed = stage >= 2;
  const built = stage >= 3;
  return (
    <Window
      stage={stage}
      buildScale={buildScale}
      url="mazingiragardens.co.ke"
      note={note}
      toast={
        <>
          <span className="block font-semibold">M-Pesa · Ksh 4,500 received</span>
          <span className="block truncate text-navy-500">
            Wanjiku booked Full garden, Thu 9:00
          </span>
        </>
      }
    >
      <div className="grid h-full grid-rows-[1.75rem_1fr_3.75rem] gap-2">
        <Block stage={stage} index={0} tilt={-1.2} label="logo + menu">
          <div className="flex h-full items-center justify-between px-2.5">
            <Fill ready={designed} bar="w-20" className="text-[11px] font-bold text-emerald-700">
              Mazingira Gardens
            </Fill>
            <span className="flex gap-2.5 text-[10px] text-navy-600">
              {["Services", "Prices", "Contact"].map((link) => (
                <Fill key={link} ready={designed} bar="w-8">
                  {link}
                </Fill>
              ))}
            </span>
          </div>
        </Block>

        <div className="grid grid-cols-[1.25fr_1fr] gap-2">
          <Block stage={stage} index={1} tilt={1.4} label="big headline + BOOK button">
            <div className="flex h-full flex-col justify-center gap-1.5 p-2.5">
              <Fill ready={designed} bar="w-24" className="font-heading text-[13px] leading-tight font-bold whitespace-normal">
                Beautiful gardens, cared for every week
              </Fill>
              <Fill ready={built} bar="w-28" className="text-[10px] whitespace-normal text-navy-600">
                Lawns, hedges and full garden care in Nairobi.
              </Fill>
              <span
                className={cn(
                  "mt-1 w-fit rounded px-2.5 py-1 text-[10px] font-semibold transition-colors duration-500",
                  designed ? "bg-emerald-600 text-white" : "bg-navy-100 text-transparent"
                )}
              >
                Book a visit
              </span>
            </div>
          </Block>
          <Block
            stage={stage}
            index={2}
            tilt={-2}
            label="garden photo"
            styled={built ? "bg-emerald-100" : "bg-navy-100"}
          >
            <div className="relative flex h-full items-center justify-center">
              {built ? (
                <motion.span
                  initial={{ opacity: 0, transform: "scale(0.9)" }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  transition={POP}
                  className="text-emerald-600"
                >
                  <Trees className="size-12" strokeWidth={1.5} />
                </motion.span>
              ) : (
                <ImageIcon className="size-6 text-navy-300" />
              )}
              {stage >= 4 ? (
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] text-navy-700">
                  Bookings this week
                  <span className="font-semibold text-navy-950">
                    <Ticker value={stage >= 5 ? "24" : "23"} />
                  </span>
                </span>
              ) : null}
            </div>
          </Block>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {GARDEN_SERVICES.map((service, i) => (
            <Block
              key={service.name}
              stage={stage}
              index={3 + i}
              tilt={[1.8, -1, 2.2][i]}
              label={i === 1 ? "prices" : ""}
            >
              <div className="flex h-full flex-col justify-center gap-0.5 px-2">
                <Fill ready={designed} bar="w-12" className="text-[10px] font-semibold">
                  {service.name}
                </Fill>
                <Fill ready={built} bar="w-10" className="text-[10px] text-emerald-700">
                  {service.price}
                </Fill>
              </div>
            </Block>
          ))}
        </div>
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/* Project 2: a business system                                        */

const ORDERS = [
  { id: "#2080", item: "Iron sheets × 12", total: "Ksh 9,600" },
  { id: "#2079", item: "Paint 20L × 3", total: "Ksh 14,250" },
  { id: "#2078", item: "Nails 5kg × 4", total: "Ksh 2,800" },
];
const NEW_ORDER = { id: "#2081", item: "Cement 50kg × 20", total: "Ksh 18,400" };

const NAV_ICONS = [LayoutDashboard, Package, Boxes, Users, Settings];

function SystemMock({
  stage,
  note,
  buildScale,
}: {
  stage: number;
  note: string;
  buildScale: MotionValue<string>;
}) {
  const designed = stage >= 2;
  const built = stage >= 3;
  const newOrder = stage >= 5;
  const orders = (newOrder ? [NEW_ORDER, ...ORDERS] : ORDERS).slice(0, 3);

  const tiles = [
    { label: "Orders today", value: newOrder ? "48" : "47" },
    { label: "M-Pesa today", value: newOrder ? "200,700" : "182,300" },
    { label: "Low stock", value: "3" },
  ];

  return (
    <Window
      stage={stage}
      buildScale={buildScale}
      url="app.barakahardware.co.ke"
      note={note}
      toast={
        <>
          <span className="block font-semibold">New order #2081 · Ksh 18,400</span>
          <span className="block truncate text-navy-500">
            Paid via M-Pesa, stock updated
          </span>
        </>
      }
    >
      <div className="grid h-full grid-cols-[2.5rem_1fr] gap-2">
        <Block
          stage={stage}
          index={0}
          tilt={-1.5}
          label="menu"
          styled="border-orange-700 bg-orange-600"
        >
          <div className="flex h-full flex-col items-center gap-2.5 py-2.5">
            {NAV_ICONS.map((Icon, i) =>
              designed ? (
                <Icon
                  key={i}
                  className={cn("size-3.5", i === 1 ? "text-white" : "text-orange-200")}
                />
              ) : (
                <span key={i} className="size-3.5 rounded bg-navy-100" />
              )
            )}
          </div>
        </Block>

        <div className="grid grid-rows-[3.5rem_1fr] gap-2">
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((tile, i) => (
              <Block
                key={tile.label}
                stage={stage}
                index={1 + i}
                tilt={[1.6, -1.2, 2][i]}
                label={["sales today?", "M-Pesa", "low stock!"][i]}
              >
                <div className="flex h-full flex-col justify-center gap-0.5 px-2">
                  <Fill ready={designed} bar="w-12" className="text-[9px] text-navy-500">
                    {tile.label}
                  </Fill>
                  <Fill
                    ready={built}
                    bar="w-8"
                    className={cn(
                      "text-[13px] font-bold",
                      i === 2 ? "text-orange-600" : "text-navy-950"
                    )}
                  >
                    <Ticker value={tile.value} />
                  </Fill>
                </div>
              </Block>
            ))}
          </div>

          <Block stage={stage} index={4} tilt={-0.8} label="list of orders + who paid">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-navy-100 px-2.5 py-1.5">
                <Fill ready={designed} bar="w-16" className="text-[10px] font-semibold">
                  Recent orders
                </Fill>
              </div>
              <ul className="flex flex-col divide-y divide-navy-100">
                <AnimatePresence mode="popLayout" initial={false}>
                  {orders.map((order) => (
                    <motion.li
                      key={order.id}
                      layout
                      className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-2.5 py-1.5 text-[10px]"
                      initial={{ opacity: 0, transform: "translateY(-6px)" }}
                      animate={{ opacity: 1, transform: "translateY(0px)" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <Fill ready={built} bar="w-8" className="font-mono text-navy-500">
                        {order.id}
                      </Fill>
                      <Fill ready={built} bar="w-20" className="text-navy-900">
                        {order.item}
                      </Fill>
                      <Fill ready={built} bar="w-10">
                        <span className="flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
                          <Check className="size-2.5" strokeWidth={3} />
                          Paid
                        </span>
                      </Fill>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </Block>
        </div>
      </div>
    </Window>
  );
}
