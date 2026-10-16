import type { Attribution, FunnelEvent } from "@/lib/funnel-events";

/** Browser-side: count a funnel event. Fire-and-forget; never blocks the UI. */
export function track(event: FunnelEvent) {
  try {
    const body = JSON.stringify({ event });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Analytics is best-effort.
  }
}

const KEY = "bluvig-attribution";

/** Remembers where this visit came from (first page of the session). */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(location.search);
    let referrer = "";
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : "";
      if (host && host !== location.hostname) referrer = host.replace(/^www\./, "");
    } catch {
      // Unparseable referrer — treat as direct.
    }
    const attribution: Attribution = {
      source: params.get("utm_source") || referrer || "direct",
      medium: params.get("utm_medium") || (referrer ? "referral" : undefined),
      campaign: params.get("utm_campaign") || undefined,
      landing: location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // Storage blocked — attribution is optional.
  }
}

export function getAttribution(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}
