import { Container } from "@/components/site/container";
import { GlowOrbs } from "@/components/site/glow-orbs";

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
    <div className="relative overflow-hidden bg-navy-950 py-16 text-center text-white sm:py-20">
      <GlowOrbs variant="dark" />
      <Container className="relative z-10 flex flex-col items-center gap-4">
        {eyebrow ? (
          <span className="glass-gold w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-gold-300 uppercase">
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
