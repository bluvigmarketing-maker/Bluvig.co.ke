"use client";

import { useEffect } from "react";

import { captureAttribution } from "@/lib/track-client";

/** Remembers where the visitor came from, so leads show their source. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
