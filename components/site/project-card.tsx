import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import type { PortfolioProject } from "@/lib/portfolio-shared";

function host(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

/** A portfolio project: its homepage in a browser frame, then the facts. */
export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <div className="border-b border-navy-100 bg-navy-50">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="flex gap-1" aria-hidden="true">
            <span className="size-2 rounded-full bg-navy-200" />
            <span className="size-2 rounded-full bg-navy-200" />
            <span className="size-2 rounded-full bg-navy-200" />
          </span>
          <span className="flex-1 truncate rounded bg-white px-2 py-0.5 text-center font-mono text-[11px] text-navy-500">
            {project.link ? host(project.link) : project.title}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-white">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} website homepage`}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-navy-950 p-6 text-center">
              <span className="font-heading text-2xl font-semibold text-white">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-semibold text-navy-500">
          {project.type} · {project.year}
          {project.own ? (
            <span className="text-gold-700"> · Our product</span>
          ) : null}
        </p>
        <h3 className="font-heading text-lg font-semibold text-navy-950">
          {project.title}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-navy-700">
          {project.summary}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold-700 hover:text-gold-800"
            >
              Visit site
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens {project.title} in a new tab)</span>
            </a>
          ) : null}
          {project.story ? (
            <Link
              href={`/work/${project.id}`}
              className="flex items-center gap-1 text-gold-700 hover:text-gold-800"
            >
              Read the case study
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
