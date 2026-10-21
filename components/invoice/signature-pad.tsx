"use client";

import { useRef, useState } from "react";
import { Eraser, PenLine, Upload, X } from "lucide-react";

import { fileToDataUrl, trimCanvas } from "@/lib/invoice/images";

/** Draw a signature with a finger, stylus or mouse — or upload one. */
export function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [error, setError] = useState("");

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function stroke(to: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    ctx.strokeStyle = "#0d1726";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    last.current = to;
  }

  function finish() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (canvasRef.current) onChange(trimCanvas(canvasRef.current));
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  if (!drawingMode) {
    return (
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="flex items-center gap-3 rounded-xl border border-navy-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
            <img
              src={value}
              alt="Your signature"
              className="h-12 max-w-[60%] object-contain"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-red-600"
            >
              <X className="size-3.5" aria-hidden="true" /> Remove
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDrawingMode(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 text-sm font-medium text-navy-800 hover:border-navy-300"
          >
            <PenLine className="size-4" aria-hidden="true" />{" "}
            {value ? "Draw again" : "Draw signature"}
          </button>
          <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 text-sm font-medium text-navy-800 hover:border-navy-300">
            <Upload className="size-4" aria-hidden="true" /> Upload image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  setError("");
                  onChange(await fileToDataUrl(file, 500));
                } catch {
                  setError("That image couldn't be read. Try a PNG or JPG.");
                }
              }}
            />
          </label>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        width={720}
        height={240}
        aria-label="Signature drawing area"
        className="h-32 w-full touch-none rounded-xl border border-dashed border-navy-300 bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = point(e);
          stroke({ ...last.current, x: last.current.x + 0.1 });
        }}
        onPointerMove={(e) => drawing.current && stroke(point(e))}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <div className="flex items-center justify-between text-xs text-navy-500">
        <span>Sign inside the box</span>
        <span className="flex gap-3">
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 font-semibold hover:text-navy-900"
          >
            <Eraser className="size-3.5" aria-hidden="true" /> Clear
          </button>
          <button
            type="button"
            onClick={() => setDrawingMode(false)}
            className="font-semibold text-gold-700 hover:underline"
          >
            Done
          </button>
        </span>
      </div>
    </div>
  );
}
