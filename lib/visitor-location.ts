import { headers } from "next/headers";

/**
 * Is this visitor in Kenya? Read from the hosting platform's IP-country
 * header (Vercel, or Cloudflare if it's in front). Decides the currency:
 * KES in Kenya, USD everywhere else — visitors can't switch it.
 *
 * null when unknown (local development): callers fall back to the
 * browser's time zone or the country the client typed.
 */
export async function visitorInKenya(): Promise<boolean | null> {
  const h = await headers();
  const country = (
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry")
  )?.toUpperCase();
  if (!country || country === "XX" || country === "T1") return null;
  return country === "KE";
}
