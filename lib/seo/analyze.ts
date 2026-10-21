import {
  stripHtml,
  getWords,
  getSentences,
  fleschReadingEase,
  readingTimeMinutes,
  transitionWordSentenceRatio,
  looksLikeQuestion,
  keywordOccurrences,
} from "./text-stats";

/**
 * Live SEO / Readability / AEO / GEO audit for a blog post, Yoast-style.
 * Pure heuristics, no network calls: instant, free and offline. Needs
 * DOMParser for the HTML checks, so run it in the browser (on the server
 * only the text-based checks run).
 *
 * Score per category = checks averaged (good 1, ok 0.5, bad 0) × 100.
 */

export type CheckStatus = "good" | "ok" | "bad";
export type CheckCategory = "seo" | "readability" | "aeo" | "geo";

export interface SeoCheck {
  id: string;
  category: CheckCategory;
  status: CheckStatus;
  label: string;
  /** Always the actionable fix (or why it passed). */
  message: string;
}

export interface AnalyzeInput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  contentHtml: string;
  excerpt: string;
  faqItemCount: number;
  /** This site's hostname, e.g. "bluvig.co.ke", to tell internal links from outbound ones. */
  siteHost: string;
  /** Focus keywords of the site's other posts, to flag two posts competing for one keyword. */
  otherFocusKeywords?: string[];
}

export interface AnalyzeResult {
  checks: SeoCheck[];
  scores: Record<CheckCategory, number>;
  overallScore: number;
  wordCount: number;
  readingTimeMinutes: number;
}

function categoryScore(checks: SeoCheck[], category: CheckCategory): number {
  const inCategory = checks.filter((c) => c.category === category);
  if (inCategory.length === 0) return 0;
  const points = inCategory.reduce(
    (sum, c) => sum + (c.status === "good" ? 1 : c.status === "ok" ? 0.5 : 0),
    0
  );
  return Math.round((points / inCategory.length) * 100);
}

function check(
  id: string,
  category: CheckCategory,
  status: CheckStatus,
  label: string,
  message: string
): SeoCheck {
  return { id, category, status, label, message };
}

function isInternal(href: string, siteHost: string) {
  if (href.startsWith("/") || href.startsWith("#")) return true;
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return host === siteHost.replace(/^www\./, "");
  } catch {
    return false;
  }
}

export function analyzeContent(input: AnalyzeInput): AnalyzeResult {
  const checks: SeoCheck[] = [];
  const kw = input.focusKeyword.trim();
  const kwLower = kw.toLowerCase();
  const doc =
    typeof window !== "undefined"
      ? new DOMParser().parseFromString(input.contentHtml, "text/html")
      : null;

  const plainText = stripHtml(input.contentHtml);
  const words = getWords(plainText);
  const wordCount = words.length;
  const sentences = getSentences(plainText);

  /* SEO --------------------------------------------------------------- */

  if (!kw) {
    checks.push(check("focus-keyword", "seo", "bad", "Focus keyword", "Set a focus keyword so the rest of the SEO checks can run against it."));
  } else {
    checks.push(check("focus-keyword", "seo", "good", "Focus keyword", `Focus keyword is set to "${kw}".`));

    const titleForCheck = input.metaTitle || input.title;
    checks.push(
      titleForCheck.toLowerCase().includes(kwLower)
        ? check("kw-in-title", "seo", "good", "Keyword in title", "The focus keyword appears in the SEO title.")
        : check("kw-in-title", "seo", "bad", "Keyword in title", "Put the focus keyword in the SEO title. Titles with the keyword tend to rank and get clicked more.")
    );

    checks.push(
      input.slug.toLowerCase().includes(kwLower.replace(/\s+/g, "-"))
        ? check("kw-in-slug", "seo", "good", "Keyword in slug", "The focus keyword appears in the URL slug.")
        : check("kw-in-slug", "seo", "ok", "Keyword in slug", "Consider working the focus keyword into the URL slug.")
    );

    checks.push(
      input.metaDescription.toLowerCase().includes(kwLower)
        ? check("kw-in-meta-desc", "seo", "good", "Keyword in meta description", "The focus keyword appears in the meta description.")
        : check("kw-in-meta-desc", "seo", "bad", "Keyword in meta description", "Add the focus keyword to the meta description to reinforce relevance in search results.")
    );

    const firstParagraph =
      doc?.querySelector("p")?.textContent ?? plainText.slice(0, 300);
    checks.push(
      firstParagraph.toLowerCase().includes(kwLower)
        ? check("kw-in-intro", "seo", "good", "Keyword in introduction", "The focus keyword appears early, in the first paragraph.")
        : check("kw-in-intro", "seo", "bad", "Keyword in introduction", "Use the focus keyword in the first paragraph so readers and search engines see relevance immediately.")
    );

    const occurrences = keywordOccurrences(plainText, kw);
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;
    if (wordCount === 0) {
      checks.push(check("kw-density", "seo", "bad", "Keyword density", "Add content before keyword density can be measured."));
    } else if (density === 0) {
      checks.push(check("kw-density", "seo", "bad", "Keyword density", "The focus keyword doesn't appear in the body content at all."));
    } else if (density > 3) {
      checks.push(check("kw-density", "seo", "bad", `Keyword density (${density.toFixed(1)}%)`, "The keyword is used too often. Search engines read this as keyword stuffing, so thin it out."));
    } else if (density < 0.5) {
      checks.push(check("kw-density", "seo", "ok", `Keyword density (${density.toFixed(1)}%)`, "The keyword is used a little sparsely. Aim for roughly 0.5 to 2.5% of the text."));
    } else {
      checks.push(check("kw-density", "seo", "good", `Keyword density (${density.toFixed(1)}%)`, "Keyword density is in a healthy range."));
    }

    if (input.otherFocusKeywords?.some((k) => k.trim().toLowerCase() === kwLower)) {
      checks.push(check("kw-unique", "seo", "ok", "Keyword reuse", "Another post already targets this exact focus keyword. Posts competing for the same keyword can cannibalize each other's rankings."));
    }
  }

  const metaTitleLen = (input.metaTitle || input.title).length;
  if (metaTitleLen === 0) {
    checks.push(check("title-length", "seo", "bad", "SEO title length", "Add an SEO title."));
  } else if (metaTitleLen < 30 || metaTitleLen > 60) {
    checks.push(check("title-length", "seo", "ok", `SEO title length (${metaTitleLen})`, "Aim for roughly 30 to 60 characters so the title isn't cut off in search results."));
  } else {
    checks.push(check("title-length", "seo", "good", `SEO title length (${metaTitleLen})`, "Title length is in the sweet spot for search results."));
  }

  const metaDescLen = input.metaDescription.length;
  if (metaDescLen === 0) {
    checks.push(check("meta-desc-length", "seo", "bad", "Meta description", "Write a meta description. Without one, search engines pick a snippet from the page themselves."));
  } else if (metaDescLen < 120 || metaDescLen > 156) {
    checks.push(check("meta-desc-length", "seo", "ok", `Meta description length (${metaDescLen})`, "Aim for roughly 120 to 156 characters so it isn't truncated in search results."));
  } else {
    checks.push(check("meta-desc-length", "seo", "good", `Meta description length (${metaDescLen})`, "Meta description length is in a good range."));
  }

  if (wordCount < 300) {
    checks.push(check("content-length", "seo", "bad", `Content length (${wordCount} words)`, "Aim for at least 300 words. Thin content struggles to rank."));
  } else if (wordCount < 600) {
    checks.push(check("content-length", "seo", "ok", `Content length (${wordCount} words)`, "Decent length. 600+ words tends to cover a topic more thoroughly."));
  } else {
    checks.push(check("content-length", "seo", "good", `Content length (${wordCount} words)`, "Content length gives you room to cover the topic in depth."));
  }

  const hrefs = doc
    ? Array.from(doc.querySelectorAll("a[href]")).map((a) => a.getAttribute("href") ?? "")
    : [];
  const internalLinks = hrefs.filter((h) => isInternal(h, input.siteHost));
  const externalLinks = hrefs.filter(
    (h) => /^https?:\/\//i.test(h) && !isInternal(h, input.siteHost)
  );
  checks.push(
    externalLinks.length > 0
      ? check("outbound-links", "seo", "good", "Outbound links", "The post links out to at least one external source.")
      : check("outbound-links", "seo", "ok", "Outbound links", "Consider linking to an authoritative external source to back up your claims.")
  );
  checks.push(
    internalLinks.length > 0
      ? check("internal-links", "seo", "good", "Internal links", "The post links to another page on the site.")
      : check("internal-links", "seo", "ok", "Internal links", "Link to a relevant service, case study or another post to help visitors (and search engines) move through the site.")
  );

  const images = doc ? Array.from(doc.querySelectorAll("img")) : [];
  if (images.length === 0) {
    checks.push(check("images", "seo", "ok", "Images", "Add at least one image. Posts with visuals tend to perform better."));
  } else {
    const missingAlt = images.filter((img) => !img.getAttribute("alt")?.trim());
    checks.push(
      missingAlt.length === 0
        ? check("images", "seo", "good", "Image alt text", "All images have alt text.")
        : check("images", "seo", "bad", "Image alt text", `${missingAlt.length} of ${images.length} image(s) are missing alt text. Click an image and use "Alt text" in the toolbar (ideally include the focus keyword on one).`)
    );
  }

  const headings = doc ? Array.from(doc.querySelectorAll("h2, h3")) : [];
  if (wordCount > 300 && headings.length === 0) {
    checks.push(check("headings", "seo", "bad", "Subheadings", "Break the content up with H2/H3 subheadings. Long unbroken text is hard to scan."));
  } else if (headings.length > 0) {
    checks.push(check("headings", "seo", "good", "Subheadings", "Content is broken up with subheadings."));
  } else {
    checks.push(check("headings", "seo", "ok", "Subheadings", "Short posts don't need many subheadings yet. Add some as it grows."));
  }

  /* Readability ------------------------------------------------------- */

  if (wordCount === 0) {
    checks.push(check("flesch", "readability", "bad", "Reading ease", "Add content to measure readability."));
  } else {
    const flesch = fleschReadingEase(plainText);
    if (flesch >= 60) {
      checks.push(check("flesch", "readability", "good", `Reading ease (${flesch})`, "Easy to read for a general audience."));
    } else if (flesch >= 30) {
      checks.push(check("flesch", "readability", "ok", `Reading ease (${flesch})`, "Fairly difficult. Shorter sentences and simpler words would help."));
    } else {
      checks.push(check("flesch", "readability", "bad", `Reading ease (${flesch})`, "Hard to read. Break up long sentences and use plainer language."));
    }
  }

  if (sentences.length > 0) {
    const longSentences = sentences.filter((s) => getWords(s).length > 20);
    const ratio = longSentences.length / sentences.length;
    checks.push(
      ratio > 0.25
        ? check("sentence-length", "readability", "bad", `Long sentences (${Math.round(ratio * 100)}%)`, "Over a quarter of sentences are longer than 20 words. Split some of them up.")
        : check("sentence-length", "readability", "good", "Sentence length", "Sentence length is comfortable throughout.")
    );

    const transitionRatio = transitionWordSentenceRatio(sentences);
    checks.push(
      transitionRatio < 0.2
        ? check("transitions", "readability", "ok", `Transition words (${Math.round(transitionRatio * 100)}%)`, "Use more transition words (however, therefore, for example...) to help the text flow.")
        : check("transitions", "readability", "good", `Transition words (${Math.round(transitionRatio * 100)}%)`, "Good use of transition words to connect ideas.")
    );

    let repeats = 0;
    for (let i = 1; i < sentences.length; i++) {
      const a = getWords(sentences[i - 1])[0]?.toLowerCase();
      const b = getWords(sentences[i])[0]?.toLowerCase();
      if (a && a === b) repeats++;
    }
    checks.push(
      repeats > 1
        ? check("consecutive-sentences", "readability", "ok", "Consecutive sentences", `${repeats} pairs of consecutive sentences start with the same word. Vary the openings.`)
        : check("consecutive-sentences", "readability", "good", "Consecutive sentences", "Sentence openings are varied.")
    );
  }

  if (doc) {
    const paragraphs = Array.from(doc.querySelectorAll("p"));
    const longParagraphs = paragraphs.filter(
      (p) => getWords(p.textContent ?? "").length > 150
    );
    checks.push(
      longParagraphs.length > 0
        ? check("paragraph-length", "readability", "ok", "Paragraph length", `${longParagraphs.length} paragraph(s) are quite long. Break them up so they're easier to scan.`)
        : check("paragraph-length", "readability", "good", "Paragraph length", "Paragraphs are a comfortable length.")
    );
  }

  /* AEO: being quoted directly in voice answers and featured snippets ---- */

  const firstPara = doc?.querySelector("p")?.textContent?.trim() ?? "";
  const isDirectAnswer = firstPara.length >= 40 && firstPara.length <= 320;
  checks.push(
    isDirectAnswer
      ? check("direct-answer", "aeo", "good", "Direct-answer opening", "The post opens with a concise, answer-style paragraph: good for featured snippets and AI answers.")
      : check("direct-answer", "aeo", firstPara ? "ok" : "bad", "Direct-answer opening", "Open with a short, direct paragraph (roughly 40 to 320 characters) that answers the title's question. Answer engines quote this first.")
  );

  const questionHeadings = headings.filter((h) => looksLikeQuestion(h.textContent ?? ""));
  checks.push(
    questionHeadings.length > 0
      ? check("question-headings", "aeo", "good", "Question-style headings", `${questionHeadings.length} heading(s) are phrased as questions. These get pulled directly into AI and voice answers.`)
      : check("question-headings", "aeo", "ok", "Question-style headings", 'Phrase at least one subheading as a question (e.g. "How much does...?") to target voice search and AI answers.')
  );

  checks.push(
    input.faqItemCount > 0
      ? check("faq-schema", "aeo", "good", "FAQ content", `${input.faqItemCount} FAQ item(s) added. They're published as FAQ schema for rich results.`)
      : check("faq-schema", "aeo", "ok", "FAQ content", "Add a few FAQ items. FAQ-schema content is one of the formats AI answer engines cite most.")
  );

  const listsOrTables = doc ? doc.querySelectorAll("ul, ol, table").length : 0;
  checks.push(
    listsOrTables > 0
      ? check("structured-content", "aeo", "good", "Structured content", "The post uses lists or tables, which AI systems extract and cite easily.")
      : check("structured-content", "aeo", "ok", "Structured content", "Add a bulleted list or numbered steps where relevant. Structured content is extracted more reliably than plain paragraphs.")
  );

  /* GEO: being cited by ChatGPT, Perplexity, Google AI Overviews ------- */

  const hasStats = /\d+(\.\d+)?\s?%|(\$|KES|Ksh\.?)\s?\d|\b\d{2,}\b/i.test(plainText);
  checks.push(
    hasStats
      ? check("stats", "geo", "good", "Concrete numbers", "The post includes specific numbers. Generative engines favour citing quantified claims.")
      : check("stats", "geo", "ok", "Concrete numbers", "Add a concrete number (a price range, a timeframe, a percentage). Vague claims get cited less than specific ones.")
  );

  checks.push(
    externalLinks.length > 0
      ? check("citations", "geo", "good", "Source citations", "Claims are backed by an outbound link, a trust signal generative engines look for before citing a page.")
      : check("citations", "geo", "ok", "Source citations", "Cite a source (a study, official documentation, a standard). Generative engines weigh well-sourced pages more heavily.")
  );

  checks.push(
    headings.length >= 2
      ? check("scannable-structure", "geo", "good", "Scannable structure", "Multiple subheadings give generative engines clear chunks of content to extract and quote.")
      : check("scannable-structure", "geo", "ok", "Scannable structure", "Add more subheadings so the content breaks into clearly labelled, quotable sections.")
  );

  const scores: Record<CheckCategory, number> = {
    seo: categoryScore(checks, "seo"),
    readability: categoryScore(checks, "readability"),
    aeo: categoryScore(checks, "aeo"),
    geo: categoryScore(checks, "geo"),
  };
  const overallScore = Math.round(
    (scores.seo + scores.readability + scores.aeo + scores.geo) / 4
  );

  return {
    checks,
    scores,
    overallScore,
    wordCount,
    readingTimeMinutes: readingTimeMinutes(wordCount),
  };
}
