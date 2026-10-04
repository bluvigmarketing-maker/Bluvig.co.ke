/**
 * Material a client can share to explain what they want:
 * AI brainstorming chats, inspiration websites and an AI-built prototype.
 */
export interface Materials {
  /** Share links to ChatGPT / Claude / Gemini conversations. */
  aiChats: string[];
  /** Websites they like. */
  inspirations: string[];
  /** A prototype they built with AI (Lovable, v0, Bolt, Replit…). */
  prototype: string;
}

export const EMPTY_MATERIALS: Materials = {
  aiChats: [],
  inspirations: [],
  prototype: "",
};

const MAX_LINKS = 5;

/** Accepts "example.com" or full URLs; only http(s) links survive. */
export function normalizeUrl(raw: unknown): string | null {
  const text = String(raw ?? "")
    .trim()
    .slice(0, 500);
  if (!text) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Sanitises untrusted input from a form or API body. */
export function cleanMaterials(input: unknown): Materials {
  const body = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  const list = (value: unknown) =>
    [
      ...new Set(
        (Array.isArray(value) ? value : [])
          .map(normalizeUrl)
          .filter(Boolean) as string[]
      ),
    ].slice(0, MAX_LINKS);
  return {
    aiChats: list(body.aiChats),
    inspirations: list(body.inspirations),
    prototype: normalizeUrl(body.prototype) ?? "",
  };
}

export function hasMaterials(m: Materials | undefined): boolean {
  return Boolean(
    m && (m.aiChats.length || m.inspirations.length || m.prototype)
  );
}

/** "2 AI chats, 1 inspiration site, a prototype" — for summaries. */
export function describeMaterials(m: Materials | undefined): string {
  if (!m || !hasMaterials(m)) return "";
  const parts = [
    m.aiChats.length
      ? `${m.aiChats.length} AI chat${m.aiChats.length > 1 ? "s" : ""}`
      : "",
    m.inspirations.length
      ? `${m.inspirations.length} inspiration site${m.inspirations.length > 1 ? "s" : ""}`
      : "",
    m.prototype ? "a prototype" : "",
  ].filter(Boolean);
  return parts.join(", ");
}
