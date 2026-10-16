import type { Metadata } from "next";

import { PAYMENT_TERMS } from "@/lib/estimator/pricing";
import { SITE } from "@/lib/site";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using the Bluvig website, its quotation tool and free tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const deposit = PAYMENT_TERMS.depositPercent;
  return (
    <LegalPage
      title="Terms of Use"
      updated="16 October 2026"
      intro={`These terms apply when you use ${SITE.url.replace("https://", "")}, including the quotation and Get Started tools. By using the site you agree to them. Each project we take on is also covered by its own written agreement, and that agreement takes priority if anything conflicts.`}
      sections={[
        {
          heading: "Who we are",
          body: [
            `This website is run by ${SITE.legalName}, a company in ${SITE.country}. Contact: ${SITE.email}, ${SITE.phone}.`,
          ],
        },
        {
          heading: "Quotations and prices",
          body: [
            [
              "Quotations and proforma invoices from our website are indicative. We confirm the scope and final price after a short discovery call, and the price may change if the scope changes.",
              "A quotation is valid for 14 days from the date on it.",
              "Clients in Kenya are quoted in Kenyan shillings (KES) and clients outside Kenya in US dollars (USD), based on where you are browsing from.",
              "We are not currently VAT-registered, so no VAT is charged.",
              "Hosting and domain are included for the first year where the quotation says so. After that they renew yearly at the price shown on your quotation.",
            ],
          ],
        },
        {
          heading: "Payments",
          body: [
            `Unless your project agreement says otherwise, a ${deposit}% deposit starts the work and the remaining ${100 - deposit}% is due at launch. Work starts once the deposit is received. You can ask for a free prototype before paying anything.`,
          ],
        },
        {
          heading: "Ownership",
          body: [
            "Once a project is paid in full, you own the custom code, designs and content we create for you, as well as your domain and app store listings. Third-party and open-source software we use stays under its own licence. We may mention the project in our portfolio unless you ask us not to, or we've agreed confidentiality in writing.",
          ],
        },
        {
          heading: "Using this website",
          body: [
            [
              "Please give accurate information in our forms.",
              "Don't misuse the site: no attempts to break its security, overload it, scrape it, or submit spam or automated requests.",
              "The content, design and code of this website belong to Bluvig. Don't copy them without permission.",
            ],
          ],
        },
        {
          heading: "Free tools",
          body: [
            "Our free tools are provided as they are, without any guarantee. Check important results (for example payment QR codes) before relying on them.",
          ],
        },
        {
          heading: "Links to other sites",
          body: [
            "Links to other websites are for convenience. We're not responsible for their content or how they handle your data.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "We work hard to keep this website accurate and available, but we can't promise it will always be error-free or online. As far as the law allows, we aren't liable for indirect losses from using the website. Nothing in these terms limits liability that can't legally be limited.",
          ],
        },
        {
          heading: "Privacy",
          body: [
            "How we handle personal data is explained in our Privacy Policy at /privacy.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction over any dispute.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "We may update these terms. The date at the top shows the latest version.",
          ],
        },
      ]}
    />
  );
}
