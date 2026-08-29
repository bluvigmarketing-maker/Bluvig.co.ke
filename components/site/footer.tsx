import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { Container } from "@/components/site/container";

const QUICK_LINKS = [
  { label: "What We Do", href: "/what-we-do" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
  { label: "Tools", href: "/tools" },
  { label: "Get Started", href: "/get-started" },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-100">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo.png"
            alt="Bluvig"
            width={656}
            height={120}
            className="h-9 w-auto"
          />
          <p className="max-w-xs text-sm text-navy-300">
            AI-powered digital marketing agency in Kenya. We build cash flow,
            not vanity metrics.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2">
            {QUICK_LINKS.map((link) => (
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

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-wide text-gold-300 uppercase">
            Contact
          </h3>
          <Link
            href="tel:+254700574125"
            className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
          >
            <Phone className="size-4" aria-hidden="true" />
            +254 700 574 125
          </Link>
          <Link
            href="mailto:collins@bluvig.co.ke"
            className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
          >
            <Mail className="size-4" aria-hidden="true" />
            collins@bluvig.co.ke
          </Link>
        </div>
      </Container>

      <div className="border-t border-navy-800 py-6">
        <Container>
          <p className="text-center text-xs text-navy-400">
            &copy; {new Date().getFullYear()} Bluvig Limited. All rights
            reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
