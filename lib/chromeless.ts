/** Routes that render without the marketing header, footer and WhatsApp button. */
const CHROMELESS_PREFIXES = ["/cockpit", "/authenticator"];

export function isChromeless(pathname: string | null) {
  return CHROMELESS_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
}
