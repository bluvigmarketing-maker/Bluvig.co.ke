---
title: KRA eTIMS Integration: What Your Business System Needs (2026 Guide)
slug: kra-etims-integration-guide
metaTitle: KRA eTIMS Integration Guide for Businesses (2026)
metaDescription: KRA eTIMS integration explained for 2026: OSCU vs VSCU, who must comply, the new penalties from July 2026, and how to connect your POS, ERP or website.
excerpt: Every Kenyan business must now issue eTIMS invoices. Here is how eTIMS integration works in 2026: OSCU vs VSCU, the July 2026 penalty rules, and connecting your own system.
focusKeyword: eTIMS integration
secondaryKeywords: KRA eTIMS, OSCU vs VSCU, eTIMS system to system integration, eTIMS penalty 2026, electronic tax invoice Kenya
category: Integrations
tags: eTIMS, KRA, tax compliance, integrations, ERP
schemaType: TechArticle
coverTitle: KRA eTIMS Integration: What Your System Needs
---

eTIMS integration connects your POS, ERP, website or billing system directly to KRA. As a result, every sale produces a valid electronic tax invoice automatically. In 2026 this matters more than ever: expenses without eTIMS invoices are not deductible, and new penalties apply from 1 July 2026.

This guide covers who must use eTIMS, the difference between OSCU and VSCU, what changed in 2025 and 2026, and how to choose the right setup for your business.

## Who must use KRA eTIMS?

Everyone in business. KRA states that "all persons engaged in business are required to on-board eTIMS and issue electronic tax invoices". That includes businesses that are not registered for VAT ([KRA](https://www.kra.go.ke/helping-tax-payers/faqs/learn-about-etims)). VAT-registered businesses that already use TIMS devices can keep using them.

The legal basis is Section 23A of the Tax Procedures Act, added by the Finance Act 2023. In addition, Section 16(1)(c) of the Income Tax Act disallows business expenses that are not supported by eTIMS invoices, with effect from 1 January 2024 ([EY](https://www.ey.com/en_gl/technical/tax-alerts/kenya-requires-non-vat-registered-taxpayers-to-onboard-on-e-tims)).

A few payments are exempt from e-invoicing, such as salaries, imports, interest and airline tickets. The Finance Act 2025 also excluded payments subject to final withholding tax ([EY](https://taxnews.ey.com/news/2025-1498-kenya-enacts-finance-act-2025)).

## What changed in 2026?

Three changes make eTIMS integration urgent this year:

1. **No more expense concession.** For 2025 returns, KRA allowed some valid expenses without eTIMS invoices, subject to checks. However, from the 2026 year of income, every declared income and expense item needs a valid eTIMS or TIMS invoice ([KRA public notice](https://www.kra.go.ke/news-center/public-notices/2375-filing-of-2025-income-tax-returns)).
2. **A new penalty regime.** From 1 July 2026, failing to issue an e-invoice attracts the higher of 5% of the tax due, **KES 100,000 for a company**, or **KES 10,000 for an individual**. KRA must first issue a notice asking for reasons ([EY](https://globaltaxnews.ey.com/news/2026-1445-kenya-enacts-finance-act-2026)).
3. **Data matching.** The Finance Act 2026 lets KRA use eTIMS data to raise assessments and prefill returns. Consequently, your records will be compared with your suppliers' and customers' invoices.

Government suppliers face an extra rule. Since 31 August 2026, eTIMS has been linked to IFMIS. Therefore, suppliers must present valid eTIMS invoices before they get paid ([TechTrends KE](https://techtrendske.co.ke/2026/08/31/kra-etims-ifmis-integration-government-invoices/)).

```chart
{
  "title": "Minimum eTIMS penalty from 1 July 2026",
  "subtitle": "Or 5% of the tax due, whichever is higher (KES)",
  "alt": "Bar chart of the minimum penalty for not issuing an eTIMS invoice from 1 July 2026: KES 100,000 for a company and KES 10,000 for an individual",
  "rows": [
    { "label": "Company", "value": 100000, "display": "KES 100,000", "highlight": true },
    { "label": "Individual", "value": 10000, "display": "KES 10,000" }
  ],
  "source": "Source: Finance Act 2026, as summarised by EY (2026)"
}
```

## What are the types of eTIMS solutions?

KRA offers several ways to issue eTIMS invoices ([KRA](https://www.kra.go.ke/business/etims-electronic-tax-invoice-management-system/learn-about-etims/types-of-etims-solutions)):

- **Online portal:** invoices typed in on the web. It suits service businesses with few invoices.
- **eTIMS Client:** free software for Windows and Android that supports branches and tills.
- **eTIMS Lite:** for individuals and small traders, through eCitizen, a mobile app or USSD on *222#.
- **System-to-system integration (OSCU or VSCU):** your own POS, ERP or billing system talks to KRA directly.
- **Buyer-initiated invoicing:** for suppliers with turnover of KES 5 million or less, the buying business can issue the invoice for them.

Manual options are free and fine for low volumes. However, at dozens of invoices a day, re-typing every sale wastes time and invites errors. That is when eTIMS integration pays for itself.

## OSCU vs VSCU: which one does your system need?

Both are system-to-system integrations, but they suit different businesses ([KRA](https://www.kra.go.ke/business/etims-electronic-tax-invoice-management-system/learn-about-etims/etims-system-to-system-integration)):

- **OSCU (Online Sales Control Unit)** suits invoicing that is always online. Each invoice is signed by KRA in real time, so it needs a stable internet connection.
- **VSCU (Virtual Sales Control Unit)** suits high-volume invoicing that cannot depend on the connection. It keeps working during an outage and sends invoices once the connection returns.

For example, an always-connected online shop fits OSCU well. In contrast, a busy supermarket or fuel station usually needs VSCU. eTIMS outages do happen, so offline resilience matters if you cannot stop selling ([Business Daily](https://www.businessdailyafrica.com/bd/economy/outage-on-kra-s-etims-systems-5536700)).

## How does eTIMS integration work?

The process has five stages:

1. **Choose the route.** Either the business integrates its own system, or it works with a KRA-verified third-party integrator. KRA publishes the list of verified integrators.
2. **Sandbox development.** The system is connected to KRA's test environment and built against KRA's OSCU or VSCU specification.
3. **Testing.** Sales, credit notes, stock movements and error cases are tested end to end.
4. **Vetting and certification.** KRA reviews the integration before it can go live.
5. **Go live and monitor.** Invoices flow automatically, and failed transmissions are retried and flagged.

Stock records matter too. The eTIMS regulations require stock-in and stock-out records in the system. In addition, KRA began consultations on a stock management function in September 2026 ([Tech-ish](https://tech-ish.com/2026/09/04/kra-orders-businesses-to-keep-stock-records-in-tims-and-etims/)). So a good integration should handle inventory, not only invoices.

## How much does eTIMS integration cost?

KRA's own eTIMS software is free. The cost comes from connecting your existing system and maintaining that connection.

At Bluvig, eTIMS invoicing built into a new website or online shop is a **KES 18,000** feature on our [quotation page](/quotation). Connecting an existing ERP, POS or custom system depends on how it stores sales and stock, so we quote it after a short review. When you compare eTIMS integration quotes, ask three things. Which certification route does your setup need? Who maintains it when KRA updates its specification? And how are failed invoices handled?

Taking payments as well? Our [M-Pesa integration guide](/blog/m-pesa-integration-cost-steps-timeline) covers that side.

If you need eTIMS connected to the systems you already run, see our [integrations service](/services/integrations) or [contact us](/contact) for a fixed quote.

## Frequently asked questions

### Do non-VAT registered businesses need eTIMS?
Yes. KRA requires all persons in business to issue electronic tax invoices through eTIMS, whether or not they are registered for VAT.

### What is the difference between OSCU and VSCU?
OSCU signs each invoice online in real time and needs a stable connection. VSCU keeps invoicing during an outage and sends invoices when the connection returns, which suits high-volume businesses.

### What is the penalty for not issuing an eTIMS invoice in 2026?
From 1 July 2026, the penalty is the higher of 5% of the tax due, KES 100,000 for a company, or KES 10,000 for an individual. KRA must first issue a notice asking for reasons.

### Can I claim expenses without eTIMS invoices?
From the 2026 year of income, no. KRA requires all declared expenses to be supported by valid eTIMS or TIMS invoices, otherwise they are not deductible.

### Can QuickBooks, Odoo, Sage or a custom system connect to eTIMS?
Yes, through system-to-system integration using OSCU or VSCU. Some software vendors offer ready connectors; custom systems need an integration built against KRA's specification and certified.

### Does eTIMS work offline?
The VSCU integration and the eTIMS Client keep invoicing offline and transmit later. OSCU and the online portal need an internet connection.
