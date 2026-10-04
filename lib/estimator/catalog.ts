/**
 * Estimator catalog — the structural half of the estimator (spec §5–§7).
 *
 * Prices here are only DEFAULTS: they seed the database, and the owner edits
 * live prices in /cockpit/pricing. Structure (ids, categories, dependencies,
 * preview definitions, industry recommendations) ships with code.
 */

export type CategoryId =
  | "pages"
  | "commerce"
  | "bookings"
  | "customers"
  | "growth"
  | "integrations"
  | "monthly";

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: "pages", name: "Pages & Content" },
  { id: "commerce", name: "Shop & Payments" },
  { id: "bookings", name: "Bookings & Scheduling" },
  { id: "customers", name: "Customers & Portals" },
  { id: "growth", name: "Growth & Visibility" },
  { id: "integrations", name: "Integrations & Operations" },
  { id: "monthly", name: "Monthly Care Plans" },
];

/** Visual archetypes the live preview knows how to draw. */
export type SectionKind =
  "grid" | "calendar" | "gallery" | "list" | "form" | "banner" | "quotes";

export interface ModulePreview {
  /** Adds a page to the navigation. */
  nav?: string;
  /** Adds a homepage section. */
  section?: { kind: SectionKind; title: string };
  /** Adds an icon to the site header. */
  headerIcon?: "cart" | "user" | "globe" | "search";
  /** Adds a badge to the footer (payment methods etc.). */
  badge?: string;
  /** No public UI — shown in the "Behind the scenes" panel. */
  backend?: string;
  /** Floating widget in the corner (chat). */
  widget?: "chat" | "ai";
}

export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  defaultPriceKes: number;
  /** Quantity-priced modules (per page / per language). */
  unit?: string;
  monthly?: boolean;
  /** Auto-added when this module is selected. */
  requires?: string;
  /** Rough build effort, for the delivery estimate. */
  days: number;
  preview: ModulePreview;
}

export const BASE = {
  name: "Standard Website",
  defaultPriceKes: 30_000,
  days: 14,
  includes: [
    "Home, About, Services & Contact pages",
    "Admin dashboard to edit content and see enquiries",
    "Embedded Google Map",
    "WhatsApp chat button",
    "Basic SEO & GEO (Google + AI-assistant ready)",
    "Mobile responsive + SSL",
    "Hosting & domain included for the first year",
  ],
};

export const MODULES: ModuleDef[] = [
  // ── Pages & Content ────────────────────────────────────────────────
  {
    id: "extra-page",
    name: "Extra page",
    description: "Any additional page — e.g. a page per service or location.",
    category: "pages",
    defaultPriceKes: 5_000,
    unit: "page",
    days: 1,
    preview: { nav: "More" },
  },
  {
    id: "blog",
    name: "Blog / News",
    description: "Publish articles with categories and SEO per post.",
    category: "pages",
    defaultPriceKes: 12_000,
    days: 3,
    preview: {
      nav: "Blog",
      section: { kind: "grid", title: "Latest articles" },
    },
  },
  {
    id: "portfolio",
    name: "Portfolio / Gallery",
    description: "Showcase projects or photos with filters.",
    category: "pages",
    defaultPriceKes: 10_000,
    days: 2,
    preview: {
      nav: "Portfolio",
      section: { kind: "gallery", title: "Our work" },
    },
  },
  {
    id: "testimonials",
    name: "Testimonials & Reviews",
    description: "Client reviews, including your Google reviews.",
    category: "pages",
    defaultPriceKes: 6_000,
    days: 1,
    preview: { section: { kind: "quotes", title: "What clients say" } },
  },
  {
    id: "faq",
    name: "FAQ section",
    description: "Answer common questions — boosts Google rich results.",
    category: "pages",
    defaultPriceKes: 4_000,
    days: 1,
    preview: { section: { kind: "list", title: "Frequently asked questions" } },
  },
  {
    id: "team",
    name: "Team / Staff profiles",
    description: "Introduce your people with photos and roles.",
    category: "pages",
    defaultPriceKes: 6_000,
    days: 1,
    preview: { nav: "Team", section: { kind: "grid", title: "Meet the team" } },
  },
  {
    id: "video",
    name: "Video gallery",
    description: "YouTube / Vimeo videos in a tidy gallery.",
    category: "pages",
    defaultPriceKes: 8_000,
    days: 1,
    preview: { section: { kind: "gallery", title: "Videos" } },
  },
  {
    id: "downloads",
    name: "Downloads library",
    description: "Brochures, price lists and documents to download.",
    category: "pages",
    defaultPriceKes: 6_000,
    days: 1,
    preview: {
      nav: "Resources",
      section: { kind: "list", title: "Downloads" },
    },
  },
  {
    id: "multilingual",
    name: "Extra language",
    description: "Translate the site — e.g. Swahili or French.",
    category: "pages",
    defaultPriceKes: 15_000,
    unit: "language",
    days: 3,
    preview: { headerIcon: "globe" },
  },
  {
    id: "careers",
    name: "Careers / Job board",
    description: "List vacancies and receive applications.",
    category: "pages",
    defaultPriceKes: 15_000,
    days: 3,
    preview: {
      nav: "Careers",
      section: { kind: "list", title: "Open positions" },
    },
  },
  {
    id: "events",
    name: "Events calendar",
    description: "Show upcoming events and dates.",
    category: "pages",
    defaultPriceKes: 12_000,
    days: 2,
    preview: {
      nav: "Events",
      section: { kind: "calendar", title: "Upcoming events" },
    },
  },
  {
    id: "newsletter",
    name: "Newsletter signup",
    description: "Grow an email list (Mailchimp / Brevo).",
    category: "pages",
    defaultPriceKes: 6_000,
    days: 1,
    preview: {
      section: { kind: "banner", title: "Subscribe to our newsletter" },
    },
  },

  // ── Shop & Payments ────────────────────────────────────────────────
  {
    id: "catalogue",
    name: "Product catalogue",
    description: "Show products with prices; customers order via WhatsApp.",
    category: "commerce",
    defaultPriceKes: 15_000,
    days: 3,
    preview: {
      nav: "Products",
      section: { kind: "grid", title: "Our products" },
    },
  },
  {
    id: "shop",
    name: "Online shop / E-commerce",
    description: "Cart, checkout and order management — up to 100 products.",
    category: "commerce",
    defaultPriceKes: 45_000,
    days: 10,
    preview: {
      nav: "Shop",
      section: { kind: "grid", title: "Shop best sellers" },
      headerIcon: "cart",
    },
  },
  {
    id: "large-catalogue",
    name: "Large catalogue (100+ products)",
    description: "Search, filters and bulk import for big ranges.",
    category: "commerce",
    defaultPriceKes: 20_000,
    requires: "shop",
    days: 4,
    preview: { headerIcon: "search" },
  },
  {
    id: "mpesa",
    name: "M-Pesa checkout (STK Push)",
    description: "Customers pay instantly from their phone.",
    category: "commerce",
    defaultPriceKes: 20_000,
    days: 4,
    preview: { badge: "M-PESA" },
  },
  {
    id: "cards",
    name: "Card & international payments",
    description:
      "Visa, Mastercard and more via Pesapal / Flutterwave / Stripe.",
    category: "commerce",
    defaultPriceKes: 25_000,
    days: 4,
    preview: { badge: "VISA · MASTERCARD" },
  },
  {
    id: "inventory",
    name: "Inventory management",
    description: "Track stock levels and low-stock alerts.",
    category: "commerce",
    defaultPriceKes: 35_000,
    requires: "shop",
    days: 7,
    preview: { backend: "Inventory" },
  },
  {
    id: "delivery",
    name: "Delivery zones & fees",
    description: "Charge delivery by area or distance.",
    category: "commerce",
    defaultPriceKes: 12_000,
    requires: "shop",
    days: 2,
    preview: { backend: "Delivery zones" },
  },
  {
    id: "order-tracking",
    name: "Order tracking",
    description: "Customers follow their order status.",
    category: "commerce",
    defaultPriceKes: 15_000,
    requires: "shop",
    days: 3,
    preview: { nav: "Track order" },
  },
  {
    id: "discounts",
    name: "Discount codes & promotions",
    description: "Coupons, sales and special offers.",
    category: "commerce",
    defaultPriceKes: 8_000,
    requires: "shop",
    days: 2,
    preview: {
      section: { kind: "banner", title: "Use code SAVE10 for 10% off" },
    },
  },
  {
    id: "marketplace",
    name: "Multi-vendor marketplace",
    description: "Let many sellers list and sell on your platform.",
    category: "commerce",
    defaultPriceKes: 120_000,
    requires: "shop",
    days: 25,
    preview: {
      nav: "Sellers",
      section: { kind: "grid", title: "Top sellers" },
    },
  },
  {
    id: "subscriptions",
    name: "Subscriptions / recurring billing",
    description: "Memberships, boxes or software plans billed monthly.",
    category: "commerce",
    defaultPriceKes: 40_000,
    days: 8,
    preview: {
      nav: "Plans",
      section: { kind: "grid", title: "Choose a plan" },
    },
  },

  // ── Bookings & Scheduling ──────────────────────────────────────────
  {
    id: "appointments",
    name: "Appointment booking",
    description: "Clients pick a time slot and book online.",
    category: "bookings",
    defaultPriceKes: 25_000,
    days: 5,
    preview: {
      nav: "Book",
      section: { kind: "calendar", title: "Book an appointment" },
    },
  },
  {
    id: "tables",
    name: "Table reservations",
    description: "Reserve a table by date, time and party size.",
    category: "bookings",
    defaultPriceKes: 20_000,
    days: 4,
    preview: {
      nav: "Reserve",
      section: { kind: "calendar", title: "Reserve a table" },
    },
  },
  {
    id: "rooms",
    name: "Room / property booking engine",
    description: "Availability calendar and online booking for rooms or units.",
    category: "bookings",
    defaultPriceKes: 60_000,
    days: 12,
    preview: {
      nav: "Rooms",
      section: { kind: "calendar", title: "Check availability" },
    },
  },
  {
    id: "rentals",
    name: "Vehicle / equipment rentals",
    description: "Book cars or equipment by date range.",
    category: "bookings",
    defaultPriceKes: 45_000,
    days: 9,
    preview: {
      nav: "Fleet",
      section: { kind: "grid", title: "Available for hire" },
    },
  },
  {
    id: "classes",
    name: "Class & course schedule",
    description: "Weekly timetable for classes or sessions.",
    category: "bookings",
    defaultPriceKes: 18_000,
    days: 3,
    preview: {
      nav: "Schedule",
      section: { kind: "calendar", title: "Class timetable" },
    },
  },
  {
    id: "tickets",
    name: "Event ticketing",
    description: "Sell tickets with QR codes and door check-in.",
    category: "bookings",
    defaultPriceKes: 40_000,
    days: 8,
    preview: {
      nav: "Tickets",
      section: { kind: "grid", title: "Get your tickets" },
    },
  },
  {
    id: "tours",
    name: "Tour packages & enquiries",
    description: "Itineraries, pricing tiers and enquiry forms.",
    category: "bookings",
    defaultPriceKes: 20_000,
    days: 4,
    preview: {
      nav: "Tours",
      section: { kind: "grid", title: "Popular packages" },
    },
  },

  // ── Customers & Portals ────────────────────────────────────────────
  {
    id: "accounts",
    name: "Customer accounts / login",
    description: "Customers sign in to see orders and details.",
    category: "customers",
    defaultPriceKes: 25_000,
    days: 5,
    preview: { headerIcon: "user" },
  },
  {
    id: "portal",
    name: "Client portal",
    description: "Documents, invoices and project status for your clients.",
    category: "customers",
    defaultPriceKes: 50_000,
    days: 10,
    preview: { nav: "Client portal", headerIcon: "user" },
  },
  {
    id: "loyalty",
    name: "Loyalty & rewards",
    description: "Points and rewards that bring customers back.",
    category: "customers",
    defaultPriceKes: 30_000,
    requires: "accounts",
    days: 6,
    preview: {
      section: { kind: "banner", title: "Earn points on every visit" },
    },
  },
  {
    id: "courses",
    name: "Online courses (LMS)",
    description: "Lessons, quizzes and certificates.",
    category: "customers",
    defaultPriceKes: 70_000,
    days: 15,
    preview: {
      nav: "Courses",
      section: { kind: "grid", title: "Start learning" },
    },
  },
  {
    id: "membership",
    name: "Membership / members area",
    description: "Gated content for members or donors.",
    category: "customers",
    defaultPriceKes: 30_000,
    days: 6,
    preview: { nav: "Members", headerIcon: "user" },
  },
  {
    id: "donations",
    name: "Donations",
    description: "One-off and recurring giving.",
    category: "customers",
    defaultPriceKes: 18_000,
    days: 4,
    preview: {
      nav: "Give",
      section: { kind: "banner", title: "Support our mission — Donate" },
    },
  },
  {
    id: "directory",
    name: "Directory / listings with search",
    description: "Searchable listings with filters.",
    category: "customers",
    defaultPriceKes: 40_000,
    days: 8,
    preview: {
      nav: "Directory",
      section: { kind: "list", title: "Browse listings" },
      headerIcon: "search",
    },
  },
  {
    id: "listings",
    name: "Property listings & search",
    description: "Properties with photos, filters and enquiry buttons.",
    category: "customers",
    defaultPriceKes: 45_000,
    days: 9,
    preview: {
      nav: "Properties",
      section: { kind: "grid", title: "Featured properties" },
      headerIcon: "search",
    },
  },
  {
    id: "menu",
    name: "Digital menu + QR code",
    description: "Menu online, scannable from the table.",
    category: "customers",
    defaultPriceKes: 10_000,
    days: 2,
    preview: { nav: "Menu", section: { kind: "list", title: "Our menu" } },
  },
  {
    id: "intake",
    name: "Patient / client intake forms",
    description: "Collect details before the first visit.",
    category: "customers",
    defaultPriceKes: 15_000,
    days: 3,
    preview: { section: { kind: "form", title: "New client form" } },
  },
  {
    id: "quote",
    name: "Quote / RFQ request builder",
    description: "Customers describe a job and request a quote.",
    category: "customers",
    defaultPriceKes: 10_000,
    days: 2,
    preview: {
      nav: "Get a quote",
      section: { kind: "form", title: "Request a quote" },
    },
  },
  {
    id: "live-chat",
    name: "Live chat",
    description: "Chat with visitors in real time.",
    category: "customers",
    defaultPriceKes: 8_000,
    days: 1,
    preview: { widget: "chat" },
  },
  {
    id: "ai-chat",
    name: "AI chat assistant",
    description: "Answers questions 24/7, trained on your business.",
    category: "customers",
    defaultPriceKes: 45_000,
    days: 8,
    preview: { widget: "ai" },
  },

  // ── Growth & Visibility ────────────────────────────────────────────
  {
    id: "seo-geo",
    name: "Advanced SEO & GEO",
    description:
      "Keyword research, schema, local SEO and AI-assistant visibility.",
    category: "growth",
    defaultPriceKes: 35_000,
    days: 5,
    preview: { backend: "Advanced SEO & GEO" },
  },
  {
    id: "gbp",
    name: "Google Business Profile setup",
    description: "Show up on Google Maps and local search.",
    category: "growth",
    defaultPriceKes: 6_000,
    days: 1,
    preview: { backend: "Google Business Profile" },
  },
  {
    id: "analytics",
    name: "Analytics & conversion tracking",
    description: "See where visitors come from and what they do.",
    category: "growth",
    defaultPriceKes: 8_000,
    days: 1,
    preview: { backend: "Analytics" },
  },
  {
    id: "social-feed",
    name: "Social media feed",
    description: "Live Instagram / TikTok / Facebook feed.",
    category: "growth",
    defaultPriceKes: 6_000,
    days: 1,
    preview: { section: { kind: "gallery", title: "Follow us" } },
  },
  {
    id: "email-automation",
    name: "Email marketing automation",
    description: "Welcome emails, abandoned-cart reminders and more.",
    category: "growth",
    defaultPriceKes: 15_000,
    days: 3,
    preview: { backend: "Email automation" },
  },
  {
    id: "sms",
    name: "SMS notifications",
    description: "Order and booking alerts by SMS (Africa's Talking).",
    category: "growth",
    defaultPriceKes: 15_000,
    days: 3,
    preview: { backend: "SMS alerts" },
  },
  {
    id: "landing-page",
    name: "Landing page for ads",
    description: "Focused page for Google / Meta ad campaigns.",
    category: "growth",
    defaultPriceKes: 10_000,
    unit: "page",
    days: 2,
    preview: { backend: "Ad landing pages" },
  },

  // ── Integrations & Operations ──────────────────────────────────────
  {
    id: "etims",
    name: "KRA eTIMS invoicing",
    description: "Issue tax-compliant invoices automatically.",
    category: "integrations",
    defaultPriceKes: 40_000,
    days: 7,
    preview: { backend: "KRA eTIMS" },
  },
  {
    id: "accounting",
    name: "Accounting sync",
    description: "QuickBooks / Zoho Books / Xero kept in sync.",
    category: "integrations",
    defaultPriceKes: 30_000,
    days: 6,
    preview: { backend: "Accounting sync" },
  },
  {
    id: "crm",
    name: "CRM integration",
    description: "Send leads straight into HubSpot / Zoho.",
    category: "integrations",
    defaultPriceKes: 20_000,
    days: 4,
    preview: { backend: "CRM" },
  },
  {
    id: "courier",
    name: "Courier / logistics API",
    description: "Book and track deliveries automatically.",
    category: "integrations",
    defaultPriceKes: 25_000,
    days: 5,
    preview: { backend: "Courier API" },
  },
  {
    id: "roles",
    name: "Staff roles & permissions",
    description: "Different access for managers and staff.",
    category: "integrations",
    defaultPriceKes: 15_000,
    days: 3,
    preview: { backend: "Staff roles" },
  },
  {
    id: "reports",
    name: "Reports & analytics dashboard",
    description: "Sales, bookings and enquiries at a glance.",
    category: "integrations",
    defaultPriceKes: 25_000,
    days: 5,
    preview: { backend: "Reports dashboard" },
  },
  {
    id: "mobile-app",
    name: "Mobile app (Android + iOS)",
    description: "Companion app — starting price, confirmed after a call.",
    category: "integrations",
    defaultPriceKes: 250_000,
    days: 45,
    preview: { backend: "Mobile app" },
  },

  // ── Monthly ────────────────────────────────────────────────────────
  {
    id: "maintenance",
    name: "Maintenance & content updates",
    description: "Updates, backups, fixes and content changes each month.",
    category: "monthly",
    defaultPriceKes: 8_000,
    monthly: true,
    days: 0,
    preview: {},
  },
  {
    id: "seo-retainer",
    name: "SEO retainer",
    description: "Ongoing content and ranking work every month.",
    category: "monthly",
    defaultPriceKes: 25_000,
    monthly: true,
    days: 0,
    preview: {},
  },
];

export const MODULE_BY_ID = new Map(MODULES.map((m) => [m.id, m]));

export interface IndustryDef {
  id: string;
  name: string;
  /** lucide-react icon name (see components/estimator/industry-icon.tsx). */
  icon: string;
  /** Primary call to action shown in the preview hero. */
  cta: string;
  recommended: string[];
}

export const INDUSTRIES: IndustryDef[] = [
  {
    id: "restaurant",
    name: "Restaurants & Cafés",
    icon: "UtensilsCrossed",
    cta: "Book a table",
    recommended: ["menu", "tables", "mpesa", "delivery", "testimonials"],
  },
  {
    id: "bar",
    name: "Bars & Lounges",
    icon: "Wine",
    cta: "See what's on",
    recommended: ["menu", "events", "tickets", "portfolio"],
  },
  {
    id: "bakery",
    name: "Bakeries & Catering",
    icon: "CakeSlice",
    cta: "Order now",
    recommended: ["catalogue", "shop", "mpesa", "delivery", "quote"],
  },
  {
    id: "hotel",
    name: "Hotels & Lodges",
    icon: "Hotel",
    cta: "Check availability",
    recommended: [
      "rooms",
      "cards",
      "portfolio",
      "multilingual",
      "testimonials",
    ],
  },
  {
    id: "short-stay",
    name: "Airbnb & Short Stays",
    icon: "BedDouble",
    cta: "Book your stay",
    recommended: ["rooms", "mpesa", "cards", "portfolio"],
  },
  {
    id: "tours",
    name: "Tours, Travel & Safaris",
    icon: "Compass",
    cta: "Plan your safari",
    recommended: ["tours", "cards", "multilingual", "portfolio", "blog"],
  },
  {
    id: "real-estate",
    name: "Real Estate & Property",
    icon: "Building2",
    cta: "Find a property",
    recommended: ["listings", "portfolio", "quote", "live-chat", "seo-geo"],
  },
  {
    id: "retail",
    name: "Retail Shops",
    icon: "Store",
    cta: "Shop now",
    recommended: ["shop", "mpesa", "inventory", "delivery", "discounts"],
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    icon: "Shirt",
    cta: "Shop the collection",
    recommended: ["shop", "mpesa", "social-feed", "discounts", "cards"],
  },
  {
    id: "electronics",
    name: "Electronics & Phones",
    icon: "Smartphone",
    cta: "Shop deals",
    recommended: [
      "shop",
      "large-catalogue",
      "mpesa",
      "inventory",
      "order-tracking",
    ],
  },
  {
    id: "hardware",
    name: "Hardware & Building Supplies",
    icon: "Hammer",
    cta: "Request a quote",
    recommended: ["catalogue", "quote", "large-catalogue", "delivery"],
  },
  {
    id: "supermarket",
    name: "Supermarkets & Groceries",
    icon: "ShoppingBasket",
    cta: "Order groceries",
    recommended: ["shop", "large-catalogue", "inventory", "delivery", "mpesa"],
  },
  {
    id: "salon",
    name: "Salons, Barbers & Spas",
    icon: "Scissors",
    cta: "Book an appointment",
    recommended: ["appointments", "mpesa", "portfolio", "loyalty"],
  },
  {
    id: "beauty",
    name: "Beauty & Cosmetics Brands",
    icon: "Sparkles",
    cta: "Shop beauty",
    recommended: ["shop", "mpesa", "social-feed", "testimonials"],
  },
  {
    id: "gym",
    name: "Gyms & Fitness",
    icon: "Dumbbell",
    cta: "Join today",
    recommended: ["classes", "subscriptions", "accounts", "mpesa"],
  },
  {
    id: "clinic",
    name: "Hospitals & Clinics",
    icon: "Hospital",
    cta: "Book an appointment",
    recommended: ["appointments", "intake", "team", "faq"],
  },
  {
    id: "dental",
    name: "Dental & Specialist Practices",
    icon: "Stethoscope",
    cta: "Book a check-up",
    recommended: ["appointments", "intake", "testimonials", "seo-geo"],
  },
  {
    id: "pharmacy",
    name: "Pharmacies",
    icon: "Pill",
    cta: "Order medicine",
    recommended: ["catalogue", "shop", "mpesa", "delivery"],
  },
  {
    id: "vet",
    name: "Veterinary",
    icon: "PawPrint",
    cta: "Book a visit",
    recommended: ["appointments", "intake", "blog"],
  },
  {
    id: "school",
    name: "Schools & Colleges",
    icon: "School",
    cta: "Apply now",
    recommended: ["events", "downloads", "careers", "accounts"],
  },
  {
    id: "training",
    name: "Training & Online Courses",
    icon: "GraduationCap",
    cta: "Start learning",
    recommended: ["courses", "mpesa", "cards", "subscriptions"],
  },
  {
    id: "church",
    name: "Churches & Religious Orgs",
    icon: "Church",
    cta: "Join us this Sunday",
    recommended: ["donations", "events", "video", "blog"],
  },
  {
    id: "ngo",
    name: "NGOs & Non-profits",
    icon: "HandHeart",
    cta: "Donate",
    recommended: ["donations", "blog", "downloads", "multilingual", "cards"],
  },
  {
    id: "law",
    name: "Law Firms",
    icon: "Scale",
    cta: "Book a consultation",
    recommended: ["team", "intake", "blog", "appointments"],
  },
  {
    id: "consulting",
    name: "Accounting & Consulting",
    icon: "Calculator",
    cta: "Book a consultation",
    recommended: ["appointments", "portal", "blog", "downloads"],
  },
  {
    id: "finance",
    name: "Insurance, SACCOs & Finance",
    icon: "Landmark",
    cta: "Get a quote",
    recommended: ["accounts", "portal", "downloads", "live-chat"],
  },
  {
    id: "construction",
    name: "Construction & Engineering",
    icon: "HardHat",
    cta: "Request a quote",
    recommended: ["portfolio", "quote", "downloads", "careers"],
  },
  {
    id: "interior",
    name: "Interior Design & Architecture",
    icon: "Sofa",
    cta: "Start your project",
    recommended: ["portfolio", "quote", "blog"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Distribution",
    icon: "Factory",
    cta: "Request a quote",
    recommended: ["catalogue", "quote", "large-catalogue", "crm"],
  },
  {
    id: "logistics",
    name: "Logistics & Transport",
    icon: "Truck",
    cta: "Get a quote",
    recommended: ["quote", "order-tracking", "courier", "accounts"],
  },
  {
    id: "car-dealer",
    name: "Car Dealers",
    icon: "Car",
    cta: "Browse cars",
    recommended: ["directory", "portfolio", "quote", "live-chat"],
  },
  {
    id: "car-hire",
    name: "Car Hire & Rentals",
    icon: "KeyRound",
    cta: "Hire a car",
    recommended: ["rentals", "mpesa", "cards"],
  },
  {
    id: "garage",
    name: "Garages & Auto Services",
    icon: "Wrench",
    cta: "Book a service",
    recommended: ["appointments", "quote", "testimonials"],
  },
  {
    id: "agriculture",
    name: "Agriculture & Agribusiness",
    icon: "Tractor",
    cta: "Order produce",
    recommended: ["catalogue", "quote", "blog", "sms"],
  },
  {
    id: "events",
    name: "Events, Weddings & Venues",
    icon: "PartyPopper",
    cta: "Plan your event",
    recommended: ["tickets", "portfolio", "appointments", "quote"],
  },
  {
    id: "photography",
    name: "Photography & Creatives",
    icon: "Camera",
    cta: "Book a shoot",
    recommended: ["portfolio", "appointments", "shop"],
  },
  {
    id: "media",
    name: "Media, News & Bloggers",
    icon: "Newspaper",
    cta: "Read the latest",
    recommended: ["blog", "newsletter", "subscriptions", "video"],
  },
  {
    id: "tech",
    name: "Tech Startups & SaaS",
    icon: "Rocket",
    cta: "Start free trial",
    recommended: ["subscriptions", "accounts", "blog", "analytics", "cards"],
  },
  {
    id: "recruitment",
    name: "Recruitment & HR Agencies",
    icon: "Briefcase",
    cta: "Find a job",
    recommended: ["careers", "accounts", "blog"],
  },
  {
    id: "cleaning",
    name: "Cleaning & Home Services",
    icon: "SprayCan",
    cta: "Book a clean",
    recommended: ["appointments", "quote", "mpesa", "testimonials"],
  },
  {
    id: "security",
    name: "Security Companies",
    icon: "ShieldCheck",
    cta: "Get a quote",
    recommended: ["quote", "team", "downloads"],
  },
  {
    id: "energy",
    name: "Solar, Water & Energy",
    icon: "Sun",
    cta: "Get a quote",
    recommended: ["catalogue", "quote", "portfolio", "blog"],
  },
  {
    id: "personal-brand",
    name: "Personal Brand / Coach / Speaker",
    icon: "Mic",
    cta: "Book a session",
    recommended: ["appointments", "blog", "courses", "newsletter"],
  },
  {
    id: "marketplace",
    name: "Online Marketplace",
    icon: "ShoppingBag",
    cta: "Start shopping",
    recommended: ["marketplace", "mpesa", "cards", "testimonials"],
  },
  {
    id: "other",
    name: "Other / not listed",
    icon: "LayoutGrid",
    cta: "Get in touch",
    recommended: [],
  },
];

export const INDUSTRY_BY_ID = new Map(INDUSTRIES.map((i) => [i.id, i]));
