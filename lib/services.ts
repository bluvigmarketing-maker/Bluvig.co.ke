import {
  Blocks,
  Globe,
  LayoutDashboard,
  Rocket,
  Smartphone,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * The service lineup (MILESTONES.md Phase 1). One entry drives the home grid,
 * /services, each /services/[slug] page, the menu, sitemap and structured data.
 *
 * Prices: only websites have a published price (from the live price list);
 * everything else is quoted after a discovery call.
 */
export interface Service {
  slug: string;
  title: string;
  /** Menu / card label. */
  short: string;
  icon: LucideIcon;
  /** One line for cards. */
  summary: string;
  heroTitle: string;
  heroDescription: string;
  /** "The problem it solves". */
  problem: string;
  included: string[];
  examples: string[];
  stack: string[];
  /** Websites get an instant quotation; the rest start with a call. */
  quote: "instant" | "call";
  faq: { q: string; a: string }[];
  /** Supporting service — shown last and smaller. */
  supporting?: boolean;
}

const PAYMENT_FAQ = {
  q: "How do payments work?",
  a: "A 60% deposit starts the work and the remaining 40% is due at launch. You can ask for a free prototype first, so you see the direction before paying anything. Clients in Kenya pay by M-Pesa or bank; international clients are invoiced in USD.",
};

export const SERVICES: Service[] = [
  {
    slug: "custom-software",
    title: "Custom Business Software",
    short: "Custom Software",
    icon: LayoutDashboard,
    summary:
      "Internal systems built around how your business actually works — inventory, sales, operations dashboards and workflow automation.",
    heroTitle: "Software Built Around Your Business",
    heroDescription:
      "Replace the spreadsheets, paper forms and copy-paste between apps with one system your team actually wants to use.",
    problem:
      "Most growing businesses run on a patchwork of spreadsheets, WhatsApp groups and off-the-shelf tools that almost fit. Data lives in five places, reports take a day to compile, and mistakes slip through. Custom software puts your process in one place — shaped around how you work, not the other way round.",
    included: [
      "Discovery workshop to map your process and priorities",
      "Clickable prototype before any code is written",
      "Role-based access for staff, managers and owners",
      "Dashboards and reports that update themselves",
      "Integrations with M-Pesa, accounting and the tools you already use",
      "Training for your team and support after launch",
    ],
    examples: [
      "Inventory and stock control across branches",
      "Sales, orders and invoicing system",
      "Operations dashboard for owners and managers",
      "Approval workflows (purchases, leave, payments)",
      "Client and job management for service businesses",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Cloud hosting"],
    quote: "call",
    faq: [
      {
        q: "How much does custom software cost?",
        a: "It depends on the number of users, screens and integrations. We give you a fixed, itemised quote after a free discovery call — and we can split a big system into phases so you start using the most valuable part first.",
      },
      {
        q: "Can you work with our existing systems?",
        a: "Usually, yes. We connect to tools that offer an API or data export, and we can migrate data from spreadsheets and older systems.",
      },
      PAYMENT_FAQ,
    ],
  },
  {
    slug: "web-applications",
    title: "Web Applications & Portals",
    short: "Web Apps & Portals",
    icon: Blocks,
    summary:
      "Customer portals, booking and ordering systems, and SaaS products — fast, secure and built to grow with you.",
    heroTitle: "Web Apps Your Customers Love Using",
    heroDescription:
      "Customer portals, booking and ordering systems, and new SaaS products — designed for real users and built to scale.",
    problem:
      "Your customers expect to book, order, pay and check their status online without calling you. A well-built web app does that around the clock, cuts admin work and gives you data on what customers actually do.",
    included: [
      "Product discovery and user flows",
      "UI/UX design and clickable prototype",
      "Secure sign-in, roles and permissions",
      "Payments (M-Pesa, cards) and notifications (SMS, email, WhatsApp)",
      "Admin dashboard for your team",
      "Hosting, monitoring and backups",
    ],
    examples: [
      "Customer self-service portal",
      "Online booking and appointment system",
      "Ordering and delivery tracking",
      "Membership or subscription platform",
      "MVP for a new SaaS product",
    ],
    stack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Vercel"],
    quote: "call",
    faq: [
      {
        q: "Can you build an MVP for my startup?",
        a: "Yes. We help you cut the idea down to the smallest version that proves it works, ship that first, and grow it from real user feedback.",
      },
      {
        q: "Will it work on phones?",
        a: "Every web app we build is mobile-first and works in any modern browser — no app store needed.",
      },
      PAYMENT_FAQ,
    ],
  },
  {
    slug: "mobile-apps",
    title: "Mobile Apps",
    short: "Mobile Apps",
    icon: Smartphone,
    summary:
      "Android and iOS apps from one codebase — for your customers, field teams or drivers.",
    heroTitle: "Mobile Apps for Android and iOS",
    heroDescription:
      "One codebase, both app stores — for your customers, your field staff or your delivery riders.",
    problem:
      "Some jobs need to live on a phone: field teams recording visits offline, customers ordering in two taps, drivers updating deliveries. A mobile app puts your service in your customer's pocket and your operations in your team's hands.",
    included: [
      "App design for Android and iOS",
      "Offline mode where your users need it",
      "Push notifications and in-app payments",
      "Admin dashboard to manage content and users",
      "App Store and Google Play submission",
      "Updates and support after launch",
    ],
    examples: [
      "Customer ordering and loyalty app",
      "Field-team data collection with offline sync",
      "Delivery and rider tracking app",
      "Companion app for an existing web system",
    ],
    stack: ["React Native", "TypeScript", "Node.js", "PostgreSQL"],
    quote: "call",
    faq: [
      {
        q: "Do I need a mobile app or a web app?",
        a: "If your users need offline access, the camera, GPS or push notifications, an app makes sense. Otherwise a mobile-friendly web app is faster and cheaper to build — we'll tell you honestly on the call.",
      },
      {
        q: "Do you publish the app for us?",
        a: "Yes — we handle the Google Play and App Store submissions under your developer accounts, so the apps belong to you.",
      },
      PAYMENT_FAQ,
    ],
  },
  {
    slug: "websites",
    title: "Websites",
    short: "Websites",
    icon: Globe,
    summary:
      "Fast, mobile-first business websites and online shops — priced instantly, with your design previewed live.",
    heroTitle: "Websites That Bring You Customers",
    heroDescription:
      "Fast, mobile-first business websites and online shops. Pick your features and see your price instantly — no waiting for a quote.",
    problem:
      "A slow, outdated or hard-to-use website loses customers before they ever call you. We build sites that load fast on any phone, show up on Google, and turn visitors into enquiries, bookings and sales.",
    included: [
      "Design tailored to your industry and brand",
      "Mobile-first and fast on Kenyan networks",
      "Domain, hosting and SSL for the first year",
      "Google-ready: search setup and Google Business Profile",
      "WhatsApp, calls and enquiry forms wired in",
      "Online payments and shop features if you need them",
    ],
    examples: [
      "Business and service websites",
      "Online shops with M-Pesa checkout",
      "Restaurant menus and table bookings",
      "School, clinic and hotel websites",
      "Landing pages for campaigns",
    ],
    stack: ["Next.js", "Tailwind CSS", "Vercel", "Google Search Console"],
    quote: "instant",
    faq: [
      {
        q: "How much does a website cost?",
        a: "Use our quotation page to pick your industry and features — you see the exact price, timeline and a live preview, and get a proforma invoice on the spot.",
      },
      {
        q: "Can I update the website myself?",
        a: "Yes. Add a content editor to your package and you can change text, photos and products yourself.",
      },
      PAYMENT_FAQ,
    ],
  },
  {
    slug: "integrations",
    title: "Integrations & Payments",
    short: "Integrations & M-Pesa",
    icon: Workflow,
    summary:
      "M-Pesa (Daraja), card payments, KRA eTIMS and third-party APIs — connected so your systems talk to each other.",
    heroTitle: "M-Pesa, eTIMS and APIs — Connected",
    heroDescription:
      "Take payments automatically, stay compliant with KRA eTIMS, and connect the systems your business already uses.",
    problem:
      "Manually matching M-Pesa messages to orders, re-typing invoices into another system, exporting and importing spreadsheets — it's slow and error-prone. Integrations make your tools pass data to each other automatically.",
    included: [
      "M-Pesa Daraja: STK Push, Paybill/Till (C2B), payouts (B2C) and reconciliation",
      "Card and international payment gateways",
      "KRA eTIMS invoicing integration",
      "SMS, email and WhatsApp notifications",
      "Accounting, CRM and ERP connections via their APIs",
      "Webhooks, error alerts and logs so nothing is lost silently",
    ],
    examples: [
      "STK Push checkout on your website or app",
      "Automatic M-Pesa payment matching for invoices",
      "eTIMS-compliant invoices from your sales system",
      "Order alerts to WhatsApp or SMS",
    ],
    stack: ["Safaricom Daraja API", "Node.js", "TypeScript", "Webhooks"],
    quote: "call",
    faq: [
      {
        q: "Do I need a Paybill or Till number first?",
        a: "Yes — M-Pesa integrations run on your own Paybill or Till so the money goes straight to you. We guide you through getting API access from Safaricom.",
      },
      {
        q: "Can you add M-Pesa to a system someone else built?",
        a: "Often, yes. We review the existing code first and tell you what's involved before you commit.",
      },
      PAYMENT_FAQ,
    ],
  },
  {
    slug: "launch-and-grow",
    title: "Launch & Grow",
    short: "Launch & Grow",
    icon: Rocket,
    summary:
      "SEO, Google Business Profile, analytics and launch content — so what we build actually gets found and used.",
    heroTitle: "Get Found After You Launch",
    heroDescription:
      "SEO, Google Business Profile, analytics, brand assets and team training — making sure what we build gets found, trusted and used.",
    problem:
      "Launching is the start, not the finish. Without search visibility, measurement and a team that knows the new system, even great software sits unused. We help you get found on Google and AI assistants, measure what works, and train your people.",
    included: [
      "Technical SEO and search-ready content",
      "Google Business Profile setup and optimisation",
      "Visibility in AI assistants like ChatGPT and Gemini",
      "Analytics and conversion tracking",
      "Launch graphics and brand assets",
      "Hands-on training for your team",
    ],
    examples: [
      "SEO for a new website or web app",
      "Local SEO for service businesses",
      "Monthly visibility and analytics reports",
      "Digital marketing training for your staff",
    ],
    stack: ["Google Search Console", "Google Analytics", "Google Business Profile"],
    quote: "call",
    supporting: true,
    faq: [
      {
        q: "Do you only do SEO for sites you built?",
        a: "No — we can work on an existing site too, starting with an audit of what's holding it back.",
      },
      {
        q: "How long until SEO shows results?",
        a: "Technical fixes and Google Business Profile changes can help within weeks; content-driven rankings usually take a few months. We report progress monthly so you can see it.",
      },
    ],
  },
];

export const SERVICE_BY_SLUG = new Map(SERVICES.map((s) => [s.slug, s]));
