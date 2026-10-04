"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  ChevronLeft,
  ChevronRight,
  Copy,
  EllipsisVertical,
  Lock,
  Minus,
  Plus,
  RotateCw,
  Share,
  Signal,
  Square,
  Star,
  Wifi,
  X,
} from "lucide-react";

interface FrameProps {
  /** mac = international clients, windows = clients in Kenya. */
  platform: "mac" | "windows";
  device: "desktop" | "mobile";
  domain: string;
  title: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  style?: CSSProperties;
  children: ReactNode;
}

const SCREEN =
  "relative overflow-y-auto overscroll-contain text-[10px] text-navy-900";

/**
 * Familiar device chrome around the live preview: a MacBook / iPhone for
 * international clients, Chrome on Windows / Android for clients in Kenya.
 * Sizes are percentage-based so the frames shrink cleanly on small screens.
 */
export function DeviceFrame(props: FrameProps) {
  if (props.device === "mobile") {
    return props.platform === "mac" ? (
      <IPhone {...props} />
    ) : (
      <AndroidPhone {...props} />
    );
  }
  return props.platform === "mac" ? (
    <MacBook {...props} />
  ) : (
    <WindowsChrome {...props} />
  );
}

function MacBook({ domain, scrollRef, style, children }: FrameProps) {
  return (
    <div className="mx-auto w-full max-w-[780px]" style={style}>
      {/* Lid */}
      <div className="mx-auto w-[94%] rounded-t-[14px] bg-[#111113] p-[1.5%] pb-[2.4%] shadow-2xl ring-1 ring-black/60 sm:rounded-t-[22px]">
        <div className="overflow-hidden rounded-[5px] bg-white">
          {/* macOS menu bar with the notch */}
          <div className="relative flex h-5 items-center gap-3 bg-[#ececec] px-3 text-[9px] font-medium text-[#1d1d1f]">
            <span className="font-semibold">Safari</span>
            <span className="hidden sm:inline">File</span>
            <span className="hidden sm:inline">Edit</span>
            <span className="hidden sm:inline">View</span>
            <span className="absolute top-0 left-1/2 h-[14px] w-[72px] -translate-x-1/2 rounded-b-[6px] bg-[#111113]" />
            <span className="ml-auto flex items-center gap-1.5">
              <Wifi className="size-2.5" aria-hidden="true" />
              <BatteryFull className="size-3" aria-hidden="true" />
              <span>9:41</span>
            </span>
          </div>
          {/* Safari toolbar */}
          <div className="flex items-center gap-2 border-b border-[#d9d9d9] bg-[#f6f6f6] px-3 py-1.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <ChevronLeft
              className="ml-1 hidden size-3.5 text-[#8e8e93] sm:block"
              aria-hidden="true"
            />
            <ChevronRight
              className="hidden size-3.5 text-[#c7c7cc] sm:block"
              aria-hidden="true"
            />
            <span className="mx-auto flex max-w-[60%] min-w-0 flex-1 items-center justify-center gap-1 rounded-md bg-[#e3e3e3] px-2 py-0.5 text-[10px] text-[#3c3c43]">
              <Lock className="size-2.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{domain}</span>
            </span>
            <Share
              className="hidden size-3.5 text-[#8e8e93] sm:block"
              aria-hidden="true"
            />
            <Plus
              className="hidden size-3.5 text-[#8e8e93] sm:block"
              aria-hidden="true"
            />
          </div>
          <div ref={scrollRef} className={`${SCREEN} h-[300px] sm:h-[420px]`}>
            {children}
          </div>
        </div>
      </div>
      {/* Base */}
      <div className="relative mx-auto h-[10px] w-full rounded-b-[12px] bg-gradient-to-b from-[#e2e2e6] via-[#c4c4ca] to-[#8e8e94] shadow-lg sm:h-[15px]">
        <span className="absolute top-0 left-1/2 h-[4px] w-[16%] -translate-x-1/2 rounded-b-md bg-[#a5a5ab] sm:h-[6px]" />
      </div>
    </div>
  );
}

function WindowsChrome({
  domain,
  title,
  scrollRef,
  style,
  children,
}: FrameProps) {
  return (
    <div
      className="mx-auto w-full max-w-[780px] overflow-hidden rounded-lg border border-[#b9bcc1] bg-white shadow-xl shadow-navy-900/15"
      style={style}
    >
      {/* Tab strip + window controls */}
      <div className="flex h-9 items-end bg-[#dfe3e8] pl-2">
        <div className="flex h-7 max-w-[55%] min-w-0 items-center gap-2 rounded-t-lg bg-white px-3 text-[11px] text-[#202124]">
          <span className="size-3 shrink-0 rounded-sm bg-[var(--accent)]" />
          <span className="truncate">{title}</span>
          <X className="size-3 shrink-0 text-[#5f6368]" aria-hidden="true" />
        </div>
        <Plus
          className="mb-1.5 ml-2 size-3.5 text-[#5f6368]"
          aria-hidden="true"
        />
        <div className="mb-auto ml-auto flex text-[#202124]">
          {[Minus, Square, X].map((Icon, i) => (
            <span
              key={i}
              className="flex h-8 w-9 items-center justify-center sm:w-11"
            >
              <Icon
                className={i === 1 ? "size-2.5" : "size-3.5"}
                aria-hidden="true"
              />
            </span>
          ))}
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-[#dadce0] bg-white px-2 py-1.5 text-[#5f6368]">
        <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
        <ArrowRight
          className="hidden size-3.5 shrink-0 opacity-40 sm:block"
          aria-hidden="true"
        />
        <RotateCw className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#f1f3f4] px-3 py-1 text-[11px] text-[#202124]">
          <Lock className="size-3 shrink-0 text-[#5f6368]" aria-hidden="true" />
          <span className="truncate">{domain}</span>
          <Star
            className="ml-auto hidden size-3 shrink-0 text-[#5f6368] sm:block"
            aria-hidden="true"
          />
        </span>
        <span className="size-5 shrink-0 rounded-full bg-[var(--accent)] opacity-80" />
        <EllipsisVertical className="size-3.5 shrink-0" aria-hidden="true" />
      </div>
      <div ref={scrollRef} className={`${SCREEN} h-[300px] sm:h-[420px]`}>
        {children}
      </div>
    </div>
  );
}

function IPhone({ domain, scrollRef, style, children }: FrameProps) {
  return (
    <div
      className="mx-auto w-full max-w-[290px] rounded-[44px] bg-[#111113] p-[10px] shadow-2xl ring-1 ring-black/60"
      style={style}
    >
      <div className="relative overflow-hidden rounded-[34px] bg-white">
        <div className="relative flex h-9 items-center justify-between px-6 text-[11px] font-semibold text-[#1d1d1f]">
          <span>9:41</span>
          <span className="absolute top-2 left-1/2 h-[22px] w-[82px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Signal className="size-3" aria-hidden="true" />
            <Wifi className="size-3" aria-hidden="true" />
            <BatteryFull className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <div ref={scrollRef} className={`${SCREEN} h-[440px]`}>
          {children}
        </div>
        {/* Safari bottom bar + home indicator */}
        <div className="border-t border-[#e5e5ea] bg-[#f9f9f9] px-3 pt-2 pb-1">
          <div className="flex items-center justify-center gap-1 rounded-xl bg-white px-3 py-1.5 text-[10px] text-[#1d1d1f] shadow-sm">
            <Lock className="size-2.5" aria-hidden="true" />
            <span className="truncate">{domain}</span>
          </div>
          <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}

function AndroidPhone({ domain, scrollRef, style, children }: FrameProps) {
  return (
    <div
      className="mx-auto w-full max-w-[290px] rounded-[30px] bg-[#1f1f1f] p-[8px] shadow-2xl ring-1 ring-black/60"
      style={style}
    >
      <div className="relative overflow-hidden rounded-[24px] bg-white">
        <div className="relative flex h-7 items-center justify-between px-5 text-[10px] font-medium text-[#202124]">
          <span>12:30</span>
          <span className="absolute top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Wifi className="size-3" aria-hidden="true" />
            <Signal className="size-3" aria-hidden="true" />
            <BatteryFull className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        {/* Chrome address bar */}
        <div className="flex items-center gap-2 px-2 pb-1.5 text-[#5f6368]">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#f1f3f4] px-3 py-1.5 text-[10px] text-[#202124]">
            <Lock className="size-2.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{domain}</span>
          </span>
          <Copy className="size-3.5 shrink-0" aria-hidden="true" />
          <EllipsisVertical className="size-3.5 shrink-0" aria-hidden="true" />
        </div>
        <div
          ref={scrollRef}
          className={`${SCREEN} h-[440px] border-t border-[#e8eaed]`}
        >
          {children}
        </div>
        <div className="flex h-5 items-center justify-center bg-white">
          <span className="h-1 w-24 rounded-full bg-[#202124]/70" />
        </div>
      </div>
    </div>
  );
}
