import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { AttributionCapture } from "@/components/site/attribution";
import { JsonLd } from "@/components/site/json-ld";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Bluvig | Software Development Company in Kenya",
    template: "%s | Bluvig",
  },
  description: SITE.description,
  keywords: [
    "software development company Kenya",
    "custom software Nairobi",
    "web application development Kenya",
    "mobile app developers Kenya",
    "M-Pesa integration developer",
    "website design Kenya",
    "hire developers in Kenya",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_KE",
    url: SITE.url,
    title: "Bluvig | Software Development Company in Kenya",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

/** Who we are, for search engines and AI assistants. */
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  image: `${SITE.url}/opengraph-image`,
  description: SITE.description,
  telephone: SITE.phone.replace(/\s/g, ""),
  email: SITE.email,
  address: { "@type": "PostalAddress", addressCountry: "KE" },
  areaServed: ["Kenya", "Worldwide"],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Software development services",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        url: `${SITE.url}/services/${s.slug}`,
      },
    })),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={ORGANIZATION} />
        <AttributionCapture />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
