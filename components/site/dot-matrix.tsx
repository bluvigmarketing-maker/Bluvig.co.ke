"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface Dot {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const GRID_SPACING = 34;
const BASE_RADIUS = 1.1;
const MAX_RADIUS = 3;
const BASE_ALPHA = 0.22;
const MAX_ALPHA = 0.95;
const INFLUENCE_RADIUS = 170;
const LINK_RADIUS = 130;
const LERP = 0.14;

// Muted navy at rest, brightening toward the accent blue near the cursor —
// see DESIGN-SYSTEM.md §9 for the palette this reads from.
const COLD = { r: 165, g: 185, b: 212 }; // navy-300
const HOT = { r: 42, g: 124, b: 239 }; // gold-500 (accent blue)

export function DotMatrix({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots: Dot[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let isInside = false;
    let visible = true;
    let rafId = 0;

    function buildGrid() {
      dots = [];
      const offsetX = (width % GRID_SPACING) / 2;
      const offsetY = (height % GRID_SPACING) / 2;
      for (let y = offsetY; y < height; y += GRID_SPACING) {
        for (let x = offsetX; x < width; x += GRID_SPACING) {
          dots.push({ x, y, radius: BASE_RADIUS, alpha: BASE_ALPHA });
        }
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      isInside =
        mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
    }

    function handleMouseLeave() {
      isInside = false;
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = `rgba(${COLD.r}, ${COLD.g}, ${COLD.b}, ${BASE_ALPHA})`;
      for (const dot of dots) {
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, BASE_RADIUS, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame() {
      ctx!.clearRect(0, 0, width, height);

      const activeMouseX = isInside ? mouseX : -9999;
      const activeMouseY = isInside ? mouseY : -9999;

      for (const dot of dots) {
        const dx = dot.x - activeMouseX;
        const dy = dot.y - activeMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
        const eased = proximity * proximity;

        dot.radius += (BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * eased - dot.radius) * LERP;
        dot.alpha += (BASE_ALPHA + (MAX_ALPHA - BASE_ALPHA) * eased - dot.alpha) * LERP;

        if (dist < LINK_RADIUS && isInside) {
          const lineAlpha = (1 - dist / LINK_RADIUS) * 0.35;
          ctx!.strokeStyle = `rgba(${HOT.r}, ${HOT.g}, ${HOT.b}, ${lineAlpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(dot.x, dot.y);
          ctx!.lineTo(activeMouseX, activeMouseY);
          ctx!.stroke();
        }

        const r = COLD.r + (HOT.r - COLD.r) * eased;
        const g = COLD.g + (HOT.g - COLD.g) * eased;
        const b = COLD.b + (HOT.b - COLD.b) * eased;

        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${dot.alpha})`;
        ctx!.fill();
      }
    }

    function loop() {
      if (visible) frame();
      rafId = requestAnimationFrame(loop);
    }

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      canvas.addEventListener("mouseleave", handleMouseLeave);
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-dot-matrix
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        variant === "dark" ? "opacity-90" : "opacity-100",
        className
      )}
      style={{
        maskImage:
          "radial-gradient(ellipse 60% 55% at 50% 42%, transparent 0%, black 78%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 55% at 50% 42%, transparent 0%, black 78%)",
      }}
    />
  );
}
