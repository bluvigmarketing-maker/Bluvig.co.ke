# Bluvig.co.ke Redesign — Milestones

**Goal:** Replace the current WordPress/Elementor site with a fast, custom-built Next.js site that looks as sharp as the agency claims to make other people look — and that actively generates leads, not just describes services.

**Stack decisions (confirmed):**
- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4, driven by design tokens defined in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — navy (structural) + amber-gold (accent), evolved from Bluvig's existing blue/orange brand
- **UI primitives:** shadcn/ui (`base-nova`), Framer Motion for scroll-reveal, lucide-react for icons
- **Fonts:** Geist Sans (body) + Playfair Display (headings) via `next/font/google`
- **Blog:** Migrated fully off WordPress. Recommend a git-based or lightweight headless CMS (Sanity, or Decap/TinaCMS over MDX) so the team can keep publishing without a developer — see Phase 5 for the tradeoff.
- **Hosting/Deploy:** Vercel (pairs natively with Next.js, free SSL, preview deploys per PR)
- **Forms/Lead capture:** Serverless API routes + a transactional email provider (Resend) and/or CRM webhook (see Phase 4)

---

## Current Site Audit (reference — done)

Pulled from `/References` screenshots + a live crawl of bluvig.co.ke.

**Nav:** Home · What We Do (SEO, Website Dev, Digital Marketing Training, Graphic Design) · Case Studies · Blogs · Get Started · Tools (Readability Checker, QR Baker)

**Positioning:** "AI-Powered Digital Marketing Agency in Kenya Driving Real Business Growth." Core hook is the **"Discovery Engine" / "Visibility Engine"** concept — SEO + AI-assistant visibility (ChatGPT/Gemini) + social content, bundled as one system. This is Bluvig's most distinctive, ownable idea and should be the spine of the new site, not just a mid-page section.

**Services:** SEO (Business Discovery Engine), Digital Marketing, Website Development, Digital Marketing Training, Graphic Design.

**Proof assets:** 7 case studies (Digitec, QR Baker, ULC social posters, Kifaru Landscaping/Liquor/Inc, Jimmy Group), a testimonials/FAQ section, "8+ years experience" and "best SEO company in Kenya" claims.

**Existing lead magnets:** Readability Checker, QR Baker (M-Pesa QR generator) — genuinely useful, on-brand tools already live. Underused as lead capture right now.

**Blog:** ~10 posts, WordPress-native, targeting Kenya digital-marketing/SEO search terms.

**Contact:** phone, email, WhatsApp widget, "Book a FREE Clarity Call" CTA (currently likely just links out — no inline booking).

**What's broken visually (from screenshots):** huge dead whitespace gaps between sections (hero → service cards), inconsistent card shadows/heights, weak type hierarchy, generic Elementor card grid for both services and case studies (no visual distinction between "what we do" and "what we built"), FAQ/testimonials section reads as an afterthought at the page bottom.

---

## Phase 0 — Foundations
- [x] Audit live site content, structure, screenshots
- [x] Confirm tech stack: Next.js + Tailwind v4 + shadcn/ui + Framer Motion + lucide-react
- [x] Design system received and adapted to Bluvig's navy/gold palette — [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)
- [x] Initialize Next.js 16 + TypeScript + Tailwind v4 repo, git initialized locally
- [x] `shadcn init` (base-nova preset), Framer Motion + lucide-react installed, Geist + Playfair Display wired up
- [x] ESLint set up (via create-next-app default); base folder structure in place (`app/`, `components/`, `components/site/`, `components/home/`, `lib/`)
- [ ] Connect repo to a remote (GitHub) and to Vercel for preview deploys — not done yet, no remote configured
- [ ] Set up `content/` structure — deferred until Phase 5 CMS decision is made

## Phase 1 — Information Architecture & Content Strategy
- [ ] Finalize sitemap (see proposal below)
- [ ] Rewrite/tighten copy per page (current copy is solid on the "Visibility Engine" page, weaker/generic on services cards)
- [ ] Define content model for: Services, Case Studies, Blog Posts, Testimonials, Tools
- [ ] Decide on case study depth — upgrade from cards to real before/after proof (traffic charts, ranking screenshots, results in numbers)

**Proposed sitemap:**
```
/                    Home
/what-we-do          Services overview
/what-we-do/seo
/what-we-do/website-development
/what-we-do/digital-marketing-training
/what-we-do/graphic-design
/case-studies                (index)
/case-studies/[slug]         (individual case study — upgraded from card to full page)
/blog                         (index)
/blog/[slug]
/tools                         (index — expandable toolbox, see Genius Ideas)
/tools/readability-checker
/tools/qr-baker
/tools/visibility-checker     (new — see Genius Ideas #1)
/get-started                  (multi-step lead form / booking)
/about                         (new — currently missing; agencies selling trust need a team/story page)
/contact
```

## Phase 2 — Design System Integration
- [x] Wire navy/gold token scales into `globals.css` (`@theme inline` + `:root`/`.dark`) per DESIGN-SYSTEM.md §2
- [x] Build shared primitives: `Container`, `SectionHeading`, `PageHero`, `AnimatedSection`, `.btn-metallic`/`.gold-line` utilities
- [x] Add shadcn primitives: Button, Card, Badge, Dialog, DropdownMenu, NavigationMenu, Sheet, Separator, Input, Label
- [x] Build layout shell: sticky Header/Nav (desktop dropdown + mobile Sheet drawer), dark Footer with white logo badge, WhatsApp floating CTA
- [x] Establish consistent `py-16`/`py-16 sm:py-20` section rhythm and `max-w-6xl` container width — dead-whitespace problem from the old site is gone
- [x] Logo treatment: rendered as a styled Playfair Display wordmark in `navy-600`/`navy-950` (header/footer) — **no real logo file was provided**, so this is a text wordmark standing in for one. Flag if there's an actual logo asset to drop in instead.
- [x] Verified with a live dev-server + headless-browser check: production build is clean (`npm run build`, 0 type errors), zero console errors across pages tested, scroll-reveal animations confirmed firing correctly with real scroll behavior
- [x] Glassmorphism accent system added — `.glass`/`.glass-light`/`.glass-gold` utilities + `GlowOrbs` decorative background component, documented in DESIGN-SYSTEM.md §9. Applied to Hero, `PageHero` (all interior pages), Discovery Engine cards, the featured service card, Final CTA panel, and the sticky header — deliberately not on dense content grids (case studies, blog, trust cards) where it would hurt legibility

## Phase 3 — Core Page Build
- [x] Home page (hero, Discovery Engine explainer, services grid, case studies grid, trust/mission section, final CTA)
- [x] Services overview (`/what-we-do`) + all 5 individual service pages
- [x] Case Studies index (`/case-studies`) — 7 projects carried over from the live site, honest scope-based descriptions (no fabricated metrics since none were available)
- [x] About page (`/about`) — mission + values; no fabricated team bios since no real team info was provided
- [x] Get Started page (`/get-started`) — lead form UI (see Phase 4 note) + direct contact panel
- [x] Contact page (`/contact`) — direct channels (call/email/WhatsApp) + link to Get Started
- [x] Blog index (`/blog`) — placeholder listing of the 10 real post titles/categories from the live site; full content migration is still Phase 5
- [x] Tools index (`/tools`) — Readability Checker, QR Baker, and the new Visibility Checker shown as "Coming Soon" (honest — none are rebuilt/functional yet)
- [ ] Individual case-study detail pages (`/case-studies/[slug]`) — index only for now, no drill-down page per project yet

## Phase 4 — Lead-Generation Features
This is the highest-leverage phase for turning the site into an actual leads engine. See **Genius Ideas** below for the full menu; build order suggested:
- [~] "Get Started" qualifying form — built as a single-page form (name/email/phone/business type/goal/budget/message), **not yet the multi-step wizard** originally proposed. Submission is UI-only right now (shows a local success state) — **not wired to a backend**, see below.
- [ ] Inline booking widget for "Book a FREE Clarity Call" (Cal.com/Calendly embed) — remove the click-out-to-WhatsApp-only friction
- [ ] Rebuild Readability Checker + QR Baker on the new stack, add email-gated result export
- [ ] "Visibility Checker" tool (flagship new lead magnet — see idea #1)
- [ ] **Lead notification pipeline** — form/tool submissions currently go nowhere. Needs a serverless API route + Resend (or similar) + optional CRM/Sheets webhook before this form is real. This is the single most important thing to wire up next.

## Phase 5 — Blog Migration
- [ ] Export all existing WordPress posts (content, images, slugs, meta, publish dates) via WP REST API or export XML
- [ ] Decide final authoring workflow:
  - **Option A — MDX in-repo:** posts are files in the codebase; every new post needs a git commit/PR. Fastest to build, zero ongoing cost, but not editor-friendly for non-devs.
  - **Option B — Decap/TinaCMS over MDX:** git-backed but gives a web UI for editing/publishing — good middle ground.
  - **Option C — Sanity (or similar headless CMS):** best long-term editing experience for a team that publishes regularly (they've shipped ~10 posts in a few months), small monthly cost/complexity.
  - *Recommendation: Option C if the agency will keep publishing weekly/biweekly; Option B if publishing is occasional and low-friction beats extra infra.*
- [ ] Migrate all posts + rebuild blog index/detail templates matching new design
- [ ] 301 redirect map from old WordPress URLs to new slugs (preserve existing SEO equity — critical, this is an SEO agency's own site)

## Phase 6 — SEO & Performance
*(Non-negotiable given this is literally what Bluvig sells — the site itself has to be the best proof they have.)*
- [ ] Technical SEO: sitemap.xml, robots.txt, canonical tags, structured data (Organization, LocalBusiness, Article, FAQ schema)
- [ ] Metadata + Open Graph/Twitter cards per page, dynamic OG images for blog posts
- [ ] Core Web Vitals pass — target 90+ Lighthouse across the board (image optimization via `next/image`, font subsetting, minimal JS on marketing pages)
- [ ] Internal linking pass between services ↔ case studies ↔ blog posts
- [ ] Set up Google Search Console, submit new sitemap, monitor redirect coverage post-launch

## Phase 7 — QA & Testing
- [ ] Cross-browser/device testing (mobile-first — screenshots show current site is desktop-card-heavy)
- [ ] Form/tool submission testing end-to-end (lead actually lands in inbox/CRM)
- [ ] Accessibility pass (contrast, focus states, alt text)
- [ ] Copy/proofread pass, broken link check

## Phase 8 — Launch
- [ ] DNS cutover plan (low-TTL window, staging → production swap)
- [ ] Redirect verification (spot-check old URLs from Search Console against new redirect map)
- [ ] Post-launch monitoring: 404 tracking, GA4/Search Console alerts for ranking drops

## Phase 9 — Post-Launch Growth Loop
- [ ] Analytics dashboard for lead sources (which tool/page/CTA converts best)
- [ ] A/B test hero CTA copy and the Get Started flow
- [ ] Monthly content upgrades tied to blog posts (see Genius Ideas)

---

## Genius Ideas — Turning This Into an Actual Leads Engine

Bluvig's own pitch is "we build cash flow, not vanity metrics" and "Discovery Engine" — the site should *demonstrate* that promise, not just claim it. Ranked by leverage:

1. **Visibility Checker (flagship tool).** Visitor enters their business name/URL → the tool checks Google indexing status, basic on-page SEO signals, and (the killer differentiator) simulates whether ChatGPT/Gemini-style answers would surface them for a relevant query. Free headline score, full breakdown gated behind email. This directly productizes the "Discovery Engine" pitch and is genuinely novel — most agency sites only offer generic "SEO audits."
2. **Cash-flow / ROI calculator.** Input current monthly traffic + conversion rate + average deal value → project revenue uplift from improved visibility. Ties straight into "we build cash flow" messaging and gives sales conversations a concrete number to anchor on.
3. **Inline booking, not a click-out.** Replace "Book a FREE Clarity Call" as a link with an embedded calendar (Cal.com) directly on the page — every extra click before booking loses leads.
4. **Multi-step qualifying form.** Instead of one generic contact form, ask 3–4 quick questions (business type, main goal, rough budget) before contact details. Higher completion rates than long forms, and sales gets pre-qualified leads instead of cold "tell me more" emails.
5. **Toolbox expansion + gating.** Grow Readability Checker/QR Baker into a small suite (e.g. add a "Meta Tag Preview," "Page Speed Snapshot," "Local SEO Checklist Generator"). Each is cheap to build, ranks well on its own for tool-intent keywords, and is a natural email-capture point.
6. **Proof-driven case studies.** Replace the current card-only case study grid with real before/after numbers — traffic charts, ranking screenshots, "X leads/month" — for at least 2–3 flagship projects. Nothing sells an SEO agency like their own visible results.
7. **Content upgrades per blog post.** Each blog post gets a matching downloadable (checklist/template PDF) gated by email — turns existing blog traffic into a list instead of just pageviews.
8. **AI chatbot pre-qualifier.** A simple chat widget trained on Bluvig's services/FAQ that can answer basic questions and route to the booking flow — reinforces the "AI-powered" brand story while doing real lead-qualifying work.
9. **Social proof ticker/counter.** "X Kenyan businesses helped," live or periodically-updated — cheap trust signal near the hero.
10. **Rough pricing/starting-at ranges.** Most agencies hide pricing; showing ballpark ranges filters out unqualified leads before they waste a call slot, and signals confidence.

**Suggested build order for Phase 4:** #3 and #4 first (cheap, immediate conversion lift on existing traffic) → #1 (flagship differentiator, worth the build time) → #6 and #2 → rest as backlog.
