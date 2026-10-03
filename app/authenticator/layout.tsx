import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Bluvig Authenticator",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d1726",
};

export default function AuthenticatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
