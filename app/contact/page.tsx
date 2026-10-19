import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MessageCircle, Phone } from "lucide-react";

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
    "Get in touch with Bluvig: call, email or WhatsApp us about your software, app or website project.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Let's Talk"
        description="Reach us directly, or tell us about your project and we'll call you back."
      />
      <section className="bg-white py-20">
        <Container className="flex flex-col items-center gap-12">
          <div className="grid w-full gap-6 sm:grid-cols-3">
            {CHANNELS.map((channel) => (
              <div key={channel.title}>
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
              </div>
            ))}
          </div>

          <div
           
            className="flex items-center gap-2 text-sm text-navy-700"
          >
            <Clock className="size-4 text-gold-600" aria-hidden="true" />
            Monday–Friday, 8am–6pm East Africa Time (UTC+3). Outside Kenya? We
            schedule calls to suit your time zone.
          </div>

          <div className="text-center">
            <p className="mb-4 text-sm text-navy-700">
              Prefer to share a few details about your project first?
            </p>
            <Button
              size="lg"
              className="btn-metallic gold-line font-semibold"
              render={
                <Link href="/get-started">
                  Start Your Project
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </div>
        </Container>
      </section>
    </>
  );
}
