import { Container } from "@/components/site/container";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-navy-950 py-16 text-center text-white sm:py-20">
      <Container className="flex flex-col items-center gap-4">
        {eyebrow ? (
          <span className="w-fit rounded-full border border-gold-400/40 px-3 py-1 text-xs font-semibold tracking-wide text-gold-300 uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-heading text-4xl font-bold text-balance sm:text-5xl">
          {title}
        </h1>
        <span className="h-px w-16 bg-gold-400" />
        {description ? (
          <p className="max-w-2xl text-navy-100">{description}</p>
        ) : null}
      </Container>
    </div>
  );
}
