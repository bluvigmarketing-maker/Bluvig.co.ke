---
title: M-Pesa Integration for Your Website or App: Cost, Steps and Timeline (2026)
slug: m-pesa-integration-cost-steps-timeline
metaTitle: M-Pesa Integration in Kenya: Cost, Steps and Timeline
metaDescription: How M-Pesa integration works in 2026: Daraja APIs, go-live requirements, Safaricom fees, timelines and what it costs to add M-Pesa to a website or app.
excerpt: What it takes to accept M-Pesa on your website or app in 2026: which Daraja API to use, the go-live paperwork, Safaricom's fees, realistic timelines and costs.
focusKeyword: M-Pesa integration
secondaryKeywords: Daraja API, STK Push, M-Pesa API Kenya, Lipa na M-Pesa website, M-Pesa payment gateway
category: Integrations
tags: M-Pesa, Daraja, payments, integrations
schemaType: TechArticle
coverTitle: M-Pesa Integration: Cost, Steps and Timeline
---

M-Pesa integration connects your website, app or business system to Safaricom's Daraja API, so customers pay from their phone and your system confirms the payment on its own. For a registered business it usually takes one to three weeks, including Safaricom's go-live approval.

This guide explains which Daraja API fits your business, what Safaricom asks for before you go live, what the fees look like after the August 2026 tariff cut, and what an M-Pesa integration costs to build.

## Why does M-Pesa integration matter for a Kenyan business?

M-Pesa is how most Kenyans pay. In the year to March 2026, Safaricom processed **46.4 billion M-Pesa transactions worth KSh 41.68 trillion**, and about 41 million people used M-Pesa every month ([People Daily](https://peopledaily.digital/business/m-pesa-processes-ksh41-7t-in-a-year-heres-where-the-money-went), [The Kenya Times](https://thekenyatimes.com/business/m-pesa-safaricom-revenue/)).

However, many businesses still take M-Pesa the manual way. A customer sends money, someone reads the SMS, and then they match it to an order by hand. That works for ten orders a day. At a hundred, it causes missed payments, double-shipped orders and long reconciliation evenings.

An M-Pesa integration removes that work. Instead, the payment request goes out, the customer enters their PIN, and your system marks the order as paid within seconds.

## What is the Daraja API?

Daraja is Safaricom's developer platform for M-Pesa. The current version, **Daraja 3.0**, launched on 25 November 2025. It added a redesigned sandbox, cloud-native infrastructure and new APIs such as Mini Apps that run inside the M-PESA super app ([Techweez](https://techweez.com/2025/11/25/safaricom-daraja-3-fintech-platform-launch/)).

For most businesses, only a few Daraja APIs matter:

- **M-Pesa Express (STK Push):** your site sends a payment prompt to the customer's phone, and they approve it with their PIN. This is the best checkout experience for websites and apps.
- **C2B (Customer to Business):** the customer pays your Paybill or Till from their own M-Pesa menu, and Safaricom notifies your system. It suits walk-in payments and invoices with an account number.
- **B2C (Business to Customer):** your business sends money to phone numbers, for refunds, payouts, commissions or salaries.
- **Transaction Status:** checks a payment by its receipt number. It is the safety net when a confirmation never arrives.
- **Reversal and Account Balance:** reverse a mistaken transaction, or read your shortcode's balance.

In short, a typical online shop needs STK Push plus Transaction Status for its M-Pesa integration. A school or utility that bills by account number needs C2B. A marketplace or lending app also needs B2C.

## STK Push vs C2B: which should you use?

Use **STK Push** when the customer is on your website or app at the moment of payment. They never type a Paybill number, so there are fewer errors and fewer abandoned checkouts.

On the other hand, use **C2B** when people pay you without visiting your site, for example rent, school fees or invoices. They enter your Paybill and an account number, and your system matches the payment to that account.

Many businesses use both. For example, a school can send STK Push prompts for fee reminders and still accept direct Paybill payments.

## What do you need before going live?

Safaricom does not give production Daraja credentials to individuals. The shortcode must belong to a registered business, and the business name must match your application ([McTaba go-live checklist](https://mctaba.com/learn/mpesa/daraja-production-checklist)).

Prepare these before you start:

1. **A Paybill or Till number** registered to your business.
2. **Business registration documents** and the business KRA PIN.
3. **The ID of the authorised signatory**.
4. **An M-Pesa Org Portal administrator**, who creates the API user for your shortcode.
5. **A public HTTPS callback URL** with a valid certificate. Safaricom cannot reach localhost, ngrok tunnels or self-signed certificates.

Meanwhile, your developer builds and tests everything in the Daraja sandbox. Then you submit the go-live request on the Daraja portal, confirm it with an OTP sent to the registered phone, and wait for Safaricom's review. Developer guides report approval taking between 2 and 10 business days, so plan for it ([McTaba](https://mctaba.com/kb/daraja-sandbox-to-production)).

## How much does M-Pesa integration cost?

There are two separate costs: building the integration once, and Safaricom's fees on every payment.

```chart
{
  "title": "What it costs to add M-Pesa",
  "subtitle": "One-off build cost in KES, by project type",
  "alt": "Bar chart of M-Pesa integration build costs in Kenya: KES 7,000 on a new Bluvig website, KES 20,000 to 80,000 for a typical app integration",
  "rows": [
    { "label": "STK Push on a new Bluvig website", "value": 7000, "display": "KES 7,000", "highlight": true },
    { "label": "Typical app or system integration (market range)", "from": 20000, "value": 80000, "display": "KES 20,000 to 80,000" }
  ],
  "source": "Sources: Bluvig live price list (Oct 2026); Gurucrafts Kenya app cost guide (May 2026)"
}
```

**Building the integration.** At Bluvig, M-Pesa checkout with STK Push is a **KES 7,000** add-on when we build your website, and you can see it priced on our [instant quotation page](/quotation). Connecting M-Pesa to an existing app, ERP or custom system takes more work, because payments have to flow into your own records. Kenyan agencies quote roughly **KES 20,000 to 80,000** for that ([Gurucrafts](https://gurucrafts.agency/mobile-app-development-cost-in-kenya/)). Payouts (B2C), multiple shortcodes and full reconciliation sit at the top of that range.

**Safaricom's fees.** On 7 August 2026, Safaricom cut its merchant charges. For Buy Goods (Till) collections, payments up to KSh 500 are now free to the merchant. Above that, the fee is 0.55%, capped at KSh 200 per transaction ([The Standard](https://www.standardmedia.co.ke/business/article/2001554316/safaricom-halves-m-pesa-merchant-fees-in-cbk-led-move)). Paybill tariffs differ, so check Safaricom's current tariff table for your account type.

Also, keep the per-transaction limits in mind. A single M-Pesa payment is capped at **KSh 250,000**, and a customer can transact up to KSh 500,000 a day ([TechCabal](https://techcabal.com/2025/09/05/m-pesa-raises-bank-transfer-limit-via-pesalink/)). Larger invoices need a bank transfer option as well.

## How long does an M-Pesa integration take?

A realistic timeline for a registered business looks like this:

1. **Days 1 to 3:** agree the flow, set up the sandbox and gather documents.
2. **Days 3 to 7:** build and test the checkout, callbacks and payment records.
3. **Days 5 to 15:** Safaricom go-live review, which runs in parallel with testing.
4. **Launch day:** switch to production keys and test with a KES 1 to 10 payment.

As a result, a website checkout is often live within one to two weeks. A deeper system integration with payouts can take three to four weeks.

## What usually goes wrong?

Most failed M-Pesa integration projects break in the same few places. These are the ones we design around:

- **Lost callbacks.** Safaricom's confirmation can arrive late, twice or not at all. Therefore your system should answer each callback immediately, process it afterwards, and use Transaction Status to check anything still pending after a few minutes.
- **Double processing.** If the same confirmation arrives twice, a careless system ships two orders. The fix is idempotency: record each payment by its unique checkout ID and ignore repeats.
- **Expired certificates.** When the SSL certificate on your callback URL expires, callbacks stop silently. Monitor it.
- **Timeouts.** Customers sometimes ignore the PIN prompt. Your checkout should show a clear "try again" option instead of a frozen page.
- **No reconciliation.** Even good integrations need a daily or weekly check against the M-Pesa statement, so every shilling is accounted for.

## Can you add M-Pesa to WooCommerce, Shopify or a mobile app?

Yes. WooCommerce has M-Pesa plugins, and several payment providers offer Shopify apps for Kenya. Plugins are fine for simple stores. However, they often struggle with custom flows such as deposits, subscriptions, payouts or sending payment data into your accounting system.

For mobile apps, in contrast, the payment request should always go through your own server, never directly from the app. Your Daraja keys must stay on the server, where users cannot extract them.

Selling online also means issuing tax invoices, so read our [KRA eTIMS integration guide](/blog/kra-etims-integration-guide) too. Building an app instead? See [what an app costs to build in Kenya](/blog/cost-to-build-a-mobile-app-in-kenya).

If you want M-Pesa connected to a website, an app or the systems you already run, our [integrations team](/services/integrations) can scope it with you. You can also [talk to us on the contact page](/contact) and get a fixed quote.

## Frequently asked questions

### How much does M-Pesa integration cost in Kenya?
At Bluvig, STK Push checkout costs KES 7,000 as part of a new website. Integrating M-Pesa into an existing app or system typically costs KES 20,000 to 80,000, depending on payouts and reconciliation. Safaricom also charges per-transaction fees.

### Can an individual get M-Pesa API production access?
No. Safaricom only issues production Daraja credentials to registered businesses that own a Paybill or Till. Individuals can still use the sandbox to learn and test.

### How long does Daraja go-live approval take?
Safaricom does not publish an official timeline. Developer guides report roughly 2 to 10 business days after a complete application, so start the paperwork while the integration is being built.

### Should I use a Paybill or a Till number for my website?
Both work with STK Push. A Paybill suits businesses that bill by account number, such as schools or landlords. A Till (Buy Goods) suits shops and services, and after August 2026 collections up to KSh 500 carry no merchant fee.

### Why is my M-Pesa callback not being received?
The most common causes are a callback URL that is not public HTTPS, an expired or self-signed certificate, or a server that responds too slowly. Use the Transaction Status API as a backup check.

### What is the maximum M-Pesa payment per transaction?
KSh 250,000 per transaction and KSh 500,000 per day for a customer, based on limits reported in September 2025. Confirm current limits with Safaricom for very large payments.
