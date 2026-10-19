import type { PortfolioProject } from "@/lib/portfolio-shared";

/**
 * The portfolio as first loaded from the projects spreadsheet (Documents\
 * Bluvig Portfolio Projects Template.xlsx). Used until the cockpit's Portfolio
 * tab saves its own copy, and as the fallback if the database is unreachable.
 */
export const PORTFOLIO_SEED: PortfolioProject[] = [
  {
    "id": "rich-g-collection",
    "title": "Rich G Collection",
    "type": "E-commerce website",
    "service": "websites",
    "summary": "An online clothing store for Rich G Collection, a Nairobi menswear brand with a fitness lifestyle, with collections, product pages, customer accounts and a cart.",
    "year": "2026",
    "visible": true,
    "featured": true,
    "link": "https://www.richgcollection.com/",
    "industry": "Fitness and lifestyle",
    "location": "Nairobi, Kenya",
    "features": [
      "Online clothing shop with collections (active wear, shirts, T-shirts, trousers)",
      "Featured and new-arrival product listings",
      "Customer accounts and cart",
      "Push-Up Challenge page",
      "WhatsApp, call and email contact"
    ],
    "stack": [
      "Next.js"
    ],
    "own": false,
    "image": "/work/rich-g-collection.webp",
    "imagePhone": "/work/rich-g-collection-phone.webp"
  },
  {
    "id": "kinyanjui-advocates",
    "title": "Kinyanjui Advocates",
    "client": "Kinyanjui T.W & Co. Advocates",
    "type": "Law firm website",
    "service": "websites",
    "summary": "A website for Kinyanjui T.W & Co. Advocates, a law firm in Ruiru, presenting its five practice areas and team, with consultation requests and an online enquiry form.",
    "year": "2026",
    "visible": true,
    "featured": true,
    "link": "https://www.kinyanjuiadvocates.com/",
    "industry": "Law",
    "location": "Ruiru, Kenya",
    "features": [
      "Pages for five practice areas",
      "Team profiles",
      "Book a Consultation calls to action throughout",
      "Online enquiry form",
      "Office details, hours, click-to-call and email"
    ],
    "stack": [
      "Next.js"
    ],
    "own": false,
    "image": "/work/kinyanjui-advocates.webp",
    "imagePhone": "/work/kinyanjui-advocates-phone.webp"
  },
  {
    "id": "kifaru-liquor",
    "title": "Kifaru Liquor",
    "type": "E-commerce website",
    "service": "websites",
    "summary": "An online liquor store for Kifaru Liquor with drinks across 13 categories, product search, sale pricing and home delivery, behind an 18+ age check.",
    "year": "2025",
    "visible": true,
    "featured": true,
    "link": "https://liqour.kifaru.ke/",
    "industry": "Food and Beverages",
    "location": "Ngong, Kajiado County, Kenya",
    "features": [
      "Age verification (18+) on entry",
      "Online shop with 13 drink categories (beers, spirits, wines and more)",
      "Product search",
      "Sale pricing, cart and online ordering",
      "Home delivery"
    ],
    "stack": [
      "WordPress",
      "WooCommerce",
      "Elementor"
    ],
    "own": false
  },
  {
    "id": "kifaru-car-hire",
    "title": "Kifaru Car Hire",
    "client": "Kifaru Car Hire & Leasing",
    "type": "Car hire website",
    "service": "websites",
    "summary": "A website for Kifaru Car Hire & Leasing, which hires and leases Toyota Land Cruiser Prados across Kenya, with fleet listings, quote requests and pages for corporate, leasing and expat clients.",
    "year": "2026",
    "visible": true,
    "featured": true,
    "link": "https://carhire.kifaru.ke/",
    "industry": "Automotives",
    "location": "Nairobi, Kisumu, Mombasa, Nanyuki and Nakuru, Kenya",
    "features": [
      "Fleet listings with vehicle specs",
      "Get a Quote, Request a Callback and enquiry form",
      "Corporate, leasing and expat hire pages",
      "List Your Car page for owners",
      "Google reviews, FAQs, WhatsApp and dark mode"
    ],
    "stack": [
      "Next.js"
    ],
    "own": false,
    "image": "/work/kifaru-car-hire.webp",
    "imagePhone": "/work/kifaru-car-hire-phone.webp"
  },
  {
    "id": "kifaru-inc",
    "title": "Kifaru Inc",
    "client": "Kifaru Inc.",
    "type": "Corporate website",
    "service": "websites",
    "summary": "The parent website for Kifaru Inc., an umbrella company, linking its businesses (Kifaru Liquor, Kifaru Car Hire and Kifaru Websites) with a website pricing page and contact details.",
    "year": "2025",
    "visible": true,
    "featured": true,
    "link": "https://kifaru.ke",
    "industry": "Holding company (parent business)",
    "location": "Ngong, Kajiado County, Kenya",
    "features": [
      "Group site linking to its companies (Kifaru Liquor, Kifaru Car Hire)",
      "Website pricing page for Kifaru Websites",
      "About and contact pages with map directions",
      "WhatsApp help and click-to-call",
      "Social media links"
    ],
    "stack": [
      "WordPress",
      "WooCommerce",
      "Elementor"
    ],
    "own": false,
    "image": "/work/kifaru-inc.webp",
    "imagePhone": "/work/kifaru-inc-phone.webp"
  },
  {
    "id": "jimmy-group",
    "title": "Jimmy Group",
    "client": "Jimmy Group Designs",
    "type": "E-commerce website",
    "service": "websites",
    "summary": "An online shop for Jimmy Group Designs, a Nairobi design, print and branding studio, selling branded merchandise and bulk printing with quote requests.",
    "year": "2024",
    "visible": true,
    "featured": true,
    "link": "https://jimmygroup.co.ke/",
    "industry": "Design and Branding",
    "location": "Nairobi, Kenya",
    "features": [
      "Online shop for branded merchandise with cart",
      "Product categories (office, outdoor, home, wearables)",
      "Product search",
      "Quote requests, including bulk orders",
      "Sub-sites for large-format printing"
    ],
    "stack": [
      "WordPress",
      "WooCommerce",
      "Elementor"
    ],
    "own": false,
    "image": "/work/jimmy-group.webp",
    "imagePhone": "/work/jimmy-group-phone.webp"
  },
  {
    "id": "amir-outdoor-masters",
    "title": "Amir Outdoor Masters",
    "type": "Service website",
    "service": "websites",
    "summary": "A website for Amir Outdoor Masters, a landscaping and outdoor living company, with service pages, a project portfolio, client testimonials, a blog and online quote requests.",
    "year": "2026",
    "visible": true,
    "featured": true,
    "link": "https://www.amiroutdoormasters.com/",
    "industry": "Landscaping",
    "location": "Kenya",
    "features": [
      "Service pages (artificial turf, cabro paving, pergolas, swimming pools, gate automation and more)",
      "Project portfolio gallery",
      "Online quote request and contact form",
      "Client testimonials",
      "Blog and business hours"
    ],
    "stack": [
      "Next.js"
    ],
    "own": false,
    "image": "/work/amir-outdoor-masters.webp",
    "imagePhone": "/work/amir-outdoor-masters-phone.webp"
  },
  {
    "id": "fespen-contractors",
    "title": "Fespen Contractors",
    "client": "Fespen Contractors Limited",
    "type": "Corporate website",
    "service": "websites",
    "summary": "A corporate website for Fespen Contractors, an NCA Category 1 construction firm in Nairobi, showing its capabilities and completed projects, with quote requests.",
    "year": "2026",
    "visible": true,
    "featured": true,
    "link": "https://fespencontractors.com/",
    "industry": "Construction and Engineering",
    "location": "Nairobi, Kenya",
    "features": [
      "Capability pages (civil, electrical, mechanical and plumbing, real estate)",
      "Project portfolio with completed and ongoing projects",
      "Request a quote and contact page",
      "Client testimonials",
      "Click-to-call and social media links"
    ],
    "stack": [
      "WordPress",
      "Elementor"
    ],
    "own": false,
    "image": "/work/fespen-contractors.webp",
    "imagePhone": "/work/fespen-contractors-phone.webp"
  }
];
