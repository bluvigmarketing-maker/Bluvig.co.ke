import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock } from "lucide-react";

import { convert, formatMoney } from "@/lib/estimator/pricing";
import { getPricing } from "@/lib/estimator/store";
import { SERVICE_BY_SLUG, SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { visitorInKenya } from "@/lib/visitor-location";
import { PROJECTS } from "@/lib/work";
import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { FinalCta } from "@/components/home/final-cta";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const service = SERVICE_BY_SLUG.get((await params).slug);
  if (!service) return {};
  return {
    title: `${service.title} in Kenya`,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

/** "From KES 30,000" for websites — in the visitor's currency, from the live price list. */
async function websiteStartingPrice() {
  try {
    const pricing = await getPricing();
    const currency = (await visitorInKenya()) === false ? "USD" : "KES";
    return formatMoney(
      convert(pricing.settings.basePriceKes, currency, pricing.settings),
      currency
    );
  } catch {
    return null;
  }
}

export default async function ServicePage({ params }: { params: Params }) {
  const service = SERVICE_BY_SLUG.get((await params).slug);
  if (!service) notFound();

  const startingPrice =
    service.quote === "instant" ? await websiteStartingPrice() : null;
  const related = PROJECTS.filter((p) => p.service === service.slug);
  const cta =
    service.quote === "instant"
      ? { href: "/quotation", label: "See Your Price Now" }
      : { href: "/get-started", label: "Book a Free Discovery Call" };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: service.title,
              description: service.summary,
              serviceType: service.title,
              areaServed: ["Kenya", "Worldwide"],
              provider: { "@id": `${SITE.url}/#organization` },
              url: `${SITE.url}/services/${service.slug}`,
            },
            {
              "@type": "FAQPage",
              mainEntity: service.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />

      <PageHero
        eyebrow={service.title}
        title={service.heroTitle}
        description={service.heroDescription}
      />

      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <AnimatedSection className="flex flex-col gap-6">
            <SectionHeading title="The Problem It Solves" />
            <p className="text-base leading-relaxed text-navy-700">
              {service.problem}
            </p>
            <div className="flex flex-col gap-3">
              <h3 className="font-heading text-lg font-semibold text-navy-950">
                What&rsquo;s included
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {service.included.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-navy-800">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-gold-600"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <aside className="flex flex-col gap-5 rounded-2xl border border-navy-100 bg-navy-50 p-6">
              <div>
                <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Price
                </p>
                <p className="font-heading mt-1 text-2xl font-semibold text-navy-950">
                  {startingPrice
                    ? `From ${startingPrice}`
                    : "Fixed quote after a free call"}
                </p>
                <p className="mt-1 text-sm text-navy-600">
                  {service.quote === "instant"
                    ? "Pick your features and see the exact total instantly."
                    : "Itemised and fixed before any work starts. 60% to start, 40% at launch."}
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm text-navy-700">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-navy-500"
                  aria-hidden="true"
                />
                Milestones and dates agreed in writing before we start.
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Built with
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {service.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-navy-200 bg-white px-2.5 py-1 text-xs text-navy-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                size="lg"
                className="btn-metallic gold-line w-full font-semibold"
                render={
                  <Link href={cta.href}>
                    {cta.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                }
              />
            </aside>
          </AnimatedSection>
        </Container>
      </section>

      <section className="bg-navy-50 py-20">
        <Container className="flex flex-col gap-10">
          <AnimatedSection>
            <SectionHeading title="What We Can Build for You" />
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.examples.map((example, index) => (
              <AnimatedSection key={example} delay={index * 0.04}>
                <div className="flex h-full items-center gap-3 rounded-2xl border border-navy-100 bg-white p-5 text-sm font-medium text-navy-900 shadow-sm">
                  <service.icon
                    className="size-5 shrink-0 text-gold-600"
                    aria-hidden="true"
                  />
                  {example}
                </div>
              </AnimatedSection>
            ))}
          </div>

          {related.length ? (
            <AnimatedSection className="flex flex-col gap-3">
              <h3 className="font-heading text-lg font-semibold text-navy-950">
                Related work
              </h3>
              <div className="flex flex-wrap gap-2">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={p.story ? `/work/${p.slug}` : "/work"}
                    className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-sm text-navy-800 hover:border-gold-400"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          ) : null}
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="flex max-w-3xl flex-col gap-8">
          <AnimatedSection>
            <SectionHeading title="Questions" />
          </AnimatedSection>
          <div className="flex flex-col divide-y divide-navy-100 rounded-2xl border border-navy-100">
            {service.faq.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-950 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-gold-600 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
