/**
 * How apps and business systems are sold: the client describes the project
 * in full, we hold a discovery call, send a fixed price, then build a
 * prototype. Shared by the Get Started wizard, the leads API and the
 * service pages.
 */

export const SYSTEM_KINDS = [
  { id: "mobile-app", label: "Mobile app" },
  { id: "web-app", label: "Web app or portal" },
  { id: "business-system", label: "Business system" },
  { id: "integration", label: "Integration (M-Pesa, eTIMS, APIs)" },
  { id: "unsure", label: "Not sure yet" },
] as const;

export type SystemKindId = (typeof SYSTEM_KINDS)[number]["id"];

export function isSystemKind(value: unknown): value is SystemKindId {
  return SYSTEM_KINDS.some((k) => k.id === value);
}

/** A brief shorter than this isn't a full description yet. */
export const MIN_BRIEF = 150;

export const SYSTEM_JOURNEY = [
  {
    title: "Describe it in full",
    text: "Tell us who will use it, what it must do and how you work today.",
  },
  {
    title: "Discovery call",
    text: "We go through your brief together and agree the scope.",
  },
  {
    title: "Fixed price",
    text: "An itemised quote with milestones, before any work starts.",
  },
  {
    title: "Prototype development",
    text: "You click through a working prototype before the full build.",
  },
];

/** Prompts that help a client write a full brief. */
export const BRIEF_PROMPTS = [
  "Who will use it (customers, staff, managers)?",
  "What should it do? List the main tasks or screens.",
  "How do you handle this today (paper, Excel, WhatsApp)?",
  "Must-have features and anything it should connect to (M-Pesa, eTIMS, accounting)",
  "Roughly how many users, and any deadline",
];
