import { redirect } from "next/navigation";

import { COCKPIT_AUTH_ENABLED } from "@/lib/cockpit-config";

export default function CockpitLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // While sign-in is switched off, skip straight to the dashboard.
  if (!COCKPIT_AUTH_ENABLED) redirect("/cockpit");
  return children;
}
