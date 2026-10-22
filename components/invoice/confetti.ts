/**
 * A one-off confetti burst across the whole screen, drawn on a temporary
 * canvas (no library). Skipped for people who prefer reduced motion.
 */
export function burstConfetti(colors: string[]) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "100",
  });
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  // Two cannons in the bottom corners, firing up and inward.
  const pieces = Array.from({ length: 180 }, (_, i) => {
    const left = i % 2 === 0;
    const angle = (left ? -60 : -120) + (Math.random() - 0.5) * 50;
    const speed = 11 + Math.random() * 11;
    const rad = (angle * Math.PI) / 180;
    return {
      x: left ? 0 : w,
      y: h * 0.85,
      vx: Math.cos(rad) * speed * (w < 600 ? 0.7 : 1),
      vy: Math.sin(rad) * speed,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 16,
      wobble: Math.random() * 10,
      round: Math.random() < 0.3,
    };
  });

  const start = performance.now();
  const duration = 3200;

  function frame(now: number) {
    const t = now - start;
    ctx!.clearRect(0, 0, w, h);
    const fade = t > duration - 800 ? Math.max(0, (duration - t) / 800) : 1;
    for (const p of pieces) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.wobble += 0.12;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx!.save();
      ctx!.globalAlpha = fade;
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.fillStyle = p.color;
      if (p.round) {
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        // Scale on one axis so the paper looks like it's flipping.
        ctx!.scale(1, Math.cos(p.wobble));
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx!.restore();
    }
    if (t < duration) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
