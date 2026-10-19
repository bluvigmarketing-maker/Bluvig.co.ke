"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { SERVICE_OPTIONS, type PortfolioProject } from "@/lib/portfolio-shared";
import { ProjectCard } from "@/components/site/project-card";

/** /work: every project, filterable by the kind of build. */
export function WorkFilter({ projects }: { projects: PortfolioProject[] }) {
  const [service, setService] = useState<string>("all");
  const options = SERVICE_OPTIONS.filter((s) =>
    projects.some((p) => p.service === s.slug)
  );
  const shown =
    service === "all" ? projects : projects.filter((p) => p.service === service);

  return (
    <div className="flex flex-col gap-8">
      {options.length > 1 ? (
        <div
          role="group"
          aria-label="Filter projects"
          className="flex flex-wrap gap-2"
        >
          {[{ slug: "all", label: "All" }, ...options].map((option) => (
            <button
              key={option.slug}
              type="button"
              aria-pressed={service === option.slug}
              onClick={() => setService(option.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                service === option.slug
                  ? "border-navy-950 bg-navy-950 text-white"
                  : "border-navy-200 text-navy-700 hover:border-navy-400"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {shown.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
