"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import { Container } from "@/components/site/container";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SERVICES = [
  { label: "SEO", href: "/what-we-do/seo" },
  { label: "Website Development", href: "/what-we-do/website-development" },
  {
    label: "Digital Marketing Training",
    href: "/what-we-do/digital-marketing-training",
  },
  { label: "Graphic Design", href: "/what-we-do/graphic-design" },
];

const NAV_LINKS = [
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
  { label: "Tools", href: "/tools" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Bluvig"
            width={656}
            height={120}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" render={<Link href="/">Home</Link>} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1">
                  What We Do
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent className="min-w-56">
              <DropdownMenuItem render={<Link href="/what-we-do">All Services</Link>} />
              {SERVICES.map((service) => (
                <DropdownMenuItem
                  key={service.href}
                  render={<Link href={service.href}>{service.label}</Link>}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              render={<Link href={link.href}>{link.label}</Link>}
            />
          ))}
        </nav>

        <div className="hidden md:block">
          <MagneticButton>
            <Button
              className="btn-metallic gold-line font-semibold"
              render={<Link href="/get-started">Get Started</Link>}
            />
          </MagneticButton>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-3/4 sm:max-w-sm">
            <SheetTitle className="px-4 pt-4 font-heading text-xl text-navy-600">
              BLUVIG
            </SheetTitle>
            <nav className="flex flex-col gap-1 p-4">
              <SheetClose
                render={
                  <Link
                    href="/"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  >
                    Home
                  </Link>
                }
              />
              <span className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-navy-400 uppercase">
                What We Do
              </span>
              <SheetClose
                render={
                  <Link
                    href="/what-we-do"
                    className="rounded-lg border-l-2 border-navy-100 py-2 pr-3 pl-4 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  >
                    All Services
                  </Link>
                }
              />
              {SERVICES.map((service) => (
                <SheetClose
                  key={service.href}
                  render={
                    <Link
                      href={service.href}
                      className="rounded-lg border-l-2 border-navy-100 py-2 pr-3 pl-4 text-sm font-medium text-navy-900 hover:bg-navy-50"
                    >
                      {service.label}
                    </Link>
                  }
                />
              ))}
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-navy-900 hover:bg-navy-50"
                    >
                      {link.label}
                    </Link>
                  }
                />
              ))}
              <Button
                className="btn-metallic gold-line mt-3 font-semibold"
                render={<Link href="/get-started">Get Started</Link>}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
