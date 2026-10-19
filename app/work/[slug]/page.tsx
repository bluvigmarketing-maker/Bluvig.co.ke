import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Quote } from "lucide-react";

import { SERVICE_BY_SLUG } from "@/lib/services";
import { CASE_STUDIES, PROJECT_BY_SLUG } from "@/lib/work";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { FinalCta } from "@/components/home/final-cta";

type Params = Promise<{ slug: string }>;

/** Only projects with a full write-up (`story` in lib/work.ts) get a page. */
export function generateStaticParams() {
  return CASE_STUDIES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const project = PROJECT_BY_SLUG.get((await params).slug);
  if (!project?.story) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const project = PROJECT_BY_SLUG.get((await params).slug);
  if (!project?.story) notFound();
  const { story } = project;
  const service = SERVICE_BY_SLUG.get(project.service);

  const sections = [
    { title: "The challenge", body: story.challenge },
    { title: "What we built", body: story.solution },
    { title: "The outcome", body: story.outcome },
  ];

  return (
    <>
      <PageHero
        eyebrow={project.type}
        title={project.title}
        description={project.summary}
      />
      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-10">
            {sections.map((s) => (
              <div key={s.title} className="flex flex-col gap-3">
                <h2 className="font-heading text-2xl font-semibold text-navy-950">
                  {s.title}
                </h2>
                <p className="leading-relaxed whitespace-pre-line text-navy-700">
                  {s.body}
                </p>
              </div>
            ))}
            {story.testimonial ? (
              <div>
                <figure className="rounded-2xl bg-navy-50 p-6">
                  <Quote className="size-6 text-gold-600" aria-hidden="true" />
                  <blockquote className="font-heading mt-3 text-xl text-navy-950 italic">
                    {story.testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-3 text-sm text-navy-600">
                    {story.testimonial.name}, {story.testimonial.role}
                  </figcaption>
                </figure>
              </div>
            ) : null}
          </div>

          <aside className="flex h-fit flex-col gap-5 rounded-2xl border border-navy-100 bg-navy-50 p-6 text-sm">
            {service ? (
              <div>
                <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Service
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-1 block font-semibold text-navy-950 hover:text-gold-700"
                >
                  {service.title}
                </Link>
              </div>
            ) : null}
            {project.stack?.length ? (
              <div>
                <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Built with
                </p>
                <p className="mt-2 text-sm text-navy-700">
                  {project.stack.join(" · ")}
                </p>
              </div>
            ) : null}
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-semibold text-gold-700 hover:underline"
              >
                Visit the live site
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </aside>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
