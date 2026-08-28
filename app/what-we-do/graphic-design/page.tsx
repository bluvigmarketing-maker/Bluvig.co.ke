import type { Metadata } from "next";
import { Layers, Palette, Wand2 } from "lucide-react";

import { ServiceDetail } from "@/components/site/service-detail";

export const metadata: Metadata = {
  title: "Graphic Design",
  description:
    "Strategic graphic design services — brand visuals, marketing assets, and digital designs that attract attention and build trust.",
};

export default function GraphicDesignPage() {
  return (
    <ServiceDetail
      data={{
        eyebrow: "Graphic Design",
        title: "Design That Builds Trust at First Glance",
        heroDescription:
          "Strategic graphic design services creating brand visuals, marketing assets, and digital designs that attract attention and build trust.",
        intro:
          "Your visuals are often the first impression a customer forms of your business. We design them to earn trust, not just attention.",
        features: [
          {
            icon: Palette,
            title: "Brand Visuals",
            description:
              "Logos, color systems, and visual identity that make your business instantly recognizable and credible.",
          },
          {
            icon: Layers,
            title: "Marketing Assets",
            description:
              "Social posts, ad creatives, and print-ready designs built to convert, not just decorate.",
          },
          {
            icon: Wand2,
            title: "Digital Design Systems",
            description:
              "Consistent, reusable design components so every new asset looks like it belongs to the same brand.",
          },
        ],
      }}
    />
  );
}
