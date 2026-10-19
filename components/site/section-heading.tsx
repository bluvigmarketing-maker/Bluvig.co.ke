import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            dark ? "text-gold-300" : "text-gold-700"
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "font-heading text-3xl font-semibold sm:text-4xl",
          dark ? "text-white" : "text-navy-950"
        )}
      >
        {title}
      </h2>
      <span className="h-px w-16 bg-gold-400" />
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed",
            dark ? "text-navy-100" : "text-navy-700"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
