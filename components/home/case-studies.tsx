import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

export const CASE_STUDIES = [
  {
    title: "Digitec Virtual",
    tag: "Website + SEO",
    description:
      "A professional service website for a virtual assistant business — built for online lead generation with SEO-friendly, freelancer-portfolio-style design.",
  },
  {
    title: "QR Baker",
    tag: "Web App",
    description:
      "An M-Pesa QR code generator and mobile payment web app — instant, contactless payment tooling built for small businesses in Kenya.",
  },
  {
    title: "ULC",
    tag: "Social Media Design",
    description:
      "Social media marketing posters and brand assets designed to keep ULC's presence consistent and scroll-stopping across platforms.",
  },
  {
    title: "Kifaru Landscaping",
    tag: "Website",
    description:
      "A service-focused website for a landscaping business, built to showcase project work and convert local search traffic into inquiries.",
  },
  {
    title: "Kifaru Liquor",
    tag: "Website",
    description:
      "An e-commerce-ready website for a liquor retail brand, designed around product discovery and a clean ordering experience.",
  },
  {
    title: "Kifaru Inc",
    tag: "Website",
    description:
      "A corporate website for the Kifaru Inc group brand, unifying its business lines under one polished, trustworthy web presence.",
  },
  {
    title: "Jimmy Group",
    tag: "Website",
    description:
      "A group-wide corporate website built to represent Jimmy Group's portfolio of businesses with a single, credible front door.",
  },
];

export function CaseStudies({
  showViewAll = true,
}: {
  showViewAll?: boolean;
}) {
  return (
    <section className="bg-white py-20">
      <Container className="flex flex-col gap-12">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Case Studies"
            title="Real Projects, Built for Real Results"
            description="A selection of websites, tools, and campaigns we've shipped for Kenyan businesses."
          />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((project, index) => (
            <AnimatedSection key={project.title} delay={index * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <span className="w-fit rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                  {project.tag}
                </span>
                <h3 className="font-heading text-lg font-semibold text-navy-950">
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-700">
                  {project.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {showViewAll ? (
          <AnimatedSection className="flex justify-center">
            <Button
              size="lg"
              className="btn-metallic gold-line font-semibold"
              render={
                <Link href="/case-studies">
                  View All Case Studies
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </AnimatedSection>
        ) : null}
      </Container>
    </section>
  );
}
