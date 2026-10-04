# Visual Project Estimator — Spec

**Route:** `/estimate` · **Status:** v1 built (2026-10-04) · Roadmap: [MILESTONES.md](MILESTONES.md) Phase 4

## 1. Goal

A visitor picks their industry, starts from a standard website, and adds feature modules. As they add modules, a **live visual preview of their website** builds itself. When they're happy, they download a **proforma invoice (PDF)** and send a **purchase order to Bluvig's WhatsApp** in one tap. Each step should be easy, with nothing on the page competing for attention.

## 2. Principles

- **Own page, no distractions.** `/estimate` uses a stripped layout: logo + "Exit" link only. No site nav, footer, floating WhatsApp button or decorative animation.
- **Price always visible.** The running total sits in a sticky summary bar; every module shows its price before it's added.
- **Prices are shown as ranges, not fixed quotes.** The total is labelled "Estimated total" and the PDF states that the final quote follows a short discovery call.
- **Lead details are asked for last.** The visitor gets the full value of the tool before giving contact details, and the details are only needed for the documents.
- **Fast:** the estimator's code loads only on `/estimate`. The preview is built from lightweight HTML/CSS blocks, not images.

## 3. User Flow

```
1. Industry      →  2. Build              →  3. Review           →  4. Your details   →  5. Done
   grid + search     base site preloaded      itemised summary      name, company,       download proforma PDF
                     + recommended modules    timeline, terms       email, phone,        send PO on WhatsApp
                     live visual preview                            country (→ currency)
```

1. **Industry.** Icon grid with search (≈40 industries, §6) plus "Other / not listed". Picking one preloads the **Standard Website** and highlights that industry's recommended modules. The visitor can change industry later without losing what they've selected.
2. **Build.** Two-pane layout:
   - **Left:** module picker grouped by category (§5), each card showing name, one-line benefit, price, and a ★ if recommended for the chosen industry. Toggle on/off; quantity stepper where relevant (extra pages, languages).
   - **Right:** live preview (§7) + running total.
   - **Mobile:** preview on top (collapsible), picker below, total in a sticky bottom bar.
3. **Review.** Itemised list (base + modules), subtotal, estimated delivery timeline, payment terms, what's included (hosting year 1? — see Open Questions). Edit links back to Build.
4. **Your details.** Name, company, email, phone (WhatsApp), country, optional notes. Country decides currency (§4) — shown before submit so there are no surprises.
5. **Done.** Reference number (e.g. `BLV-2026-0142`), **Download proforma invoice (PDF)**, **Send purchase order on WhatsApp**, and an optional "Book a call to finalise" link.

## 4. Pricing Rules

- **Base: Standard Website = KES 30,000** (Kenyan clients).
- **International clients pay 3× the KES price, shown in USD:** `USD = round(KES × 3 ÷ FX_RATE)`, rounded to a clean figure (nearest $10).
  - Example at an assumed FX rate of 130: Standard Website → 90,000 KES-equivalent → **≈ USD 690**.
  - `FX_RATE` and the multiplier (3) are editable in the admin dashboard (§10).
- Applies to the base **and every module** (assumed — confirm).
- **Currency by country:** Kenya → KES; every other country → USD. Visitor can switch manually.
- **Dependencies are auto-added with a note**, e.g. Inventory requires Online Shop, and M-Pesa Checkout requires something to pay for (Shop, Booking, Donations, Ticketing or Courses).
- Monthly items (hosting/maintenance) are shown separately from the one-off total.

## 5. Base Package & Module Catalog

### 5.1 Standard Website — KES 30,000 (included in every estimate)
Home · About · Services page · Contact page (with form) · Admin dashboard (edit content, view form submissions) · Embedded Google Map · WhatsApp chat button · Basic SEO/GEO (titles, meta, sitemap, Google indexing, structured data basics, AI-assistant-readable content) · Mobile responsive · SSL.

### 5.2 Modules (starting prices — editable in admin)

Prices are KES (Kenya). USD price = ×3 ÷ FX, per §4. These values seed the database at launch; after that the owner changes them in `/cockpit` (§10). The base Standard Website price is editable the same way.

**Pages & Content**
| Module | KES | Notes |
|---|---|---|
| Extra page | 5,000 / page | Quantity stepper |
| Blog / News | 12,000 | Categories, author, SEO per post |
| Portfolio / Gallery | 10,000 | Filterable projects/photos |
| Testimonials & Reviews | 6,000 | Incl. Google reviews embed |
| FAQ section | 4,000 | With FAQ schema |
| Team / Staff profiles | 6,000 | |
| Video gallery | 8,000 | YouTube/Vimeo embeds |
| Downloads / Resources library | 6,000 | Brochures, price lists, PDFs |
| Multilingual (per extra language) | 15,000 / language | e.g. Swahili, French |
| Careers / Job board | 15,000 | Listings + applications |
| Events calendar | 12,000 | Listing only (see Ticketing to sell) |
| Newsletter signup | 6,000 | Mailchimp/Brevo integration |

**Commerce & Payments**
| Module | KES | Notes |
|---|---|---|
| Product catalogue (no checkout) | 15,000 | Enquire / order via WhatsApp |
| Online Shop / E-commerce | 45,000 | Up to 100 products, cart, checkout, orders |
| Large catalogue (100+ products) | 20,000 | Requires Online Shop |
| M-Pesa checkout (STK Push) | 20,000 | Daraja API |
| Card & international payments | 25,000 | Pesapal / Flutterwave / Stripe |
| Inventory management | 35,000 | Requires Online Shop |
| Delivery zones & fees | 12,000 | Requires Online Shop |
| Order tracking | 15,000 | Requires Online Shop |
| Discount codes & promotions | 8,000 | Requires Online Shop |
| Multi-vendor marketplace | 120,000 | Requires Online Shop |
| Subscriptions / recurring billing | 40,000 | Memberships, boxes, SaaS |

**Bookings & Scheduling**
| Module | KES | Notes |
|---|---|---|
| Appointment booking | 25,000 | Salons, clinics, consultants |
| Table reservations | 20,000 | Restaurants |
| Room / property booking engine | 60,000 | Hotels, Airbnbs — availability calendar |
| Vehicle / equipment rental booking | 45,000 | Car hire, equipment |
| Class & course schedule | 18,000 | Gyms, schools |
| Event ticketing | 40,000 | QR tickets, check-in |
| Tour packages & enquiries | 20,000 | Itineraries, pricing tiers |

**Customers & Portals**
| Module | KES | Notes |
|---|---|---|
| Customer accounts / login | 25,000 | |
| Client portal | 50,000 | Documents, invoices, project status |
| Loyalty & rewards | 30,000 | Requires Customer accounts |
| Online courses (LMS) | 70,000 | Lessons, quizzes, certificates |
| Membership / donor area | 30,000 | Gated content |
| Donations | 18,000 | One-off & recurring |
| Directory / listings with search | 40,000 | |
| Property listings with search & filters | 45,000 | Real estate |
| Digital menu + QR code | 10,000 | Restaurants, bars |
| Patient / client intake forms | 15,000 | Clinics, law firms |
| Quote / RFQ request builder | 10,000 | Construction, B2B |
| Live chat widget | 8,000 | Tawk.to or similar |
| AI chat assistant | 45,000 | Trained on the business's content |

**Growth & Visibility**
| Module | KES | Notes |
|---|---|---|
| Advanced SEO & GEO | 35,000 | Keyword research, schema, local SEO, AI-assistant visibility (ChatGPT/Gemini) |
| Google Business Profile setup | 6,000 | |
| Analytics & conversion tracking | 8,000 | GA4 + events |
| Social media feed integration | 6,000 | Instagram/TikTok/Facebook |
| Email marketing automation | 15,000 | Welcome, abandoned cart |
| SMS notifications | 15,000 | Africa's Talking — order/booking alerts |
| Landing page for ads | 10,000 / page | |

**Integrations & Operations**
| Module | KES | Notes |
|---|---|---|
| KRA eTIMS invoicing | 40,000 | |
| Accounting sync (QuickBooks / Zoho Books / Xero) | 30,000 | |
| CRM integration (HubSpot / Zoho) | 20,000 | |
| Courier / logistics API | 25,000 | e.g. Sendy, G4S, Fargo |
| Staff roles & permissions | 15,000 | |
| Reports & analytics dashboard | 25,000 | Sales, bookings, enquiries |
| Mobile app (Android + iOS) companion | 250,000 | Starting price — flags "discovery call required" |

**Monthly (shown separately)**
| Item | KES / month |
|---|---|
| Maintenance & content updates | 8,000 |
| SEO retainer | 25,000 |

## 6. Industries & Recommended Modules

★ = pre-highlighted (not pre-added). The visitor always decides.

| Industry | Recommended modules |
|---|---|
| Restaurants & Cafés | Digital menu + QR, Table reservations, M-Pesa checkout, Delivery zones, Reviews |
| Bars & Lounges | Digital menu + QR, Events calendar, Event ticketing, Gallery |
| Bakeries & Catering | Product catalogue, Online shop, M-Pesa, Delivery zones, Quote request |
| Hotels & Lodges | Room booking engine, Card payments, Gallery, Multilingual, Reviews |
| Airbnb & Short Stays | Room booking engine, M-Pesa, Card payments, Gallery |
| Tours & Travel / Safaris | Tour packages, Card payments, Multilingual, Gallery, Blog |
| Real Estate & Property | Property listings, Gallery, Quote request, Live chat, Advanced SEO |
| Retail Shops | Online shop, M-Pesa, Inventory, Delivery zones, Discount codes |
| Fashion & Apparel | Online shop, M-Pesa, Social feed, Discount codes, Card payments |
| Electronics & Phones | Online shop, Large catalogue, M-Pesa, Inventory, Order tracking |
| Hardware & Building Supplies | Product catalogue, Quote request, Large catalogue, Delivery zones |
| Supermarkets & Groceries | Online shop, Large catalogue, Inventory, Delivery zones, M-Pesa |
| Salons, Barbers & Spas | Appointment booking, M-Pesa, Gallery, Loyalty |
| Beauty & Cosmetics brands | Online shop, M-Pesa, Social feed, Reviews |
| Gyms & Fitness | Class schedule, Subscriptions, Customer accounts, M-Pesa |
| Hospitals & Clinics | Appointment booking, Patient intake forms, Team profiles, FAQ |
| Dental & Specialist Practices | Appointment booking, Patient intake, Reviews, Advanced SEO |
| Pharmacies | Product catalogue, Online shop, M-Pesa, Delivery zones |
| Veterinary | Appointment booking, Intake forms, Blog |
| Schools & Colleges | Events calendar, Downloads, Careers, Customer accounts (parents/students) |
| Training & Online Courses | Online courses (LMS), M-Pesa, Card payments, Subscriptions |
| Churches & Religious Orgs | Donations, Events calendar, Video gallery, Blog |
| NGOs & Non-profits | Donations, Blog, Downloads, Multilingual, Card payments |
| Law Firms | Team profiles, Intake forms, Blog, Appointment booking |
| Accounting & Consulting | Appointment booking, Client portal, Blog, Downloads |
| Insurance, SACCOs & Finance | Customer accounts, Client portal, Downloads, Live chat |
| Construction & Engineering | Portfolio, Quote request, Downloads, Careers |
| Interior Design & Architecture | Portfolio, Gallery, Quote request, Blog |
| Manufacturing & Distribution | Product catalogue, Quote request, Large catalogue, CRM integration |
| Logistics & Transport | Quote request, Order tracking, Courier API, Customer accounts |
| Car Dealers | Directory/listings with search, Gallery, Quote request, Live chat |
| Car Hire & Rentals | Vehicle rental booking, M-Pesa, Card payments |
| Garages & Auto Services | Appointment booking, Quote request, Reviews |
| Agriculture & Agribusiness | Product catalogue, Quote request, Blog, SMS notifications |
| Events, Weddings & Venues | Event ticketing, Gallery, Appointment booking, Quote request |
| Photography & Creatives | Portfolio, Gallery, Appointment booking, Online shop (prints) |
| Media, News & Bloggers | Blog, Newsletter, Subscriptions, Video gallery |
| Tech Startups & SaaS | Subscriptions, Customer accounts, Blog, Analytics, Card payments |
| Recruitment & HR Agencies | Careers/job board, Customer accounts, Blog |
| Cleaning & Home Services | Appointment booking, Quote request, M-Pesa, Reviews |
| Security Companies | Quote request, Team profiles, Downloads |
| Solar, Water & Energy | Product catalogue, Quote request, Portfolio, Blog |
| Personal Brand / Coach / Speaker | Appointment booking, Blog, Online courses, Newsletter |
| Online Marketplace (multi-vendor) | Multi-vendor marketplace, M-Pesa, Card payments, Reviews |
| Other / not listed | No recommendations; full catalog shown |

## 7. Visual System (live preview)

A browser-window mockup ("yourbusiness.co.ke") showing a **schematic but recognisable** version of the site — styled blocks, not real content.

- **Base site** shows header with nav (Home · About · Services · Contact), hero, services cards, map block, footer, and the WhatsApp bubble.
- **Industry adapts it:** accent colour, icon set and placeholder labels (e.g. a restaurant hero reads "Book a table", a clinic reads "Book an appointment").
- **Each module adds something visible**, animated in (slide/fade, ~300 ms):
  - New **nav item** where it's a page (Shop, Blog, Portfolio, Careers…)
  - A **homepage section** (product grid, booking calendar, gallery strip, testimonial cards, donation bar…)
  - Header **badges/icons** (cart, account, language switcher)
  - **Checkout badges** (M-Pesa, Visa/Mastercard) in footer/cart
  - **Backend modules** (eTIMS, accounting sync, reports) appear in a small "Behind the scenes" panel beneath the preview as connected tiles, since they have no public UI
- **Toggles:** Desktop / Mobile preview · "Pages" view (sitemap tree that grows as pages are added).
- **Removing a module** animates it out; price ticks down.
- Respect `prefers-reduced-motion` (instant changes, no slide).

Implementation: each module defines a `preview` entry (`nav`, `section`, `headerIcon`, `badge`, `backend`), and the preview renders from the selected set. Content is pure data, so adding a module means adding a catalog entry, not new layout code.

## 8. Documents & WhatsApp Purchase Order

### Proforma invoice (PDF)
- Titled **"Proforma Invoice / Quotation"**, not a tax invoice. Final tax invoices should go through **KRA eTIMS** after the deal is confirmed.
- Contents: Bluvig business details & logo, reference number, date, validity (e.g. 14 days), client details, itemised modules with prices, subtotal, any applicable VAT (confirm Bluvig's VAT status), currency, monthly items listed separately, payment terms (e.g. 50% deposit / 50% on launch), payment details (M-Pesa Paybill/Till, bank), estimated timeline, disclaimer ("indicative estimate; final quote confirmed after a discovery call").
- Generated **server-side** so the PDF the client downloads is identical to the copy stored with the lead.

### Purchase order on WhatsApp
- Button opens WhatsApp with a **pre-filled message to Bluvig's number** (`254700574125`):
  ```
  Purchase Order BLV-2026-0142
  Name: Jane Doe — Acme Ltd (Kenya)
  Industry: Restaurants & Cafés
  Package: Standard Website + 5 modules
  Total: KES 113,000 (+ KES 3,000/month hosting)
  View order: https://bluvig.co.ke/estimate/BLV-2026-0142
  ```
- The client presses **Send** in their own WhatsApp. This needs no WhatsApp Business API, works today, and costs nothing.
- **Upgrade option (later):** WhatsApp Cloud API to push the PO to Bluvig automatically, without the client pressing Send. This requires Meta business verification and approved message templates.
- The order link opens a read-only summary page (unguessable reference) for both sides; Bluvig staff see full details in `/cockpit`.

### Lead record
Every estimate is saved (reference, industry, modules, totals, currency, contact details, timestamp, status) → listed in `/cockpit` with status **Estimate → PO sent → Call booked → Won/Lost**, and an email notification is sent to Bluvig.

## 9. Technical Notes

- **Data split:**
  - **In the database (admin-editable):** base price, module prices, FX rate, international multiplier, module enabled/hidden, module name/description.
  - **In code (`lib/estimator/catalog.ts`):** module IDs, categories, dependencies, preview definitions, industry list and recommendations. These are structural: changing them means changing how the preview renders, so they ship with code. The file also holds the default prices used to seed the DB.
- **Price lookups:** `/estimate` reads current prices from the DB on each request (cached, and invalidated when admin saves), so a price change is live within seconds. No redeploy.
- **Price snapshot:** each saved estimate stores the prices *as they were* when created. Changing a price later never alters an invoice already issued.
- **State:** client-side selection state, mirrored to the URL (`/estimate?i=restaurant&m=shop,mpesa`) so a configuration can be shared or resumed.
- **Storage:** hosted DB required (current `data/leads.json` does not persist on Vercel) — MILESTONES Phase 5.
- **PDF:** `@react-pdf/renderer` in an API route.
- **Analytics events:** industry selected → module added/removed → review reached → details submitted → PDF downloaded → WhatsApp PO clicked.
- **Spam:** Turnstile/honeypot + rate limit on submit.
- **Accessibility:** keyboard-operable module cards (toggle buttons with `aria-pressed`), price changes announced via a polite live region.

## 10. Admin — Pricing (part of v1)

New **Pricing** screen in `/cockpit` (same password-protected login as the leads dashboard):

- **Global settings:** Standard Website base price (KES), FX rate (KES per USD), international multiplier (default 3), USD rounding (nearest $10).
- **Module table**, grouped by category: name, KES price, live-calculated USD price shown next to it, monthly/one-off flag, **Enabled** toggle (hide a module from the estimator without deleting it), short description.
- Inline editing with one **Save changes** button; unsaved changes highlighted. Validation: prices must be whole numbers ≥ 0.
- **Change log:** who/when/old → new for every price edit, so mistakes can be traced and reverted.
- **Reset to default** per module (from the seed values in code).
- Saving refreshes the public estimator immediately (cache invalidation).

Later (not v1):
- Edit industry → recommended-module mapping
- Duplicate an estimate into a custom quote with manual line items
- Automatic FX rate updates from an exchange-rate API

## 11. Owner Decisions (2026-10-04)
1. **Prices in §5.2** are starting values — edited live in `/cockpit/pricing`.
2. **3× international multiplier applies to everything** — base, every module and monthly plans. FX rate editable in the cockpit (default 130 KES/USD).
3. **Payment terms:** 60% deposit to start, 40% on launch. Clients may request a **free prototype first**. Pay via **M-Pesa Paybill 522522, Account 1315475243**.
4. **No VAT** (not VAT-registered yet) — invoices say "No VAT charged".
5. **Hosting & domain are included** in the Standard Website (the separate monthly hosting fee was removed).
6. Delivery estimate: rough defaults (base 14 days + days per module, ~5 working days per week).
7. **Currency is locked by country**: Kenya → KES, everywhere else → USD (enforced server-side). The builder has an "In Kenya / Outside Kenya" switch for previewing.
8. WhatsApp **click-to-send** now; Cloud API auto-send later.

### Still open
- Is hosting & domain included for the **first year only**, or always? (Invoice currently says "Hosting & domain included".)
- Point the site's "Get Started" buttons to `/estimate`?
- Estimates are stored as one JSON document — fine for hundreds; move to a proper table before volume grows.
