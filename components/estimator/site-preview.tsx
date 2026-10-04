"use client";

import { useEffect, useRef } from "react";
import {
  Bot,
  Globe,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  Server,
  ShoppingCart,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MODULES,
  type IndustryDef,
  type SectionKind,
} from "@/lib/estimator/catalog";
import type { Selection } from "@/lib/estimator/pricing";
import { DeviceFrame } from "./device-frame";
import { IndustryIcon } from "./industry-icon";

/** One accent per industry so each preview feels like "their" site. */
const ACCENTS = [
  "#2a7cef",
  "#059669",
  "#e11d48",
  "#d97706",
  "#7c3aed",
  "#0d9488",
  "#ea580c",
  "#db2777",
];

function accentFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

function slugDomain(name: string, tld: string) {
  return `your${name.split(/[^A-Za-z]/)[0].toLowerCase() || "business"}${tld}`;
}

const Bar = ({ className }: { className?: string }) => (
  <span className={cn("block h-1.5 rounded-full bg-navy-200", className)} />
);

function SectionBody({ kind }: { kind: SectionKind }) {
  switch (kind) {
    case "grid":
      return (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-md border border-navy-100 bg-white p-1.5"
            >
              <div className="mb-1.5 h-8 rounded bg-[var(--accent-soft)]" />
              <Bar className="w-3/4" />
              <Bar className="mt-1 w-1/2 bg-[var(--accent)] opacity-60" />
            </div>
          ))}
        </div>
      );
    case "calendar":
      return (
        <div className="flex gap-2">
          <div className="grid flex-1 grid-cols-7 gap-0.5 rounded-md border border-navy-100 bg-white p-1.5">
            {Array.from({ length: 21 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "aspect-square rounded-sm",
                  [4, 9, 10, 16].includes(i)
                    ? "bg-[var(--accent)]"
                    : "bg-navy-50"
                )}
              />
            ))}
          </div>
          <div className="flex w-1/3 flex-col gap-1">
            {["9:00", "11:30", "14:00"].map((t) => (
              <span
                key={t}
                className="rounded border border-navy-100 bg-white px-1 py-0.5 text-center text-[8px] text-navy-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded bg-[var(--accent-soft)]"
            />
          ))}
        </div>
      );
    case "list":
      return (
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border border-navy-100 bg-white px-2 py-1.5"
            >
              <Bar className="w-1/2" />
              <Bar className="w-8 bg-[var(--accent)] opacity-60" />
            </div>
          ))}
        </div>
      );
    case "form":
      return (
        <div className="flex flex-col gap-1.5 rounded-md border border-navy-100 bg-white p-2">
          <span className="h-3 rounded border border-navy-100" />
          <span className="h-3 rounded border border-navy-100" />
          <span className="h-3 w-16 self-end rounded bg-[var(--accent)]" />
        </div>
      );
    case "quotes":
      return (
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-md border border-navy-100 bg-white p-2"
            >
              <span className="text-[10px] leading-none text-[var(--accent)]">
                ★★★★★
              </span>
              <Bar className="mt-1 w-full" />
              <Bar className="mt-1 w-2/3" />
            </div>
          ))}
        </div>
      );
    case "banner":
      return null;
  }
}

export function SitePreview({
  industry,
  selection,
  lastAdded,
  device,
  platform,
}: {
  industry: IndustryDef;
  selection: Selection;
  lastAdded: string | null;
  device: "desktop" | "mobile";
  /** mac = international (MacBook / iPhone), windows = Kenya (Chrome on Windows / Android). */
  platform: "mac" | "windows";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = accentFor(industry.id);
  const chosen = MODULES.filter((m) => selection[m.id]);

  const navItems = [
    "Home",
    "About",
    "Services",
    ...chosen.flatMap((m) => (m.preview.nav ? [m.preview.nav] : [])),
    "Contact",
  ];
  const headerIcons = [
    ...new Set(
      chosen.flatMap((m) =>
        m.preview.headerIcon ? [m.preview.headerIcon] : []
      )
    ),
  ];
  const badges = chosen.flatMap((m) =>
    m.preview.badge ? [m.preview.badge] : []
  );
  const sections = chosen.filter((m) => m.preview.section);
  const backend = chosen.filter((m) => m.preview.backend);
  const widget = chosen.find((m) => m.preview.widget)?.preview.widget;
  const isMobile = device === "mobile";
  const domain = slugDomain(
    industry.name,
    platform === "mac" ? ".com" : ".co.ke"
  );

  // Bring the newest addition into view inside the preview (never scrolls the page).
  useEffect(() => {
    if (!lastAdded) return;
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(
      `[data-preview="${lastAdded}"]`
    );
    if (container && target) {
      container.scrollTo({
        top: Math.max(0, target.offsetTop - 60),
        behavior: "smooth",
      });
    }
  }, [lastAdded]);

  const appear =
    "animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none";
  const ring = (id: string) =>
    id === lastAdded ? "ring-2 ring-[var(--accent)] ring-offset-2" : "";

  return (
    <div className="flex flex-col gap-3">
      <DeviceFrame
        platform={platform}
        device={device}
        domain={domain}
        title={industry.id === "other" ? "YourBrand" : industry.name}
        scrollRef={scrollRef}
        style={
          {
            "--accent": accent,
            "--accent-soft": `${accent}22`,
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-navy-100 bg-white/95 px-3 py-2 backdrop-blur">
          <span className="flex size-5 items-center justify-center rounded bg-[var(--accent)] text-white">
            <IndustryIcon name={industry.icon} className="size-3" />
          </span>
          <span className="font-semibold">YourBrand</span>
          {isMobile ? (
            <span className="ml-auto flex items-center gap-1.5 text-navy-600">
              {headerIcons.map((icon) => (
                <HeaderIcon key={icon} icon={icon} />
              ))}
              <Menu className="size-3.5" aria-hidden="true" />
            </span>
          ) : (
            <>
              <nav className="ml-auto flex flex-wrap justify-end gap-x-2.5 gap-y-1 text-navy-600">
                {navItems.map((item, i) => (
                  <span
                    key={`${item}-${i}`}
                    className={cn(i > 2 && i < navItems.length - 1 && appear)}
                  >
                    {item}
                  </span>
                ))}
              </nav>
              {headerIcons.length ? (
                <span className="flex items-center gap-1.5 border-l border-navy-100 pl-2 text-navy-600">
                  {headerIcons.map((icon) => (
                    <HeaderIcon key={icon} icon={icon} />
                  ))}
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Hero */}
        <div className="bg-[var(--accent-soft)] px-4 py-6 text-center">
          <p className="mx-auto max-w-[80%] text-[13px] leading-tight font-bold">
            {industry.id === "other" ? "Your business, online" : industry.name}
          </p>
          <Bar className="mx-auto mt-2 w-2/3 bg-navy-300" />
          <Bar className="mx-auto mt-1 w-1/2 bg-navy-300" />
          <span className="mt-3 inline-block rounded-md bg-[var(--accent)] px-3 py-1 font-semibold text-white">
            {industry.cta}
          </span>
        </div>

        {/* Services (base) */}
        <div className="px-3 py-3">
          <p className="mb-2 font-semibold">Our services</p>
          <SectionBody kind="grid" />
        </div>

        {/* Module sections */}
        {sections.map((m) => (
          <div
            key={m.id}
            data-preview={m.id}
            className={cn("mx-2 my-1 rounded-lg px-1 py-2", appear, ring(m.id))}
          >
            {m.preview.section!.kind === "banner" ? (
              <div className="rounded-md bg-[var(--accent)] px-3 py-2 text-center font-semibold text-white">
                {m.preview.section!.title}
              </div>
            ) : (
              <>
                <p className="mb-2 px-1 font-semibold">
                  {m.preview.section!.title}
                </p>
                <SectionBody kind={m.preview.section!.kind} />
              </>
            )}
          </div>
        ))}

        {/* Map + contact (base) */}
        <div className="grid grid-cols-2 gap-2 px-3 py-3">
          <div className="relative flex h-16 items-center justify-center rounded-md bg-navy-100">
            <MapPin
              className="size-4 text-[var(--accent)]"
              aria-hidden="true"
            />
            <span className="absolute bottom-1 left-1.5 text-[8px] text-navy-500">
              Google Map
            </span>
          </div>
          <SectionBody kind="form" />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-2 bg-navy-950 px-3 py-3 text-navy-300">
          <span className="font-semibold text-white">YourBrand</span>
          <span>© 2026</span>
          <span className="ml-auto flex flex-wrap gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className={cn(
                  "rounded bg-white px-1.5 py-0.5 text-[8px] font-bold text-navy-900",
                  appear
                )}
              >
                {b}
              </span>
            ))}
          </span>
        </div>

        {/* Floating widgets */}
        <div className="pointer-events-none sticky bottom-2 z-10 flex justify-end gap-1.5 px-2">
          {widget ? (
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow",
                appear
              )}
            >
              {widget === "ai" ? (
                <Bot className="size-3.5" aria-hidden="true" />
              ) : (
                <MessageCircle className="size-3.5" aria-hidden="true" />
              )}
            </span>
          ) : null}
          <span className="flex size-7 items-center justify-center rounded-full bg-[#25d366] text-white shadow">
            <MessageCircle className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </DeviceFrame>

      {/* Behind the scenes */}
      {backend.length ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-white/60 p-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-navy-500 uppercase">
            Behind the scenes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {backend.map((m) => (
              <span
                key={m.id}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-navy-100 bg-white px-2.5 py-1.5 text-xs text-navy-800",
                  appear,
                  m.id === lastAdded && "border-gold-400"
                )}
              >
                <Server className="size-3.5 text-gold-600" aria-hidden="true" />
                {m.preview.backend}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HeaderIcon({ icon }: { icon: "cart" | "user" | "globe" | "search" }) {
  const Icon = { cart: ShoppingCart, user: User, globe: Globe, search: Search }[
    icon
  ];
  return (
    <Icon
      className="size-3.5 animate-in fade-in zoom-in-50 duration-300 motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}
