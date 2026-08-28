import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { Services } from "@/components/home/services";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "SEO, digital marketing, website development, digital marketing training, and graphic design — everything your business needs to get found and grow.",
};

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What We Do"
        description="Five services that work together as one system — visibility, conversion, and growth."
      />
      <Services />
      <FinalCta />
    </>
  );
}
