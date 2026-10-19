import { PORTFOLIO_SEED } from "@/lib/portfolio-seed";
import type { PortfolioProject } from "@/lib/portfolio-shared";
import { readDoc, updateDoc } from "@/lib/storage";

export * from "@/lib/portfolio-shared";

/**
 * Reading and saving the portfolio (server only). Types and helpers are in
 * lib/portfolio-shared.ts.
 */

interface PortfolioDoc {
  projects?: PortfolioProject[];
}

const KEY = "portfolio";

/** Every project, in display order. Never throws: falls back to the seed. */
export async function getPortfolio(): Promise<PortfolioProject[]> {
  try {
    const doc = await readDoc<PortfolioDoc>(KEY, {});
    return doc.projects ?? PORTFOLIO_SEED;
  } catch (error) {
    console.error("[portfolio] using seed list:", error);
    return PORTFOLIO_SEED;
  }
}

/** For the cockpit: like getPortfolio, but storage errors surface. */
export async function getPortfolioForEditing(): Promise<PortfolioProject[]> {
  const doc = await readDoc<PortfolioDoc>(KEY, {});
  return doc.projects ?? PORTFOLIO_SEED;
}

export async function savePortfolio(projects: PortfolioProject[]) {
  await updateDoc<PortfolioDoc, void>(KEY, {}, (doc) => {
    doc.projects = projects;
  });
  return projects;
}

/** Public view: what the website shows. */
export async function getVisibleProjects() {
  return (await getPortfolio()).filter((p) => p.visible);
}

export async function getCaseStudies() {
  return (await getVisibleProjects()).filter((p) => p.story);
}

