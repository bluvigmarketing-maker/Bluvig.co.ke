import { SITE } from "@/lib/site";

/** How the post might look as a Google result. Google trims around these lengths. */
export function SerpPreview({
  title,
  slug,
  description,
}: {
  title: string;
  slug: string;
  description: string;
}) {
  const host = new URL(SITE.url).host;
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4">
      <p className="mb-2 text-xs font-semibold text-navy-500">Search result preview</p>
      <p className="truncate text-xs text-navy-600">
        {host} › blog › {slug || "your-post-slug"}
      </p>
      <p className="mt-0.5 truncate text-lg text-[#1a0dab]">
        {title || "Your SEO title shows here"}
      </p>
      <p className="mt-0.5 line-clamp-2 text-sm text-navy-700">
        {description ||
          "Write a meta description so it shows here, instead of a snippet Google picks for you."}
      </p>
    </div>
  );
}
