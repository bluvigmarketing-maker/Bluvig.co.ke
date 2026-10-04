import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

export const metadata: Metadata = {
  title: "Get a Quotation — Price Your Website",
  description:
    "Choose your industry, add the features you need and watch your website take shape — with an instant price, proforma invoice and WhatsApp purchase order.",
};

/** Distraction-free shell: logo + exit only (spec §2). */
export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-navy-50">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Bluvig home">
            <Image
              src="/logo.png"
              alt="Bluvig"
              width={656}
              height={120}
              priority
              className="h-7 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-navy-600 hover:bg-navy-50 hover:text-navy-950"
          >
            <X className="size-4" aria-hidden="true" />
            Exit
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
