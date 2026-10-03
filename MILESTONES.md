# Bluvig.co.ke — Business-Ready Roadmap

**Goal:** Turn bluvig.co.ke into the sales engine for a **software studio**: a fast, credible site that convinces businesses in Kenya and abroad to trust Bluvig with their business software, web applications and websites — and converts them through a visual project estimator into qualified, priced leads.

_Last re-planned: 2026-10-03 (repositioned from "AI-powered digital marketing agency" to "software studio first")._

---

## Decisions Log

| Date | Decision | Why |
|---|---|---|
| 2026-10-03 | **Positioning: software studio first.** Lead with custom business software, web/mobile apps and websites. SEO/digital marketing becomes a supporting "launch & grow" service, not the headline. | This is what the agency actually sells now. Software buyers need different proof and a different sales flow than SEO buyers. |
| 2026-10-03 | **Target clients:** international clients, established companies, Kenyan SMEs (in that order of deal size). | Three segments with different needs (see Audience below) — the site must serve all three without diluting the message. |
| 2026-10-03 | **Primary conversion: an advanced, visual project estimator** — spec in [ESTIMATOR-SPEC.md](ESTIMATOR-SPEC.md). Discovery-call booking and WhatsApp become secondary paths. | Pre-qualifies scope and budget before a sales conversation; differentiates from agencies with a generic contact form. |
| 2026-10-03 | **Rejected: scroll-driven "code → wireframe → site" build animation.** Prototyped in three variants, then removed. | Delayed the headline/CTA on first visit — hurts conversion. Motion stays subtle and never gates content. |
| (earlier) | Stack: Next.js 16 (App Router) + TypeScript, Tailwind v4, shadcn/ui (`base-nova`), Framer Motion + GSAP, lucide-react, Geist + Playfair Display. Hosting on Vercel. | See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). |

## Audience — what each segment needs to see

| Segment | What they're buying | What convinces them | Site implications |
|---|---|---|---|
| **International clients** | Offshore/nearshore development — better cost than local agencies, without the risk | Communication, process, time-zone overlap, contracts/IP ownership, verifiable past work | USD pricing in the estimator, "How we work" page, overlap hours (EAT = UTC+3), English-first copy, NDA/IP terms stated up front |
| **Established companies** | Internal systems, client portals, integrations (ERP/CRM/payments), modernizing legacy tools | Security, reliability, scale of past projects, support after launch | Case studies with stack + outcomes, security & data-handling page, SLA/maintenance offer |
| **Kenyan SMEs** | Websites, booking/POS/inventory tools, M-Pesa integrations | Price clarity, speed, local presence, people they can call | KES pricing, M-Pesa expertise front and center, WhatsApp still available, "starting at" ranges |

---

## Current State (what's already built — reusable)

Done and kept as-is (design and infrastructure carry over; **copy and positioning do not**):

- [x] Next.js 16 + TypeScript + Tailwind v4 repo, shadcn/ui primitives, ESLint
- [x] Design system: single-hue brand blue sampled from the logo (`#297aef`), navy/"gold" token scales, glassmorphism utilities, `GlowOrbs`, cursor-reactive `DotMatrix` — [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)
- [x] Layout shell: sticky header (desktop dropdown + mobile drawer), footer, WhatsApp floating button, favicon set
- [x] Shared primitives: `Container`, `SectionHeading`, `PageHero`, `AnimatedSection`, `MagneticButton`, `.btn-metallic`
- [x] Pages scaffolded: Home, What We Do + 4 service pages, Case Studies index, About, Get Started, Contact, Blog index, Tools index
- [x] Lead capture: `POST /api/leads` + `/cockpit` admin dashboard (JSON file store — **not production-safe on Vercel**, see Phase 5)
- [x] Cockpit sign-in via **Bluvig Authenticator** (2026-10-03): number matching — `/cockpit/login` shows a number, an enrolled phone at `/authenticator` (unlocked with a passkey) taps it from 3 choices. Multiple phones; add via one-time code from the cockpit, revoke from the cockpit. `ADMIN_PASSWORD` only enrols the first phone (and signs sessions). Data is stored in Supabase via `DATABASE_URL` (local dev: `data/authenticator.json`). Set `WEBAUTHN_ORIGIN` in production.

Needs rework because of the repositioning:

- Home hero, Discovery Engine section, Services grid, Trust section — all written for SEO/marketing
- `/what-we-do/*` service pages — wrong service lineup
- Case study copy — framed as marketing projects; needs build/tech framing
- Get Started form — will be replaced/fronted by the estimator
- Site metadata/titles ("AI-Powered Digital Marketing Agency") — wrong keywords

---

## Phase 0 — Foundations (finish)
- [ ] Create a GitHub remote and push (no git remote exists yet)
- [ ] Connect to Vercel: preview deploys per branch, production on `main`
- [~] Hosted database: **Supabase** chosen (2026-10-03). Code supports it via `DATABASE_URL` (lib/storage.ts; table `bluvig_documents` auto-created with RLS on). **Owner to create the Supabase project and add `DATABASE_URL` in Vercel.**
- [ ] Environment variable management for preview vs production (`ADMIN_PASSWORD`, DB URL, email API key)

## Phase 1 — Positioning, Offers & Messaging
_The site can't be rebuilt until this is decided. Mostly a writing/decision phase._
- [ ] One-line value proposition + supporting line (e.g. "We design and build the software your business runs on")
- [ ] Final service lineup. Proposed:
  1. **Custom Business Software** — internal tools, dashboards, ERP/CRM/inventory, workflow automation
  2. **Web Applications & Portals** — customer portals, SaaS products, booking/ordering systems
  3. **Mobile Apps** — iOS/Android (cross-platform)
  4. **Websites** — high-performance marketing and e-commerce sites
  5. **Integrations** — M-Pesa/Daraja, payment gateways, KRA eTIMS, third-party APIs
  6. **Launch & Grow** (supporting) — SEO, analytics and digital marketing for what we ship
- [ ] Decide fate of **Digital Marketing Training** and **Graphic Design**: drop, fold into "Launch & Grow", or keep as minor pages → _owner decision_
- [ ] Engagement models to present: fixed-scope project · MVP sprint · dedicated team / monthly retainer · support & maintenance plan
- [ ] Pricing stance: published "starting at" ranges per service (KES + USD) — feeds the estimator's pricing model
- [ ] **Proof inventory:** list every shipped project with client permission status, stack, scope, outcome numbers, screenshots, testimonial availability. (QR Baker is our own product — strong proof of software capability.)
- [ ] Industries to highlight, if any (e.g. retail, logistics, hospitality, finance, NGOs)

## Phase 2 — Information Architecture
- [ ] Finalize sitemap. Proposed:
```
/                          Home (software studio positioning, estimator CTA)
/services                  Services overview
/services/custom-software
/services/web-applications
/services/mobile-apps
/services/websites
/services/integrations     (M-Pesa, payments, eTIMS, APIs)
/services/launch-and-grow  (SEO & marketing — supporting)
/estimate                  Visual project estimator (primary conversion)
/work                      Case studies index
/work/[slug]               Case study detail (problem → build → stack → outcome)
/process                   How we work: discovery → design → build → launch → support
/about                     Team, story, location, why us
/insights                  Blog (renamed or kept as /blog — decide)
/insights/[slug]
/contact                   Call / email / WhatsApp / book a call
/privacy  /terms           Legal (Phase 8)
```
- [ ] 301 redirect map for every URL that changes: `/what-we-do/*` → `/services/*`, `/case-studies` → `/work`, old WordPress blog slugs, retired pages → nearest equivalent
- [ ] Navigation: Services · Work · Process · About · Insights + persistent **"Get an Estimate"** button in the header

## Phase 3 — Page Rebuild (copy + layout)
Reuse the existing design system and components; rewrite content.
- [ ] **Home:** hero (value prop + "Get an Estimate" + secondary "See our work"), client/tech logo strip, services overview, featured case studies, process snapshot, estimator teaser, testimonials, final CTA
- [ ] **Service pages** (template-driven, one data file): problem it solves, what's included, example deliverables, tech stack, typical timeline, starting price, related case studies, FAQ, CTA → estimator pre-filled with that service
- [ ] **Work index + detail pages** (`/work/[slug]`): client, challenge, solution, stack, screenshots, outcome numbers, testimonial
- [ ] **Process page:** phases, deliverables per phase, communication cadence, tools (Slack/Jira/etc.), who you'll talk to
- [ ] **About:** real team/founder info, location, years operating, values — no fabricated bios
- [ ] **Contact:** direct channels + calendar booking embed
- [ ] Update site metadata, titles and descriptions to the new positioning

## Phase 4 — Visual Project Estimator (flagship conversion)
Full spec: **[ESTIMATOR-SPEC.md](ESTIMATOR-SPEC.md)**. Flow: industry → Standard Website (KES 30,000; 3× in USD for international clients) → add modules with a live visual preview → proforma invoice PDF + purchase order sent to Bluvig's WhatsApp.
- [x] Owner described the concept (2026-10-03); spec drafted
- [ ] Owner review: international multiplier scope, payment terms, VAT status (spec §11)
- [ ] Catalog file (industries, modules, dependencies, preview definitions, default prices) + DB tables for prices/settings, seeded from defaults
- [ ] Admin **Pricing** screen: edit base price, module prices, FX rate, multiplier, enable/hide modules, change log (spec §10)
- [ ] `/estimate` distraction-free layout + industry step
- [ ] Builder: module picker + live visual preview + running total
- [ ] Review + details steps, currency by country
- [ ] Proforma invoice PDF (server-side) + WhatsApp purchase-order link + shareable order page
- [ ] Save estimates to DB, show in `/cockpit` with status, email notification (needs Phase 5 DB)
- [ ] Analytics events per step; spam protection
- [ ] Later: admin-editable industry recommendations, auto FX updates, WhatsApp Cloud API auto-send

## Phase 5 — Lead Infrastructure
- [x] Leads and authenticator devices stored in the hosted DB when `DATABASE_URL` is set (local dev still uses `data/*.json`)
- [ ] Email notification on every new lead/estimate (Resend), plus auto-reply to the prospect
- [ ] Optional: push leads to a CRM (HubSpot/Zoho) or Google Sheet via webhook
- [ ] Calendar booking embed (Cal.com/Calendly) on Contact and after the estimator
- [ ] Upgrade `/cockpit`: lead status (new → contacted → proposal → won/lost), estimate details, notes, CSV export
- [ ] Spam protection on forms (Cloudflare Turnstile or honeypot + rate limiting)

## Phase 6 — Trust & Proof
_Software buyers, especially international and established companies, buy trust before they buy code._
- [ ] 3–5 flagship case studies at full depth (from the Phase 1 proof inventory)
- [ ] Real testimonials with name, role and company (with permission); video if possible
- [ ] Client logo strip (with permission)
- [ ] Tech stack section (languages/frameworks/cloud we work with)
- [ ] "Working with us" assurances: NDA available, client owns the code/IP, milestone-based payments, post-launch support terms
- [ ] Security & data handling statement (hosting, backups, access control, Kenya Data Protection Act compliance)
- [ ] Third-party profiles linked: Clutch / GoodFirms / Google Business Profile / LinkedIn company page — reviews there carry weight with international buyers

## Phase 7 — Content & SEO
- [ ] Retarget keywords: e.g. "software development company Kenya", "custom software Nairobi", "web application development Kenya", "M-Pesa integration developer", "hire developers in Kenya", "offshore development Africa"
- [ ] Blog migration from WordPress: keep posts that still fit, 301 the rest to relevant pages; choose authoring setup (MDX in repo vs. Sanity — decide by publishing frequency)
- [ ] Content plan for the new audience: build-cost guides ("How much does custom software cost in Kenya?"), integration how-tos, case-study write-ups
- [ ] Technical SEO: `sitemap.xml`, `robots.txt`, canonical URLs, structured data (Organization, LocalBusiness, Service, Article, FAQ), Open Graph images
- [ ] Core Web Vitals: 90+ Lighthouse on all marketing pages; keep decorative motion lightweight
- [ ] Google Search Console + Bing Webmaster set up; monitor redirect coverage after launch

## Phase 8 — Legal & Business Readiness
- [ ] Privacy policy (Kenya Data Protection Act 2019; GDPR basics for EU visitors since international clients are a target)
- [ ] Terms of use; estimator disclaimer ("estimates are indicative, final quote after discovery")
- [ ] Cookie/analytics consent banner (only if using cookie-based analytics)
- [ ] Check whether ODPC registration as a data controller/processor applies to the business
- [ ] Business details in footer: registered name, location, contact, business hours (EAT)
- [ ] Standard proposal/contract template and NDA ready to send after estimator leads (offline, but needed before leads arrive)

## Phase 9 — Analytics & Conversion Tracking
- [ ] Analytics (GA4 or a privacy-friendly option like Plausible) with conversion events: estimate started/completed, lead submitted, call booked, WhatsApp click
- [ ] Lead source attribution (UTM capture stored with each lead)
- [ ] Simple dashboard: leads per week by source, estimator funnel drop-off

## Phase 10 — QA & Launch
- [ ] Cross-browser/device testing (mobile-first)
- [ ] End-to-end test: estimator → lead in DB → email received → booking works
- [ ] Accessibility pass (contrast, keyboard navigation, focus states, alt text)
- [ ] Copy proofread and broken-link check
- [ ] DNS cutover (low TTL), redirect spot-checks, 404 monitoring
- [ ] Production `npm run build` clean; Lighthouse check on live URLs

## Phase 11 — Post-Launch Growth
- [ ] Weekly lead review; tune estimator pricing against real quotes and won deals
- [ ] A/B test hero copy and estimator entry points
- [ ] Publish 1–2 case studies or articles per month
- [ ] Collect reviews after every delivered project (Clutch/Google)

---

## Open Questions (owner)
1. Estimator pricing and terms — see [ESTIMATOR-SPEC.md §11](ESTIMATOR-SPEC.md).
2. Keep, fold or drop Digital Marketing Training and Graphic Design?
3. Keep the "Discovery Engine" brand name (could become the "Launch & Grow" offer) or retire it?
4. Which past projects can be shown publicly, and with what numbers?
5. Real team info for the About page (names, roles, photos)?
6. Existing tools (QR Baker, Readability Checker): rebuild as live product demos/portfolio pieces, or retire?
7. Blog URL: keep `/blog` or rename to `/insights`?

## Suggested Order
Phase 0 → **Phase 1 (decisions + copy)** → Phase 2 → Phase 3 (Home + Services + Work first) and Phase 5 (DB + notifications) in parallel → **Phase 4 estimator** → Phase 6 → Phases 7–8 → Phase 9 → Phase 10 launch → Phase 11.

The estimator is the flagship, but it depends on Phase 1 pricing decisions and Phase 5 lead storage. Building those first means the estimator has real numbers to calculate with and somewhere to send leads.
