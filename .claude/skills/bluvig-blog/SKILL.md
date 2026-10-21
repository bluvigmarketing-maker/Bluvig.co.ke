---
name: bluvig-blog
description: Research, write and publish lead-generating blog posts for bluvig.co.ke, optimised for Google, AI Overviews and AI chat assistants (SEO, AEO, GEO). Use when asked to write, research, plan, refresh or publish a Bluvig blog post or article, to fill the blog, or to target a keyword or question for leads. Handles topic research with sources, writing in the house format, branded cover and chart images, scoring with the site's own analyzer, and publishing through the cockpit API.
---

# Bluvig blog: research → write → score → publish

Goal: posts that get **cited by AI Overviews, ChatGPT, Perplexity and Copilot** and rank on Google for questions Kenyan (and international) buyers ask before hiring a software studio, then turn readers into enquiries on `/quotation` or `/contact`.

Everything lives in the repo:

- Sources: `content/blog/<folder>/post.md` (one folder per post, committed)
- State after publishing: `content/blog/<folder>/published.json` (post id, live URL, uploaded image URLs). **Commit it**, so re-runs update the same post instead of creating duplicates.
- Pipeline: `.claude/skills/bluvig-blog/scripts/publish.mjs`

Default author: **Collins Kulei**.

## 1. Pick the topic

Choose questions with **buying intent** that an AI assistant would answer with a recommendation or a price: "how much does X cost in Kenya", "how to do X (M-Pesa, eTIMS…)", "X vs Y", "how to choose a …". Each post must map to a Bluvig service (`lib/services.ts`): websites, web apps, mobile apps, custom software, integrations (M-Pesa, eTIMS, APIs), launch & grow.

Check `content/blog/*/post.md` front matter first: never target a focus keyword another post already uses (it cannibalises rankings). Prefer topics that link naturally to existing posts.

## 2. Research (sources for every fact)

Use subagents in parallel for several topics. Each brief should return a fact sheet with **a URL and date for every number**:

1. Current market prices / ranges in KES (2025–2026 Kenyan sources; flag older ones).
2. Official rules and figures from primary sources (KRA, Safaricom, ODPC, CA, CBK, Google/Apple docs, Kenya Law).
3. Recent stats with exact period (Communications Authority quarterly figures, StatCounter Kenya, Safaricom results).
4. 8–10 "People also ask" style questions.
5. What top-ranking pages cover, and the gaps.

Then pull Bluvig's **own live facts**, which make the post uniquely citable:

- Live prices: fetch `https://www.bluvig.co.ke/quotation` and read the `"pricing":{...}` JSON (module prices by id, `basePriceKes`, `renewalKes`). Module names/descriptions are in `lib/estimator/catalog.ts`; the base website's inclusions are `BASE.includes`.
- Only websites and estimator modules have published prices. Custom software, web apps and integrations into existing systems are **quoted after a call**; say so, don't invent a price.
- Public promises you may repeat (from the live site): fixed quotes; free clickable prototype on request before a deposit; work in short milestones; on time or 10% off (websites); "your code, content, domain and app store listings are yours once the project is paid for"; NDA on request.

Never state as fact anything the research marked uncertain. Never claim certifications, client results or awards that aren't on the site.

## 3. Write `post.md`

```markdown
---
title: How Much Does a Website Cost in Kenya in 2026?
slug: website-cost-in-kenya              # must contain the focus keyword, hyphenated
metaTitle: How Much Does a Website Cost in Kenya? (2026 Prices)   # 30–60 chars, contains keyword
metaDescription: …                       # 120–156 chars, contains keyword
excerpt: …                               # 1–2 sentences for the listing
focusKeyword: website cost in Kenya
secondaryKeywords: a, b, c
category: Website Development            # an existing cockpit category NAME
tags: websites, pricing
schemaType: BlogPosting                  # BlogPosting | Article | TechArticle (how-tos)
coverTitle: …                            # optional shorter title for the cover image
author: Collins Kulei                    # optional, this is the default
---
```

Categories in production: Website Development, Software Development, Integrations, Mobile Apps, SEO, Marketing, AI Marketing. A new category must be created in the cockpit (Blog tab) first.

### Body rules (these are what AI engines quote)

1. **First paragraph = the direct answer** in 40–320 characters, containing the focus keyword and concrete numbers. No preamble.
2. **H2s phrased as the questions people ask** ("How much does…?", "What do you need before…?"). Each section opens with a one-sentence answer, then detail.
3. **Numbers everywhere** (KES prices, dates, percentages, timeframes), each with an inline source link `[Source name](https://…)`. 6–12 outbound citations to primary or reputable sources.
4. **Lists and steps**: at least one bulleted list and one numbered process.
5. **Bluvig section**: what Bluvig charges or does, with links to `/quotation`, the matching `/services/<slug>`, and `/contact`. Helpful, not salesy; one clear call to action at the end.
6. **Internal links** to 1–3 related posts (`/blog/<slug>`), and add a link back to the new post from an older one.
7. **FAQ last**: `## Frequently asked questions`, then 5–7 `### Question?` with 1–3 sentence plain answers. The pipeline turns this into the page's FAQ and FAQPage schema (it is removed from the body).
8. Readability: mostly sentences under 20 words; use transitions (however, therefore, for example, as a result); vary sentence openings; short paragraphs. **No em dashes** (house style), no hype words, British/Kenyan spelling is fine.
9. Length: 850–1,500 words of body is the sweet spot for these questions.

### Images

- A branded **cover** (also the social share image) is drawn automatically from `coverTitle`/`title` and `category`.
- Add a **chart** wherever there are comparable numbers (price ranges, penalties, shares). It's rendered to a branded WebP and uploaded:

````markdown
```chart
{
  "title": "Website cost in Kenya, 2026",
  "subtitle": "Typical one-off build prices in KES",
  "alt": "Bar chart of … (descriptive alt text with the keyword)",
  "rows": [
    { "label": "Small business site", "from": 20000, "value": 100000, "display": "KES 20k to 100k" },
    { "label": "Bluvig standard site", "value": 30000, "display": "KES 30,000", "highlight": true }
  ],
  "source": "Sources: …"
}
```
````

  `from` makes a range bar; `highlight` colours a row in brand blue. Keep labels under ~60 characters.
- Other images: `![alt text](./photo.webp)` on its own line (local files are uploaded) or an `https://` URL.
- Look at the generated `cover.webp` / `chart-N.webp` with the Read tool before publishing.

## 4. Score, then publish

```bash
node .claude/skills/bluvig-blog/scripts/publish.mjs content/blog/<folder> --check   # score only
node .claude/skills/bluvig-blog/scripts/publish.mjs content/blog/<folder>           # publish
```

- `--check` renders images and runs the **site's own analyzer** (`lib/seo/analyze.ts`, the same one in the cockpit) and lists every check that isn't green.
- Publishing is refused below the bar: overall 80, SEO 75, readability 60, AEO 75, GEO 80. Fix the post; only use `--force` if the user insists. Aim for 90+.
- `--draft` saves without publishing (the user can review it in the cockpit at `/cockpit/blog`).
- Credentials: `ADMIN_PASSWORD` from the environment or `.env.local`. Target: `BLUVIG_URL` (default `https://www.bluvig.co.ke`; `http://localhost:3000` for a local test).
- Re-running on the same folder updates the post (it uses the id in `published.json`).

## 5. After publishing

1. Open each live URL and check it returns 200, shows the author, cover, charts and FAQ.
2. Check it appears in `https://www.bluvig.co.ke/sitemap.xml`.
3. Commit `content/blog/<folder>/` (post.md, images, published.json).
4. Give the user the list of live URLs to submit to Google Search Console (URL Inspection → Request indexing) and Bing Webmaster Tools (URL Submission; Bing also feeds ChatGPT and Copilot search).
5. Refresh posts every 6–12 months: re-check prices and stats, update the year in the title, re-run publish. AI engines favour recently updated pages.
