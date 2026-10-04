import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";

import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { StartWizard } from "@/components/get-started/start-wizard";
import type { Pricing } from "@/lib/estimator/pricing";
import { getPricing } from "@/lib/estimator/store";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Get a call back, pick your website features yourself, or let us recommend the best setup for your budget.",
};

// Uses live prices for the budget recommender.
export const dynamic = "force-dynamic";

export default async function GetStartedPage() {
  let pricing: Pricing | null = null;
  try {
    pricing = await getPricing();
  } catch (error) {
    console.error("[get-started]", error);
  }

  return (
    <>
      <PageHero
        eyebrow="Get Started"
        title="Let's Plan Your Website"
        description="A couple of quick questions and we'll point you to the right next step — no jargon, no pressure."
      />
      <section className="bg-white py-14 sm:py-20">
        <Container className="flex flex-col gap-12">
          {pricing ? (
            <StartWizard pricing={pricing} />
          ) : (
            <p className="mx-auto max-w-lg text-center text-navy-700">
              Our planner is temporarily unavailable — please call or WhatsApp
              us below and we&rsquo;ll help you directly.
            </p>
          )}
          <div className="mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-navy-100 pt-6 text-sm text-navy-700">
            <span>Prefer to reach us directly?</span>
            <a
              href="tel:+254700574125"
              className="flex items-center gap-1.5 font-medium text-navy-900 hover:text-navy-600"
            >
              <Phone className="size-4" aria-hidden="true" />
              +254 700 574 125
            </a>
            <a
              href="mailto:collins@bluvig.co.ke"
              className="flex items-center gap-1.5 font-medium text-navy-900 hover:text-navy-600"
            >
              <Mail className="size-4" aria-hidden="true" />
              collins@bluvig.co.ke
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
