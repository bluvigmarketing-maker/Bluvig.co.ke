import type { Metadata } from "next";

import { SITE } from "@/lib/site";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Bluvig collects, uses and protects personal data, and your rights under Kenya's Data Protection Act, 2019.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="16 October 2026"
      intro={`This policy explains what personal data ${SITE.legalName} ("Bluvig", "we") collects through ${SITE.url.replace("https://", "")}, why, who we share it with, and the rights you have under Kenya's Data Protection Act, 2019 — and, for visitors in the EU or UK, the GDPR.`}
      sections={[
        {
          heading: "Who we are",
          body: [
            `${SITE.legalName} is a software development company in ${SITE.country}. We are the data controller for the personal data described here. Contact us about privacy at ${SITE.email} or ${SITE.phone}.`,
          ],
        },
        {
          heading: "What we collect",
          body: [
            "Information you give us when you request a call-back, create a quotation or contact us:",
            [
              "Your name, phone/WhatsApp number and (optionally) email address and company",
              "Your country, industry, budget range, timeline and preferred call time",
              "Your project details, notes, and any links you choose to share (for example inspiration sites, prototypes or AI chats)",
              "The features and prices in your quotation",
            ],
            "Information collected automatically:",
            [
              "Where you came from (for example a Google search, a link with a campaign tag, or another website), stored with your enquiry so we know which channels work",
              "Your country, worked out from your IP address, to show prices in the right currency. We don't store it",
              "A one-way scrambled (hashed) form of your IP address, kept for up to an hour to block spam and abuse",
              "Counts of actions such as \"started a quotation\" or \"clicked WhatsApp\", with no personal data attached",
              "Anonymous page-view statistics from Vercel Web Analytics, which does not use cookies",
            ],
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We don't use advertising or tracking cookies. Your browser's session storage remembers where your visit came from until you close the tab. Our staff sign-in area uses strictly necessary security cookies.",
          ],
        },
        {
          heading: "Why we use your data",
          body: [
            [
              "To respond to your request, call you back and prepare your quotation (steps you asked us to take before a contract)",
              "To deliver and support a project you sign up for (performing our contract with you)",
              "To keep the website secure and free of spam, and to understand which pages and channels work (our legitimate interests)",
              "To meet legal, tax and accounting obligations",
            ],
            "We don't sell your data, and we don't use it for automated decisions about you. We only send marketing messages if you've agreed to receive them.",
          ],
        },
        {
          heading: "Who we share it with",
          body: [
            "We use trusted service providers who process data on our behalf, under contracts that require them to protect it:",
            [
              "Vercel — website hosting and anonymous analytics",
              "Supabase — our database",
              "Resend — sending emails about your enquiry",
            ],
            "If you choose to message us on WhatsApp or pay by M-Pesa, Meta (WhatsApp) and Safaricom handle that data under their own privacy policies. We may also disclose data where the law requires it.",
          ],
        },
        {
          heading: "International transfers",
          body: [
            "Some of our providers store data outside Kenya, for example in the EU or the United States. Where that happens we rely on appropriate safeguards, such as the provider's data protection agreement and standard contractual clauses, as required by the Data Protection Act.",
          ],
        },
        {
          heading: "How long we keep it",
          body: [
            "We keep enquiries and quotations for as long as we need them to follow up with you, and project and invoice records for as long as tax and accounting law requires. You can ask us to delete your enquiry at any time, unless we have to keep it by law. Anti-spam records are deleted within an hour.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Under the Data Protection Act, 2019 you have the right to:",
            [
              "Be told how your data is used, and get a copy of it",
              "Have inaccurate data corrected",
              "Have your data deleted",
              "Object to or restrict how we use it",
              "Receive your data in a portable format",
            ],
            `To use any of these rights, email ${SITE.email}. We'll respond within the time the law requires. If you're unhappy with our response, you can complain to the Office of the Data Protection Commissioner (odpc.go.ke).`,
          ],
        },
        {
          heading: "Security",
          body: [
            "Data is sent over encrypted connections (HTTPS), stored in an access-controlled database, and only available to people at Bluvig who need it. Our admin area is password-protected, with repeated wrong attempts blocked.",
          ],
        },
        {
          heading: "Children",
          body: [
            "Our services are for businesses. We don't knowingly collect data from children under 18.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: [
            "We'll update this page when our practices change and show the date of the latest version at the top.",
          ],
        },
      ]}
    />
  );
}
