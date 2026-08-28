import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { CaseStudies } from "@/components/home/case-studies";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Websites, tools, and campaigns Bluvig has shipped for Kenyan businesses.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Case Studies"
        description="A selection of websites, tools, and campaigns we've shipped for Kenyan businesses."
      />
      <CaseStudies showViewAll={false} />
      <FinalCta />
    </>
  );
}
