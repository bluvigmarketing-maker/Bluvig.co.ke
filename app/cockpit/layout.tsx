import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cockpit",
  robots: { index: false, follow: false },
};

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
