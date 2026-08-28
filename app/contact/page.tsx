import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";

const CHANNELS = [
  {
    icon: Phone,
    title: "Call Us",
    value: "+254 700 574 125",
    href: "tel:+254700574125",
  },
  {
    icon: Mail,
    title: "Email Us",
    value: "collins@bluvig.co.ke",
    href: "mailto:collins@bluvig.co.ke",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with us instantly",
    href: "https://wa.me/254700574125",
  },
];

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Bluvig — call, email, or WhatsApp us, or fill out the Get Started form.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk"
        description="Reach us directly, or tell us about your project and we'll get back to you."
      />
      <section className="bg-white py-20">
        <Container className="flex flex-col items-center gap-12">
          <div className="grid w-full gap-6 sm:grid-cols-3">
            {CHANNELS.map((channel, index) => (
              <AnimatedSection key={channel.title} delay={index * 0.05}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    channel.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex h-full flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-navy-50 text-navy-600">
                    <channel.icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-base font-semibold text-navy-950">
                    {channel.title}
                  </h3>
                  <p className="text-sm text-navy-700">{channel.value}</p>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.15} className="text-center">
            <p className="mb-4 text-sm text-navy-700">
              Prefer to share a few details about your project first?
            </p>
            <Button
              size="lg"
              className="btn-metallic gold-line font-semibold"
              render={
                <Link href="/get-started">
                  Fill Out the Get Started Form
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
