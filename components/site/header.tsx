"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";

import { isChromeless } from "@/lib/chromeless";
import { SERVICES as SERVICE_LIST } from "@/lib/services";
import { Container } from "@/components/site/container";
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

const SERVICES = SERVICE_LIST.map((s) => ({
  label: s.short,
  href: `/services/${s.slug}`,
}));

const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "How We Work", href: "/process" },
  { label: "Pricing", href: "/quotation" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function Header() {
  const pathname = usePathname();
  if (isChromeless(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/95 backdrop-blur-xl backdrop-saturate-150">
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
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/">Home</Link>}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1">
                  Services
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent className="min-w-56">
              <DropdownMenuItem render={<Link href="/services">All Services</Link>} />
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
            <Button
              className="btn-metallic gold-line font-semibold"
              render={<Link href="/get-started">Start a Project</Link>}
            />
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
                Services
              </span>
              <SheetClose
                render={
                  <Link
                    href="/services"
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
                render={<Link href="/get-started">Start a Project</Link>}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
