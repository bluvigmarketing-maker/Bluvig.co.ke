import type { Metadata } from "next";
import { BookOpenCheck, Bot, LineChart } from "lucide-react";

import { ServiceDetail } from "@/components/site/service-detail";

export const metadata: Metadata = {
  title: "Digital Marketing Training",
  description:
    "Practical digital marketing training teaching SEO, ads, AI tools, and growth strategies for real-world business results.",
};

export default function DigitalMarketingTrainingPage() {
  return (
    <ServiceDetail
      data={{
        eyebrow: "Digital Marketing Training",
        title: "Learn the System, Not Just the Tools",
        heroDescription:
          "Practical digital marketing training teaching SEO, ads, AI tools, and growth strategies for real-world business results.",
        intro:
          "Most training courses teach platforms. We teach the strategy underneath them, so what you learn keeps working as the tools change.",
        features: [
          {
            icon: LineChart,
            title: "SEO Fundamentals",
            description:
              "Understand how search actually works — technical basics, content strategy, and what really moves rankings.",
          },
          {
            icon: Bot,
            title: "Ads & AI Tools",
            description:
              "Hands-on with the ad platforms and AI tools that make campaigns faster to run and easier to optimize.",
          },
          {
            icon: BookOpenCheck,
            title: "Growth Strategy Coaching",
            description:
              "Apply what you learn to your own business or clients, with practical frameworks instead of theory.",
          },
        ],
      }}
    />
  );
}
