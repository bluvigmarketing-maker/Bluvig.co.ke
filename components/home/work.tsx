import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PROJECTS, type Project } from "@/lib/work";
import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-fit rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
          {project.type}
        </span>
        {project.own ? (
          <span className="w-fit rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-800">
            Our product
          </span>
        ) : null}
      </div>
      <h3 className="font-heading text-lg font-semibold text-navy-950">
        {project.title}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-navy-700">
        {project.summary}
      </p>
      {project.story ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gold-700">
          Read the case study
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );
  const className =
    "flex h-full flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm";
  return project.story ? (
    <Link
      href={`/work/${project.slug}`}
      className={`${className} transition-transform hover:-translate-y-1 hover:shadow-md`}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Work({
  limit,
  heading = true,
}: {
  /** Show only the first N projects plus a "See all work" link. */
  limit?: number;
  heading?: boolean;
}) {
  const projects = limit ? PROJECTS.slice(0, limit) : PROJECTS;
  return (
    <section className="bg-white py-20">
      <Container className="flex flex-col gap-12">
        {heading ? (
          <AnimatedSection>
            <SectionHeading
              title="Shipped and in Use"
              description="Products, web apps and websites we've built for businesses in Kenya."
            />
          </AnimatedSection>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <AnimatedSection key={project.slug} delay={index * 0.05}>
              <ProjectCard project={project} />
            </AnimatedSection>
          ))}
        </div>

        {limit && PROJECTS.length > limit ? (
          <AnimatedSection className="flex justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-navy-200 font-semibold"
              render={
                <Link href="/work">
                  See All Work
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
