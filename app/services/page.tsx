import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "Services: Custom Software, Apps & Websites",
  description:
    "Custom business software, web applications, mobile apps, websites, M-Pesa and eTIMS integrations, and SEO, designed and built in Kenya.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="What We Build"
        description="One team for the whole journey: from your first website to the system your company runs on, and the integrations that tie it together."
      />
      <Services heading={false} />
      <Process />
      <FinalCta />
    </>
  );
}
