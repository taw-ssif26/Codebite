# REPO_MAP — Codezy Christmas CodeBite 1.0

Live architectural index. Update this file whenever you create, move or change a file.

## Directory tree (one line per file)
```
.env.example                      Env var keys (no values)
next.config.mjs / tsconfig.json   Next 14 + TS config
tailwind.config.ts                Colors bound to CSS vars (--bg-primary … --accent-brand-2) for live re-skinning
supabase/schema.sql               Tables, functions, triggers, RLS, storage buckets, seed templates, super-admin insert
public/codezy-logo.svg            PLACEHOLDER logo — replace with the official Codezy logo
src/middleware.ts                 Refreshes Supabase session; redirects /admin and /profile to /login when signed out
src/app/layout.tsx                Root: injects DB theme CSS, ThermalProvider, Atmosphere, Preloader, LabBadge, ThermoBar, Dock
src/app/template.tsx              Route transition (fade/lift/blur)
src/app/globals.css               Tokens, glass/frost, atmosphere layers, thermometer, buttons, reduced-motion
src/app/page.tsx                  01 Expedition: Hero + brief strip
src/app/mentors/page.tsx          02 Mentors: asymmetric editorial layout
src/app/academy/page.tsx          03 Codezy Lab: story, mission, metrics (from site_settings)
src/app/segments/page.tsx         04 Segments: expandable timeline
src/app/vault/page.tsx            05 Vault: locked for guests; signed URLs for students/admins
src/app/dispatches/page.tsx       06 Notices board with URGENT/SCHEDULE/GENERAL tags
src/app/register/page.tsx         07 Registration (redirects to /profile if already registered)
src/app/login/page.tsx            Email one-time-code login
src/app/profile/page.tsx          08 Student profile + holographic pass (gated)
src/app/pass/[id]/page.tsx        Public QR landing page (abbreviated name, level, verified flag only)
src/app/api/qr/[id]/route.ts      PNG QR image for emails (encodes /pass/<id>)
src/app/actions/email.ts          Server actions: sendWelcomeEmail, sendBroadcast (admin-checked) via Brevo REST API (/v3/smtp/email)
src/app/admin/layout.tsx          Admin guard + sidebar
src/app/admin/page.tsx            Overview counts
src/app/admin/{content,theme}/    SettingsForm pages (hero/academy/countdown; color customizer)
src/app/admin/{instructors,segments,notices,resources}/  AdminCrud pages (client components)
src/app/admin/students/           Roster + exports
src/app/admin/email/              Template + broadcast composer
src/app/admin/admins/             Super-admin only: grant/revoke admins
src/components/thermal/ThermalProvider.tsx  Temperature state, curves, smooth interpolation → CSS vars
src/components/thermal/Atmosphere.tsx       Snow canvas + fog/sun/flare/ambient layers
src/components/thermal/ThermoBar.tsx        Right-edge thermometer (-20°C…+25°C, default -8°C)
src/components/thermal/Preloader.tsx        1.8s skippable boot sequence
src/components/nav/Dock.tsx                 Orbital Telemetry Dock (magnetic items, shared-layout pill, temp pill, Register/Student Pass)
src/components/nav/LabBadge.tsx             Top-left Codezy logo badge
src/components/home/*                       Hero, Countdown, MentorCard, SegmentExplorer, VaultClient
src/components/register/RegisterFlow.tsx    Multi-step, grade-adaptive registration + OTP + save
src/components/register/PhotoCropper.tsx    Client-side square crop → 512px JPEG
src/components/profile/Ticket.tsx           TicketFace (export) + TiltTicket (3D holographic)
src/components/profile/ProfileClient.tsx    Edit details/photo, PNG/PDF download
src/components/auth/*                       OtpVerify, LoginForm
src/components/admin/*                      AdminCrud, SettingsForm, StudentsTable, EmailComposer, AdminsManager, AdminNav
src/components/common/PageShell.tsx         Page header wrapper + EmptyState
src/lib/supabase/{client,server}.ts         Browser / server Supabase clients (server returns null without env)
src/lib/{auth,data}.ts                      getViewer(); cached-free CMS fetchers with fallbacks
src/lib/{constants,types,theme,defaults,email}.ts  Enums+labels, types, theme tokens, fallback content, email rendering
```

## Database (Supabase Postgres) — see supabase/schema.sql
Tables: `site_settings(key,value jsonb)`, `admins(email,role)`, `instructors`, `segments`, `notices`, `resources`, `students`, `email_templates`.
Functions: `admin_role()`, `is_admin()`, `is_super_admin()`, `is_student()`, `gen_student_code()` (CB1-XXXX), `students_guard()`, `get_public_pass(sid)`.

### RLS summary
| Table | Read | Write |
|---|---|---|
| site_settings, instructors, segments, notices | public | admin |
| resources | student or admin | admin |
| students | own row or admin | insert/update own (identity columns locked by trigger); admin update/delete |
| admins | admin | super-admin only |
| email_templates | admin | admin |

### Storage buckets
`instructors` (public) · `student-photos` (private; folder = auth uid; admins read) · `resources` (private; students/admins read; admins write)

## Env keys
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `BREVO_API_KEY`, `EMAIL_FROM`

## Global state / hooks
- `useThermal()` → `{ temp, setTemp, state }` (ThermalProvider; persisted in localStorage `cb1-temp`; writes `--frost --fog --sun --warmth` on `<html>`)
- Theme: `site_settings` `theme.*` → `themeCss()` → `:root` CSS vars (RGB channels)
- Auth session: Supabase cookies via middleware; `getViewer()` on the server, `createClient()` in the browser

## Server actions / routes
`sendWelcomeEmail()`, `sendBroadcast(input)` · `GET /api/qr/[id]` · Pages listed above.
