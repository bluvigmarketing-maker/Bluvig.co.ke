import type { Metadata } from "next";
import { Search, Share2, Sparkles } from "lucide-react";

import { ServiceDetail } from "@/components/site/service-detail";

export const metadata: Metadata = {
  title: "SEO — Business Discovery Engine",
  description:
    "SEO services in Kenya that combine search visibility, AI optimization, and social content to make sure your business gets noticed, trusted, and remembered.",
};

export default function SeoPage() {
  return (
    <ServiceDetail
      data={{
        eyebrow: "SEO",
        title: "Business Discovery Engine",
        heroDescription:
          "Get found online. Our Visibility Engine combines SEO, AI optimization, and social content to make sure your business gets noticed, trusted, and remembered — without you doing the tech work.",
        intro:
          "Most businesses miss this: even a stunning website is useless if nobody can find it. We fix that with three pillars working together, not in isolation.",
        features: [
          {
            icon: Search,
            title: "Search Engine Visibility",
            description:
              "We fix technical SEO issues, write helpful keyword-rich content, and build the topical authority that earns long-term Google rankings.",
          },
          {
            icon: Share2,
            title: "Social Media Visibility",
            description:
              "Your content gets repurposed into short, scroll-stopping posts that keep your brand active where your customers already spend time.",
          },
          {
            icon: Sparkles,
            title: "AI Assistant Visibility",
            description:
              "We structure your content so AI assistants like ChatGPT and Gemini can read, quote, and recommend your business automatically.",
          },
        ],
      }}
    />
  );
}
