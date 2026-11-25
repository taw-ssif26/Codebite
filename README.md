# Codezy Christmas CodeBite 1.0

Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Supabase (Postgres, Auth, Storage) · Brevo · Vercel.

The site renders with built-in placeholder content even before Supabase is connected, so you can run it immediately.

## 1. Run locally
```bash
npm install
cp .env.example .env.local   # then fill in values (step 2–4)
npm run dev                  # http://localhost:3000
```

## 2. Supabase
1. Create a project at supabase.com (free tier).
2. **SQL Editor**: paste and run `supabase/schema.sql`. First change `you@example.com` at the very bottom to **your** email — that account becomes the super-admin.
3. **Project Settings → API**: copy the Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Authentication → Email Templates**: edit **both** "Confirm signup" and "Magic Link" so the body contains the 6-digit code: `Your CodeBite verification code: {{ .Token }}`. (The app uses one-time codes, not links.)
5. **Authentication → SMTP Settings**: connect Brevo SMTP: host `smtp-relay.brevo.com`, port `587`, username = the SMTP login shown in Brevo (SMTP & API → SMTP), password = an **SMTP key** (not the API key). Sender = your verified Brevo sender. Supabase's built-in mailer allows only a handful of emails per hour, which will block registrations.
6. **Authentication → URL Configuration**: set Site URL to your deployed URL.

## 3. Email (Brevo)
1. In Brevo: **SMTP & API → API Keys** → create a key → `BREVO_API_KEY`.
2. **Senders, Domains & Dedicated IPs**: add and verify your sender address (ideally authenticate your domain with the DKIM/DMARC records Brevo shows). Brevo rejects mail from unverified senders.
3. Set `EMAIL_FROM` to that sender, e.g. `Codezy CodeBite <hello@yourdomain.com>`.
4. Check Brevo's current free-plan daily sending limit before a large broadcast. Welcome emails and broadcasts both count against it.

## 4. Deploy (Vercel)
Import the repo, add the five env vars from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your production URL), deploy.

## 5. First-run checklist
1. Log in at `/login` with the super-admin email → open `/admin`.
2. **Hero & Academy**: set the event date, copy and academy story.
3. Add Instructors, Segments, Notices, Resources.
4. **Theme**: adjust colors live.
5. **Admins** (super-admin only): grant access to teammates by email.
6. Replace `public/codezy-logo.svg` with the official logo.
7. Register a test student end to end (OTP → photo → pass → welcome email → `/pass/CB1-XXXX`).

## Design decisions worth knowing
- **Privacy**: the public QR page (`/pass/[id]`) shows only an abbreviated name, level and a verified flag — no photo, phone, email or institution — because many students are minors and the 4-character ID space can be guessed. Photos live in a private bucket and are shown through short-lived signed URLs. Registration includes a consent checkbox.
- **No service-role key**: every operation runs as the signed-in user under RLS, so a leaked app bundle cannot bypass security.
- **Admin invites**: a super-admin adds an email to `admins`; that person signs in with a one-time code and sees the Admin link. No invite email is sent by the app.
- **Exports**: Excel (`.xlsx`) and UTF-8 CSV (opens cleanly in Google Sheets). There is no live Google Sheets API sync.
- **SheetJS `xlsx@0.18.5`** from npm is used for export only (no untrusted file parsing). Swap to the SheetJS CDN build if you want the latest.
- Fonts (Syne, Plus Jakarta Sans, JetBrains Mono) are self-hosted through `@fontsource-variable/*`.

## Known limitations
- Broadcast email runs in a single server action (`maxDuration = 60`). For thousands of recipients, move it to a queue or Supabase Edge Function.
- No rate limiting beyond Supabase Auth's own limits.
- Not tested against a live Supabase project in this build (type-check, production build and route smoke test pass). Run the first-run checklist above to confirm your keys, SMTP and templates.
