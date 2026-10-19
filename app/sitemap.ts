import type { MetadataRoute } from "next";

import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { getCaseStudies } from "@/lib/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caseStudies = await getCaseStudies();
  const page = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly" | "yearly" = "monthly"
  ) => ({ url: `${SITE.url}${path}`, changeFrequency, priority });

  return [
    page("", 1, "weekly"),
    page("/services", 0.9),
    ...SERVICES.map((s) => page(`/services/${s.slug}`, 0.8)),
    page("/quotation", 0.9, "weekly"),
    page("/get-started", 0.8),
    page("/work", 0.7),
    ...caseStudies.map((p) => page(`/work/${p.id}`, 0.6)),
    page("/process", 0.6),
    page("/about", 0.6),
    page("/contact", 0.6),
    page("/blog", 0.5, "weekly"),
    page("/tools", 0.4),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
