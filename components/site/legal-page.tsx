import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";

/** Plain, readable layout for the privacy policy and terms. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: (string | string[])[] }[];
}) {
  return (
    <>
      <PageHero title={title} description={`Last updated ${updated}`} />
      <section className="bg-white py-16">
        <Container className="flex max-w-3xl flex-col gap-10 text-navy-800">
          <p className="text-lg leading-relaxed">{intro}</p>
          {sections.map((section, i) => (
            <div key={section.heading} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-semibold text-navy-950">
                {i + 1}. {section.heading}
              </h2>
              {section.body.map((block, j) =>
                Array.isArray(block) ? (
                  <ul key={j} className="ml-5 flex list-disc flex-col gap-1.5">
                    {block.map((item) => (
                      <li key={item} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={j} className="leading-relaxed">
                    {block}
                  </p>
                )
              )}
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
