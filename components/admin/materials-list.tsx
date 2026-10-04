import { Bot, Globe, Rocket } from "lucide-react";

import { hasMaterials, type Materials } from "@/lib/materials";

/** Shared AI chats / inspiration sites / prototype, as clickable links. */
export function MaterialsList({
  materials,
  compact,
}: {
  materials?: Materials;
  compact?: boolean;
}) {
  if (!materials || !hasMaterials(materials)) return null;
  const groups = [
    { icon: Bot, label: "AI chat", links: materials.aiChats },
    { icon: Globe, label: "Inspiration", links: materials.inspirations },
    {
      icon: Rocket,
      label: "Prototype",
      links: materials.prototype ? [materials.prototype] : [],
    },
  ].filter((g) => g.links.length);

  return (
    <ul
      className={
        compact ? "flex flex-col gap-1 text-xs" : "flex flex-col gap-2 text-sm"
      }
    >
      {groups.flatMap(({ icon: Icon, label, links }) =>
        links.map((link, i) => (
          <li
            key={`${label}-${link}`}
            className="flex min-w-0 items-center gap-1.5"
          >
            <Icon
              className="size-3.5 shrink-0 text-gold-600"
              aria-hidden="true"
            />
            <span className="shrink-0 text-navy-500">
              {label}
              {links.length > 1 ? ` ${i + 1}` : ""}:
            </span>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="truncate text-navy-800 underline-offset-2 hover:text-navy-950 hover:underline"
            >
              {link.replace(/^https?:\/\//, "")}
            </a>
          </li>
        ))
      )}
    </ul>
  );
}
