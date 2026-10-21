/**
 * Text-parsing helpers for the blog's SEO/AEO analyzer. No NLP libraries:
 * every function is a documented heuristic, the same class of check Yoast
 * runs (counting and regexes). The word lists are English-only.
 */

export function stripHtml(html: string): string {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function getWords(text: string): string[] {
  return (text.match(/[A-Za-z0-9'’-]+/g) ?? []).filter(Boolean);
}

export function getSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Approximate syllables per word: vowel groups, with common English endings. */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const stripped = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function fleschReadingEase(text: string): number {
  const sentences = getSentences(text);
  const words = getWords(text);
  if (sentences.length === 0 || words.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score =
    206.835 -
    1.015 * (words.length / sentences.length) -
    84.6 * (syllables / words.length);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

const TRANSITION_WORDS = [
  "however", "therefore", "moreover", "furthermore", "additionally",
  "meanwhile", "consequently", "for example", "for instance", "in fact",
  "in addition", "as a result", "because", "since", "although",
  "in other words", "in short", "first", "second", "third", "finally",
  "next", "then", "also", "similarly", "in contrast", "on the other hand",
  "overall", "in summary", "specifically",
];

const TRANSITION_RE = new RegExp(
  `\\b(${TRANSITION_WORDS.join("|")})\\b`,
  "i"
);

export function transitionWordSentenceRatio(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  const withTransition = sentences.filter((s) => TRANSITION_RE.test(s));
  return withTransition.length / sentences.length;
}

const QUESTION_WORDS = [
  "what", "why", "how", "when", "where", "who", "which", "can", "does", "do",
  "is", "are", "should", "will",
];

export function looksLikeQuestion(heading: string): boolean {
  const trimmed = heading.trim();
  if (trimmed.endsWith("?")) return true;
  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";
  return QUESTION_WORDS.includes(firstWord);
}

export function keywordOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "gi");
  return (text.match(re) ?? []).length;
}
