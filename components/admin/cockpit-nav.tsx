"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/cockpit", label: "Leads" },
  { href: "/cockpit/estimates", label: "Estimates" },
  { href: "/cockpit/projects", label: "Projects" },
  { href: "/cockpit/portfolio", label: "Portfolio" },
  { href: "/cockpit/blog", label: "Blog" },
  { href: "/cockpit/pricing", label: "Pricing" },
  { href: "/cockpit/insights", label: "Insights" },
];

export function CockpitNav() {
  const pathname = usePathname();
  // Sub-pages (e.g. /cockpit/blog/<id>) keep their tab highlighted.
  const isActive = (href: string) =>
    href === "/cockpit" ? pathname === href : pathname.startsWith(href);
  return (
    <nav
      aria-label="Cockpit"
      className="flex gap-1 rounded-full border border-navy-100 bg-white p-1 text-sm"
    >
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={isActive(tab.href) ? "page" : undefined}
          className={cn(
            "rounded-full px-4 py-1.5 font-medium transition-colors",
            isActive(tab.href)
              ? "bg-navy-950 text-white"
              : "text-navy-700 hover:bg-navy-50"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
