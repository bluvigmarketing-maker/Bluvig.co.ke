import {
  ClipboardList,
  Code2,
  LifeBuoy,
  PenTool,
  Rocket,
  type LucideIcon,
} from "lucide-react";

/** How we work — the home page snapshot and the /process page. */
export const PROCESS: {
  icon: LucideIcon;
  title: string;
  summary: string;
  deliverables: string[];
}[] = [
  {
    icon: ClipboardList,
    title: "Discover",
    summary:
      "A free call to understand your business, users and goals — then a fixed, itemised quote.",
    deliverables: [
      "Scope and priorities in plain language",
      "Itemised quote and timeline",
      "Phasing plan for bigger projects",
    ],
  },
  {
    icon: PenTool,
    title: "Design",
    summary:
      "You see and click through the product before we build it. A free prototype is available on request.",
    deliverables: [
      "Clickable prototype",
      "Screens for mobile and desktop",
      "Your sign-off before building starts",
    ],
  },
  {
    icon: Code2,
    title: "Build",
    summary:
      "We build in short milestones and show you working software along the way — no disappearing for months.",
    deliverables: [
      "Regular demos on a live preview link",
      "Progress tracker you can check any time",
      "Your feedback built in as we go",
    ],
  },
  {
    icon: Rocket,
    title: "Launch",
    summary:
      "Testing on real devices, data migration, go-live, and training for your team.",
    deliverables: [
      "Testing on phones, tablets and computers",
      "Go-live and handover",
      "Team training",
    ],
  },
  {
    icon: LifeBuoy,
    title: "Support",
    summary:
      "We stay on after launch: fixes, updates, hosting and new features as you grow.",
    deliverables: [
      "Bug fixes after launch",
      "Hosting, backups and monitoring",
      "Support and maintenance plans",
    ],
  },
];
