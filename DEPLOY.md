# Go-live checklist (Vercel + Supabase)

Everything in the code is ready; these steps need the owner's accounts.

## 1. Database (Supabase)
1. Create a Supabase project (region closest to Kenya, e.g. Frankfurt or London).
2. Supabase → **Connect** → *Transaction pooler* (port 6543). Copy the URI and put your database password in it.
3. The app creates its table (`bluvig_documents`) on first use — nothing to run by hand.

## 2. Vercel project
1. Vercel → **Add New → Project** → import `bluvigmarketing-maker/Bluvig.co.ke`. Framework: Next.js (auto-detected).
2. **Settings → Environment Variables** (Production *and* Preview):

| Variable | Value |
|---|---|
| `DATABASE_URL` | The Supabase pooler URI from step 1 |
| `ADMIN_PASSWORD` | A long random secret (signs sessions; one-time setup password for the first passkey) |
| `WEBAUTHN_ORIGIN` | `https://bluvig.co.ke` (Production only — passkeys are bound to this) |
| `RESEND_API_KEY` | From resend.com → API Keys |
| `NOTIFY_EMAIL` | Where alerts go, e.g. `collins@bluvig.co.ke` |
| `NOTIFY_FROM` | `Bluvig <hello@bluvig.co.ke>` — only after step 4; this also turns on the auto-reply to prospects |

3. **Analytics** tab → *Enable Web Analytics* (free, no cookies).
4. Deploy.

## 3. Domain
1. Vercel → **Settings → Domains** → add `bluvig.co.ke` and `www.bluvig.co.ke` (redirect www → apex).
2. At your DNS provider, lower the TTL a day before, then add the records Vercel shows.
3. Wait for the SSL certificate (usually minutes).

## 4. Email sender (Resend)
1. resend.com → **Domains** → add `bluvig.co.ke` and add the DNS records it shows (SPF/DKIM).
2. Once verified, set `NOTIFY_FROM` in Vercel and redeploy.

## 5. First sign-in
1. Open `https://bluvig.co.ke/cockpit/login` → enter `ADMIN_PASSWORD` once → create your passkey.
2. Cockpit → **Sign-in PIN** → set your 8-digit PIN.
3. Cockpit → **Passkeys** → add your phone as well, so you're never locked out.

## 6. Smoke test on the live site
- [ ] Home, Services, Work, Process, About, Contact, Privacy, Terms load on a phone
- [ ] Old links redirect: `/what-we-do` → `/services`, `/case-studies` → `/work`
- [ ] `/quotation` shows **KES** from Kenya (and USD from a VPN abroad)
- [ ] Submit a quotation and a call-back → both appear in the cockpit, alert email arrives
- [ ] With your email on the form → you receive the auto-reply (after step 4)
- [ ] PDF downloads; WhatsApp purchase-order link opens
- [ ] Cockpit → Insights shows the funnel counts
- [ ] `https://bluvig.co.ke/sitemap.xml` and `/robots.txt` load
- [ ] Share the home link on WhatsApp → preview card shows

## 7. Search engines
1. Google Search Console → add the domain property → submit `https://bluvig.co.ke/sitemap.xml`.
2. Bing Webmaster Tools → import from Search Console.
3. Google Business Profile → link to the website.
4. Watch Search Console → *Pages* for 404s from old WordPress URLs and add redirects in `next.config.ts`.
