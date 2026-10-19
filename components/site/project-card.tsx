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
        <div className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2">
          <span className="hidden gap-1 sm:flex" aria-hidden="true">
            <span className="size-2 rounded-full bg-navy-200" />
            <span className="size-2 rounded-full bg-navy-200" />
            <span className="size-2 rounded-full bg-navy-200" />
          </span>
          <span className="flex-1 truncate rounded bg-white px-2 py-0.5 text-center font-mono text-[9px] text-navy-500 sm:text-[11px]">
            {project.link ? host(project.link) : project.title}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-white">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} website homepage`}
              fill
              sizes="(min-width: 1024px) 380px, 50vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-navy-950 p-3 text-center sm:p-6">
              <span className="font-heading text-base font-semibold text-white sm:text-2xl">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-5">
        <p className="text-[11px] font-semibold text-navy-500 sm:text-xs">
          {project.type} · {project.year}
          {project.own ? (
            <span className="text-gold-700"> · Our product</span>
          ) : null}
        </p>
        <h3 className="font-heading text-base leading-snug font-semibold text-navy-950 sm:text-lg">
          {project.title}
        </h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-navy-700 sm:line-clamp-none sm:text-sm">
          {project.summary}
        </p>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-xs font-semibold sm:pt-2 sm:text-sm">
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
