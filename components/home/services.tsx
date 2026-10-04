import Link from "next/link";
import {
  ArrowRight,
  Code2,
  GraduationCap,
  Palette,
  Search,
  TrendingUp,
} from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

export const SERVICES = [
  {
    icon: Search,
    title: "SEO — Business Discovery Engine",
    description:
      "Get found online. Our Visibility Engine combines SEO, AI optimization, and social content to make sure your business gets noticed, trusted, and remembered — without the tech work.",
    href: "/what-we-do/seo",
    featured: true,
  },
  {
    icon: TrendingUp,
    title: "Digital Marketing Services",
    description:
      "Digital marketing that grows visibility, attracts qualified leads, and converts traffic — using SEO, ads, and data-driven campaigns built for real business growth.",
    href: "/what-we-do",
  },
  {
    icon: Code2,
    title: "Website Development",
    description:
      "High-performance website development in Kenya, focused on speed, mobile usability, and converting visitors into paying customers.",
    href: "/what-we-do/website-development",
  },
  {
    icon: GraduationCap,
    title: "Digital Marketing Training",
    description:
      "Practical digital marketing training teaching SEO, ads, AI tools, and growth strategies for real-world business results.",
    href: "/what-we-do/digital-marketing-training",
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description:
      "Strategic graphic design services — brand visuals, marketing assets, and digital designs that attract attention and build trust.",
    href: "/what-we-do/graphic-design",
  },
];

export function Services() {
  return (
    <section className="relative overflow-hidden bg-navy-50 py-20">
      <GlowOrbs variant="light" />
      <Container className="relative z-10 flex flex-col gap-12">
        <AnimatedSection>
          <SectionHeading
            eyebrow="What We Do"
            title="Everything Your Business Needs to Get Found"
            description="Five services, one goal: turning your online presence into a real, measurable lead-generation machine."
          />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <AnimatedSection
              key={service.href + service.title}
              delay={index * 0.05}
              className={service.featured ? "lg:col-span-2" : undefined}
            >
              <div
                className={`flex h-full flex-col gap-4 rounded-2xl p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md ${
                  service.featured
                    ? "glass-gold"
                    : "border border-navy-100 bg-white"
                }`}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    service.featured
                      ? "bg-gold-500/15 text-gold-700"
                      : "bg-navy-50 text-navy-600"
                  }`}
                >
                  <service.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-navy-950">
                  {service.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-navy-700">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    className="bg-navy-950 text-white hover:bg-navy-800"
                    render={<Link href={service.href}>Explore</Link>}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-navy-200"
                    render={
                      <Link href="/get-started">
                        Get Started
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    }
                  />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
