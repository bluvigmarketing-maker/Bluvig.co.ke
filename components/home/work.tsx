import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getVisibleProjects } from "@/lib/portfolio";
import { Container } from "@/components/site/container";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/site/section-heading";
import { WorkFilter } from "@/components/site/work-filter";
import { Button } from "@/components/ui/button";

/**
 * The portfolio (managed in the cockpit's Portfolio tab). On the home page
 * it shows the projects marked "Feature on home page"; on /work, every
 * visible project with filters.
 */
export async function Work({
  featured = false,
  heading = true,
}: {
  /** Home page: only featured projects, plus a "See all work" link. */
  featured?: boolean;
  heading?: boolean;
}) {
  const visible = await getVisibleProjects();
  const picked = visible.filter((p) => p.featured);
  // Nothing marked for the home page yet: show the first six instead.
  const projects = featured ? (picked.length ? picked : visible.slice(0, 6)) : visible;

  return (
    <section className="bg-white py-20">
      <Container className="flex flex-col gap-12">
        {heading ? (
          <SectionHeading
            title="Projects Done by Us"
            description="Websites, web apps and products we've designed and built for businesses in Kenya."
          />
        ) : null}

        {featured ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <WorkFilter projects={projects} />
        )}

        {featured && visible.length > projects.length ? (
          <div className="flex justify-center">
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
          </div>
        ) : null}
      </Container>
    </section>
  );
}
