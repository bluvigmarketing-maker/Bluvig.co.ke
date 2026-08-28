# Bluvig Design System

Adapted from a navy/gold reference system, re-hued for Bluvig's brand blue + a refined amber-gold accent. Structure, spacing, motion, and component anatomy are unchanged from the source system — only §2 (color) is re-derived. Everything downstream (Tailwind config, components) should reference the tokens in §2, never raw hex.

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Server Components by default, Vercel-native |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`) | Design tokens live in `globals.css` via `@theme` |
| Component primitives | shadcn/ui (style: `base-nova`, built on `@base-ui/react`) | Accessible Button/Dialog/Sheet/DropdownMenu/NavigationMenu/Badge/Card out of the box |
| Motion | Framer Motion | Scroll-triggered reveal animations |
| Icons | lucide-react | Consistent line-icon set throughout |
| Fonts | `next/font/google`: Geist (sans), Geist Mono, Playfair Display (headings) | Serif display for headline authority + clean sans body — reads editorial/premium rather than generic SaaS |

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --import-alias "@/*"
npx shadcn@latest init -d
npx shadcn@latest add button dialog dropdown-menu navigation-menu sheet separator badge card -y
npm install framer-motion lucide-react
```

This updates the stack noted in `MILESTONES.md` Phase 0 — add shadcn/ui, Framer Motion, lucide-react, and the Geist + Playfair Display font pairing to the base Next.js/Tailwind setup.

## 2. Color System

Two hue families only: a **navy scale** (primary/structural — carried over from Bluvig's existing brand blue, but deepened and refined for a premium feel) and an **amber-gold scale** (accent/CTA — evolved from Bluvig's current flat orange into a richer, more "burnished" gold-orange). Semantic red is inherited from shadcn's default `--destructive` for error states only.

**Why these exact hues, not a hard rebrand:** the live site is already blue + orange, and the SEO/Tools page already uses a near-black navy hero. Keeping the same two hues preserves brand recognition (existing traffic, backlinks, social profiles all show blue/orange Bluvig) while the *execution* — true near-black structural navy, a richer amber instead of flat orange, serif display headlines, generous whitespace, consistent card/section system — is what actually delivers "high end." A hue swap wasn't needed; a craft upgrade was.

### 2.1 Raw scale (defined once, in `:root`)

```css
:root {
  --navy-50:  #eef2fb;
  --navy-100: #dce3f5;
  --navy-200: #b7c8ea;
  --navy-300: #8ca6da;
  --navy-400: #5f80c4;
  --navy-500: #3d5fa8;
  --navy-600: #2a4a8c;   /* primary brand navy — refined, deeper version of Bluvig's current blue */
  --navy-700: #223c70;
  --navy-800: #1c3057;
  --navy-900: #16253f;
  --navy-950: #0b1220;   /* darkest surface — headers/footers/hero overlays */

  --gold-50:  #fdf3e7;
  --gold-100: #fae3c4;
  --gold-200: #f4c889;
  --gold-300: #edaa57;
  --gold-400: #e2903a;   /* ring/focus color */
  --gold-500: #d97706;   /* "amber-gold" — accent/secondary, evolved from Bluvig's flat orange */
  --gold-600: #b85f05;
  --gold-700: #8f4a08;   /* accent text on light backgrounds (AA-safe) */
  --gold-800: #6c380a;
  --gold-900: #4d280a;
}
```

### 2.2 Semantic tokens (map the scale to meaning, light + dark)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: var(--navy-950);
  --primary: var(--navy-600);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: var(--gold-500);
  --secondary-foreground: var(--navy-950);
  --muted: var(--navy-50);
  --muted-foreground: var(--navy-700);
  --accent: var(--gold-100);
  --accent-foreground: var(--navy-900);
  --border: var(--navy-100);
  --input: var(--navy-100);
  --ring: var(--gold-400);
}

.dark {
  --background: var(--navy-950);
  --foreground: oklch(0.985 0 0);
  --primary: var(--gold-500);           /* inverts: gold becomes primary in dark mode */
  --primary-foreground: var(--navy-950);
  --secondary: var(--navy-700);
  --muted: var(--navy-800);
  --muted-foreground: var(--navy-200);
  --accent: var(--navy-800);
  --accent-foreground: var(--gold-300);
  --ring: var(--gold-400);
}
```

### 2.3 Usage rules

- **Dark `navy-950` surfaces:** page hero banners, the footer, primary nav on interior pages — reserved for "big structural blocks," never body copy backgrounds. (The current SEO/Tools page hero already uses a near-black navy — this makes it consistent site-wide instead of one-off.)
- **White/near-white surfaces:** default page background, all cards.
- **`navy-50`:** subtle section backgrounds to break up all-white pages (e.g. the services grid sits on `bg-navy-50` between two white sections) — this directly fixes the current dead-whitespace problem between homepage sections.
- **`gold-400/60` border ("gold-line"):** thin gold outline on emphasized cards, buttons, and dividers — see §4.2.
- **`gold-700` text on white / `gold-300` text on `navy-950`:** eyebrow label color and accent text — always the 700-step on light backgrounds, 300-step on dark, for contrast.
- Never use gold as a large fill for body text backgrounds — it's an accent, not a surface color.
- **Logo:** keep the BLUVIG wordmark blue close to `navy-500`/`navy-600` so it stays legible at small sizes against the new deeper palette — don't force it all the way to `navy-950`.

## 3. Typography

```tsx
// app/layout.tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
```

```css
--font-display: var(--font-playfair);
--font-heading: var(--font-display);   /* aliased so `font-heading` utility works */

@layer base {
  html { @apply font-sans; }              /* Geist Sans is the default body font */
  h1, h2, h3, h4 { @apply font-heading; } /* every heading auto-gets Playfair Display */
}
```

- Headings (h1–h4): always serif display, semibold–bold.
- Body copy: always Geist Sans, regular, `text-navy-700` (not pure black) for warmth against the navy palette.
- Pull-quotes / client testimonial lines: `font-heading` + italic even when not a semantic heading — serif italic signals "quoted, credible" throughout (good fit for testimonials and case-study result callouts).
- Monospace (`font-mono`, Geist Mono): reserved for literal technical strings only (e.g. a URL in a case study, a code snippet in the Digital Marketing Training page) — never decorative.
- Eyebrow/label text: `text-xs font-semibold uppercase tracking-wide`.

## 4. Core Component Patterns

### 4.1 Buttons

Base button from shadcn (`components/ui/button.tsx`), variants `default | outline | secondary | ghost | destructive | link`, sizes `xs | sm | default | lg | icon`. Two custom utility classes layer on for brand CTAs:

```css
@layer utilities {
  .btn-metallic {
    background-image: linear-gradient(
      110deg,
      var(--gold-600) 0%, var(--gold-300) 30%, var(--gold-500) 45%,
      var(--gold-100) 55%, var(--gold-500) 70%, var(--gold-600) 100%
    );
    background-size: 250% 100%;
    color: var(--navy-950);
    animation: shimmer 5s linear infinite;
  }
  .btn-metallic:hover { animation-duration: 1.8s; }

  .gold-line { @apply border border-gold-400/60; }
}

@keyframes shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: -200% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .btn-metallic { animation: none; }
}
```

Every primary CTA site-wide ("Get Started," "Book a FREE Clarity Call," "Explore"):

```tsx
<Button className="btn-metallic gold-line font-semibold">Book a FREE Clarity Call</Button>
```

Secondary/outline CTAs on a dark hero:

```tsx
<Button variant="outline" className="gold-line border-white/40 bg-transparent text-white hover:bg-white/10">
  What is "Discovery Engine"?
</Button>
```

### 4.2 Cards

```tsx
// Standard card
<div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">…</div>

// Emphasized card ("gold-line") — e.g. the SEO/flagship service card
<div className="gold-line rounded-2xl border bg-white p-6">…</div>
```

Interactive/clickable cards (service cards, case study cards) add a lift-on-hover:

```
className="transition-transform hover:-translate-y-1 hover:shadow-md"
```

Dark cards (sparingly — e.g. the "Outcomes" block on the SEO page): `bg-navy-950 text-white`.

Radius scale: `rounded-lg` (buttons/inputs) → `rounded-xl`/`rounded-2xl` (cards, most common) → `rounded-3xl` (large hero-ish feature cards). Never sharp corners.

### 4.3 Section heading

```tsx
<span className="rounded-full border border-gold-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700">
  Discovery Engine
</span>
<h2 className="font-heading text-3xl font-semibold text-navy-950 sm:text-4xl">What We Do</h2>
<span className="h-px w-16 bg-gold-400" />
<p className="max-w-2xl text-navy-700">Optional supporting description.</p>
```

On a dark background, swap to `border-gold-400/40 text-gold-300` (eyebrow), `text-white` (title), `text-navy-100` (description).

### 4.4 Page hero banner (interior pages)

```tsx
<div className="bg-navy-950 py-16 text-center text-white sm:py-20">
  <span className="rounded-full border border-gold-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-300">
    SEO
  </span>
  <h1 className="font-heading text-4xl font-bold sm:text-5xl">Business Discovery Engine</h1>
  <span className="h-px w-16 bg-gold-400" />
  <p className="max-w-2xl text-navy-100">Get found online — SEO, AI optimization, and social content, combined.</p>
</div>
```

### 4.5 Badges

```tsx
<Badge variant="outline" className="gold-line text-navy-800">AI-Powered</Badge>
```

### 4.6 Header / Navigation

- Sticky, `bg-background/95 backdrop-blur`, `border-b border-navy-100`.
- Desktop: horizontal links (Home · What We Do · Case Studies · Blog · Tools) + shadcn `DropdownMenu` for "What We Do" (SEO / Website Development / Digital Marketing Training / Graphic Design), plus a `btn-metallic` "Get Started" CTA on the far right.
- Mobile (`< md`): hamburger opens a shadcn `Sheet` (slide-in drawer), flat indented list, children nested under a left border.
- Logo: `h-12 sm:h-14` — always sized generously, never shrunk to fit a cramped bar.

### 4.7 Footer

`bg-navy-950 text-navy-100`, three-column grid (brand + tagline / quick links / contact — phone, email, WhatsApp). Logo sits inside a white rounded badge (`rounded-xl bg-white px-4 py-2.5`) since the BLUVIG wordmark would vanish directly on navy-950. Bottom bar: centered copyright, `border-t border-navy-800`, `text-xs text-navy-400`.

### 4.8 Forms

```
className="rounded-lg border border-navy-200 px-3 py-2 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40"
```

Every field: `<label>` above input, `text-sm font-medium text-navy-900`. Applies to the "Get Started" multi-step form and tool inputs (Visibility Checker, Readability Checker, QR Baker) from `MILESTONES.md` Phase 4.

## 5. Motion

```tsx
"use client";
import { motion } from "framer-motion";

export function AnimatedSection({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- Wrap each logical content block (a card, a text column, a section) in its own `<AnimatedSection>` — not the whole page.
- Grids stagger via `delay={index * 0.05}` (or `0.1` for 2-up).
- `viewport={{ once: true }}` — plays once on first scroll into view.
- The hero itself is not animated (already visible on load) — only below-the-fold content animates in.
- Hover lifts (`hover:-translate-y-1`) are plain CSS transitions, not Framer Motion.
- Respect `prefers-reduced-motion`.

## 6. Iconography

`lucide-react` exclusively. Inline icon next to text: `<Icon className="size-4" aria-hidden="true" />` immediately before the text, `gap-1.5`–`gap-2` flex container. Icons `aria-hidden="true"` when paired with visible text. Icon color: `text-gold-600`/`text-gold-700` for accents next to headings, `currentColor` inside buttons.

## 7. Imagery

- Hero/banner photography: full-bleed, `object-cover`, dark gradient overlay for legible white text: `bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40`.
- Case study / team portraits: fixed aspect ratio (`aspect-[4/5]`), `object-cover`, rounded to match surrounding card.
- Empty/missing-image state: never a broken image — solid `bg-navy-100` (light) or `bg-navy-950` (dark) placeholder with a muted icon or the item's title centered in it.
- Logo on dark backgrounds: never CSS-filter the wordmark (invert/brightness-0 can render a solid block if the source isn't transparent) — check for transparency first, or place it on the white badge described in §4.7.

## 8. Layout Conventions

- Global content width: `mx-auto max-w-6xl px-4 sm:px-6` (a shared `Container` component).
- Vertical rhythm: sections `py-16` by default; dark/banner sections `py-16 sm:py-20`.
- Grids: `gap-5`/`gap-6`, responsive column counts (`sm:grid-cols-2 lg:grid-cols-3`), never more than 3 columns for card grids.
- Mobile-first everywhere: base styles target mobile, `sm:`/`md:`/`lg:` layer up.

## 9. Glassmorphism Accents

Applied as an accent for tech/premium feel — **on dark or gradient surfaces only**, never as the default treatment for dense content grids (case study cards, blog cards, service card grids). Glass over plain white with nothing behind it just looks like a faint gray box; glass needs a colorful, blurred surface underneath to read as "glass."

### 9.1 Utility classes

```css
@layer utilities {
  .glass {
    background: color-mix(in oklch, white 8%, transparent);
    border: 1px solid color-mix(in oklch, white 18%, transparent);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
  }
  .glass-light {
    background: color-mix(in oklch, white 65%, transparent);
    border: 1px solid color-mix(in oklch, white 60%, var(--navy-200));
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
  }
  .glass-gold {
    background: color-mix(in oklch, var(--gold-400) 12%, transparent);
    border: 1px solid color-mix(in oklch, var(--gold-400) 45%, transparent);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
  }
}
```

A `@supports not (backdrop-filter: ...)` fallback swaps each to a ~94%-opaque solid so unsupported browsers still get a readable panel instead of a washed-out one.

- `.glass` — on `navy-950` surfaces (Discovery Engine cards, Final CTA panel, dark outline buttons).
- `.glass-light` — on white/`navy-50` surfaces where a frosted card should stand apart from plain white cards. Used sparingly (e.g. the sticky header).
- `.glass-gold` — the accent variant: dark-section eyebrow pills, the featured/flagship service card, secondary buttons on dark CTA bands.

### 9.2 GlowOrbs

Glass panels need something colorful blurred behind them. `<GlowOrbs variant="dark" | "light" />` renders 2–3 absolutely-positioned, heavily-blurred (`blur-[90-100px]`) navy/gold circles as a decorative background layer:

```tsx
<section className="relative overflow-hidden bg-navy-950 ...">
  <GlowOrbs variant="dark" />
  <Container className="relative z-10">...</Container>
</section>
```

Always: `relative overflow-hidden` on the section, `GlowOrbs` as the first child, and `relative z-10` on the actual content wrapper so it sits above the orbs. `aria-hidden="true"`, `pointer-events-none` — decorative only.

### 9.3 Where it's used

Hero (`variant="light"` orbs + `.glass-gold` eyebrow), `PageHero` (`variant="dark"` orbs + `.glass-gold` eyebrow — every interior page inherits this), `DiscoveryEngine` (`.glass` pillar cards over `variant="dark"` orbs), featured service card (`.glass-gold`), `FinalCta` (`.glass` panel + `.glass-gold` secondary button over `variant="dark"` orbs), sticky `Header` (plain `bg-white/70 backdrop-blur-xl`, not the `.glass` class, since a full-width bar needs a bottom-only border rather than the class's all-sides shorthand border).

## 10. Applying This — Checklist

1. Scaffold Next.js + Tailwind v4 + shadcn/ui (`base-nova`) + Framer Motion + lucide-react (§1).
2. Wire the navy/gold scales from §2.1 into `@theme inline` + `:root`/`.dark` exactly as in §2.2.
3. Set up Geist (sans) + Playfair Display (heading) via `next/font/google` (§3).
4. Build shared primitives first, in this order: `Container`, `SectionHeading`, `PageHero`, `AnimatedSection`, `GlowOrbs`, the `.btn-metallic`/`.gold-line`/`.glass*` utilities — every page composes from these.
5. Build `Header` (sticky + dropdown + mobile `Sheet`) and `Footer` (dark, logo badge) once, shared via a route-group layout.
6. For every new page: `PageHero` → one or more `Container`-wrapped sections, each wrapped in `AnimatedSection`, headings via `SectionHeading`.
7. Re-use the exact class strings from §4 verbatim across pages — consistency comes from copying the same Tailwind combinations, not reinventing similar ones per page.
8. Reach for glass (§9) only on dark/gradient sections with `GlowOrbs` behind them — not on the default content-grid cards.
