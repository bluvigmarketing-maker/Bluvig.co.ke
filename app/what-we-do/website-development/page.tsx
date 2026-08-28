import type { Metadata } from "next";
import { Gauge, MonitorSmartphone, MousePointerClick } from "lucide-react";

import { ServiceDetail } from "@/components/site/service-detail";

export const metadata: Metadata = {
  title: "Website Development",
  description:
    "High-performance website development in Kenya, focused on speed, mobile usability, and converting visitors into paying customers.",
};

export default function WebsiteDevelopmentPage() {
  return (
    <ServiceDetail
      data={{
        eyebrow: "Website Development",
        title: "Websites Built to Perform, Not Just Look Good",
        heroDescription:
          "High-performance website development focused on speed, mobile usability, and converting visitors into paying customers.",
        intro:
          "A beautiful site that loads slowly or confuses mobile visitors is a leaky bucket. We build for the metrics that actually matter to your business.",
        features: [
          {
            icon: Gauge,
            title: "Speed & Performance",
            description:
              "Every site is built for fast load times and strong Core Web Vitals — because slow sites lose both visitors and Google rankings.",
          },
          {
            icon: MonitorSmartphone,
            title: "Mobile-First UX",
            description:
              "Designed and tested for the device most of your customers actually use first — clean, fast, and easy to navigate on any screen.",
          },
          {
            icon: MousePointerClick,
            title: "Conversion-Focused Design",
            description:
              "Every page is structured around a clear next step, so traffic turns into enquiries instead of just pageviews.",
          },
        ],
      }}
    />
  );
}
