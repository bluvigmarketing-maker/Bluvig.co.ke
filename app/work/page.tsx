import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { Work } from "@/components/home/work";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Web apps, websites and products Bluvig has designed and built for businesses in Kenya.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        title="Projects Done by Us"
        description="Products, web apps and websites we've designed and built for businesses in Kenya."
      />
      <Work heading={false} />
      <FinalCta />
    </>
  );
}
