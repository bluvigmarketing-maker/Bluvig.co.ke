/**
 * Shipped projects for /work. Only facts we can stand behind.
 *
 * To turn a card into a full case study at /work/[slug], add `story` (and
 * ideally `stack`, `link` and a `testimonial`) — with the client's permission.
 * Never add numbers or quotes that aren't real.
 */
export interface Project {
  slug: string;
  title: string;
  /** What kind of build it was. */
  type: string;
  /** Which /services/[slug] it belongs to. */
  service: string;
  summary: string;
  /** Our own product rather than client work. */
  own?: boolean;
  link?: string;
  stack?: string[];
  story?: {
    challenge: string;
    solution: string;
    outcome: string;
    testimonial?: { quote: string; name: string; role: string };
  };
}

export const PROJECTS: Project[] = [
  {
    slug: "qr-baker",
    title: "QR Baker",
    type: "Web app · M-Pesa",
    service: "web-applications",
    own: true,
    summary:
      "Our own M-Pesa QR code generator — a web app that lets small businesses in Kenya create payment QR codes for contactless M-Pesa payments.",
  },
  {
    slug: "digitec-virtual",
    title: "Digitec Virtual",
    type: "Website",
    service: "websites",
    summary:
      "A service website for a virtual assistant business, built to win clients online with a portfolio-style layout and search-friendly pages.",
  },
  {
    slug: "kifaru-liquor",
    title: "Kifaru Liquor",
    type: "E-commerce website",
    service: "websites",
    summary:
      "An e-commerce-ready website for a liquor retail brand, designed around product discovery and a clean ordering experience.",
  },
  {
    slug: "kifaru-landscaping",
    title: "Kifaru Landscaping",
    type: "Website",
    service: "websites",
    summary:
      "A service website for a landscaping business that showcases project work and turns local searches into enquiries.",
  },
  {
    slug: "kifaru-inc",
    title: "Kifaru Inc",
    type: "Corporate website",
    service: "websites",
    summary:
      "A corporate website for the Kifaru Inc group, bringing its business lines together under one consistent web presence.",
  },
  {
    slug: "jimmy-group",
    title: "Jimmy Group",
    type: "Corporate website",
    service: "websites",
    summary:
      "A group website presenting Jimmy Group's portfolio of businesses through a single, credible front door.",
  },
  {
    slug: "ulc",
    title: "ULC",
    type: "Brand & social design",
    service: "launch-and-grow",
    summary:
      "Social media posters and brand assets that keep ULC's presence consistent across platforms.",
  },
];

/** Projects with a full write-up get their own /work/[slug] page. */
export const CASE_STUDIES = PROJECTS.filter((p) => p.story);
export const PROJECT_BY_SLUG = new Map(PROJECTS.map((p) => [p.slug, p]));
