"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Mail, Phone } from "lucide-react";

import { isChromeless } from "@/lib/chromeless";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { LIVE_TOOLS } from "@/lib/tools";
import { Container } from "@/components/site/container";

const COMPANY_LINKS = [
  { label: "Our Work", href: "/work" },
  { label: "How We Work", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Website Pricing", href: "/quotation" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const TOOL_LINKS = [
  ...LIVE_TOOLS,
  { label: "All Free Tools", href: "/tools" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function LinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-navy-200 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (isChromeless(pathname)) return null;

  return (
    <footer className="bg-navy-950 text-navy-100">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo.png"
            alt="Bluvig"
            width={656}
            height={120}
            className="h-9 w-auto"
          />
          <p className="max-w-xs text-sm text-navy-300">
            A software studio in Kenya. We design and build the software your
            business runs on.
          </p>
        </div>

        <LinkList
          title="Services"
          links={SERVICES.map((s) => ({
            label: s.short,
            href: `/services/${s.slug}`,
          }))}
        />
        <LinkList title="Company" links={COMPANY_LINKS} />
        <LinkList title="Free Tools" links={TOOL_LINKS} />

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
            Contact
          </h3>
          <Link
            href={SITE.phoneHref}
            className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
          >
            <Phone className="size-4" aria-hidden="true" />
            {SITE.phone}
          </Link>
          <Link
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
          >
            <Mail className="size-4" aria-hidden="true" />
            {SITE.email}
          </Link>
          <p className="flex items-center gap-2 text-sm text-navy-300">
            <Clock className="size-4" aria-hidden="true" />
            Mon–Fri, 8am–6pm {SITE.timezone}
          </p>
        </div>
      </Container>

      <div className="border-t border-navy-800 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-navy-400 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE.legalName}, {SITE.country}.
            All rights reserved.
          </p>
          <div className="flex gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
