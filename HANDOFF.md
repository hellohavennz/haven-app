# Haven App — Handoff Notes
_Last updated: 2026-02-28 (session 2)_

---

## Repo & deployment

| | |
|---|---|
| **GitHub** | https://github.com/hellohavennz/haven-app |
| **Branch** | `main` (always deployable) |
| **Hosting** | Netlify (primary) — auto-deploys on push to `main` |
| **App URL** | https://havenstudy.app (Netlify primary domain) |
| **Marketing URL** | https://haven.study (Netlify alias domain) |
| **Router basename** | `/uk` — all routes live under `/uk/*` |
| **NZ / AU redirects** | `/nz` and `/au` (+ splat) → 302 to `/uk` equivalent |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (dark mode via `dark:` classes) |
| Routing | React Router v6, `basename: '/uk'` |
| Backend / DB | Supabase Pro (PostgreSQL + RLS + Auth) |
| Auth domain | `auth.havenstudy.app` (custom Supabase domain — replaces raw project URL) |
| Serverless | Netlify Functions (TypeScript, in `netlify/functions/`) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Charts | Recharts (admin portal only, separate bundle chunk) |
| PWA | `vite-plugin-pwa` + Workbox — service worker, web manifest, 25 precached entries |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk` — powers Pippa |
| Build / CI | Netlify auto-deploy on `main` push |

---

## Key file locations

| What | Where |
|---|---|
| Route definitions | `src/main.tsx` |
| App shell + login tracking | `src/layouts/RootLayout.tsx` |
| Auth guard (OAuth-safe) | `src/components/RequireAuth.tsx` |
| Landing page + pricing cards | `src/App.tsx` |
| Paywall / upgrade page | `src/pages/Paywall.tsx` |
| User profile + Resit Support form | `src/pages/Profile.tsx` |
| Admin portal | `src/pages/Admin.tsx` |
| Help & FAQ page | `src/pages/Help.tsx` |
| Privacy Policy | `src/pages/Privacy.tsx` → `/uk/privacy` |
| Terms of Service | `src/pages/Terms.tsx` → `/uk/terms` |
| Password reset page | `src/pages/ResetPassword.tsx` → `/uk/reset-password` |
| Subscription hook | `src/lib/subscription.ts` — `useSubscription()` → `{ tier, hasPlus, hasPremium }` |
| Admin API (TypeScript) | `src/lib/adminApi.ts` |
| Auth functions | `src/lib/auth.ts` — `signIn`, `signUp`, `signInWithGoogle`, `resetPassword`, etc. |
| Exam utilities | `src/lib/examUtils.ts` — `selectStaticExamQuestions(1\|2)`, seeded PRNG |
| Report button component | `src/components/ReportButton.tsx` |
| Supabase client | `src/lib/supabase.ts` |
| Netlify functions | `netlify/functions/` |
| DB migrations | `supabase/migrations/` |
| E2E test scripts | `scripts/` |
| App icons + favicon | `public/haven-icons/` |
| OG social banner | `public/haven-icons/haven_study_banner.png` (1200×630) |

---

## Subscription tiers (source of truth)

| Feature | Free | Plus (£4.99/mo) | Premium (£24.99/6 mo) |
|---|---|---|---|
| Lessons | 2 modules | All 29 | All 29 |
| Practice questions | Free modules only | 500+ | 500+ |
| Flashcards | 5 per session | All | All |
| Mock exams | — | 2 / month | 2 / month |
| Dynamic exam | — | — | ✅ |
| Resit Support | — | ✅ | ✅ |
| Pippa AI (AskPippa) | — | — | ✅ |
| Performance analytics | — | — | ✅ |
| Offline access | — | — | ✅ |
| Priority support | — | — | ✅ |

`profiles.subscription_tier` values: `'free'` | `'plus'` | `'premium'`

---

## Netlify Functions

| Function | Purpose |
|---|---|
| `create-checkout-session.ts` | Creates a Stripe Checkout session for Plus or Premium |
| `create-portal-session.ts` | Opens the Stripe Customer Portal for billing management |
| `stripe-webhook.ts` | Handles `checkout.session.completed`, `customer.subscription.updated/deleted` → updates `profiles.subscription_tier` |
| `approve-resit-claim.ts` | Admin-only: approves a resit claim, extends Stripe `trial_end` by 30 days |
| `reject-resit-claim.ts` | Admin-only: rejects a resit claim with optional admin notes |
| `admin-user-action.ts` | Admin-only: freeze, unfreeze, or delete a user account |
| `ask-pippa.ts` | Premium-only: verifies tier, calls Claude Haiku with Pippa system prompt + user study context, returns plain-text reply |

All functions authenticate via `Authorization: Bearer <supabase_jwt>`. Admin functions additionally verify `jwt.email === 'hello.haven.nz@gmail.com'`.

---

## Supabase migrations

| File | What it does | Status |
|---|---|---|
| `20260224000001_onboarding_columns.sql` | Adds onboarding columns to profiles | ✅ Applied |
| `20260224000002_base_schema.sql` | Base schema (lessons, user_progress, exam_attempts, etc.) | ✅ Applied |
| `20260224000003_schema_alignment.sql` | Schema alignment fixes | ✅ Applied |
| `20260224000004_content_reports.sql` | `content_reports` table + RLS | ✅ Applied |
| `20260224000005_admin_portal.sql` | Admin RPC functions (`admin_overview`, `admin_get_users`, etc.) | ✅ Applied |
| `20260227000006_stripe_columns.sql` | Adds `stripe_customer_id`, `stripe_subscription_id` to profiles | ✅ Applied |
| `20260228000007_resit_claims.sql` | `resit_claims` table + RLS + storage policy for `resit-evidence` bucket | ✅ Applied |
| `20260228000008_admin_actions.sql` | Updates `admin_overview` (adds `daily_signups`) and `admin_get_users` (adds `banned_until`) | ✅ Applied |
| `20260228000009_resit_one_per_account.sql` | Partial unique indexes: one `approved` per user (lifetime), one `pending` per user at a time | ✅ Applied |

---

## Authentication

- **Email + password** — Supabase auth. Passwords hashed with **bcrypt** (random salt per password, cost factor 10). Plaintext is never stored or accessible.
- **Password requirements** — min 10 characters, 1 uppercase, 1 lowercase, 1 number. Enforced client-side with live checklist. ⚠️ Also set in **Supabase Dashboard → Authentication → Password Policy → minimum length = 10** to enforce server-side.
- **Google OAuth** — live and working. Consent screen shows `auth.havenstudy.app`. Redirect goes to `/uk/dashboard`.
- **Forgot password** — "Forgot password?" on login page → sends reset email → `/uk/reset-password` handles the recovery token.
- **Custom auth domain** — `auth.havenstudy.app` (Supabase Pro). CNAME + TXT records in Netlify DNS. Google OAuth redirect URI: `https://auth.havenstudy.app/auth/v1/callback`.
- **OAuth loop fix** — `RequireAuth` uses `onAuthStateChange` (not `getUser()`) so the session is established before the auth check fires.
- **Supabase redirect URLs allowlist** — includes `https://havenstudy.app/uk/dashboard` and `https://havenstudy.app/uk/reset-password`.

---

## Content Security Policy

Defined in `netlify.toml` **and** `vercel.json` (keep in sync).

Key `connect-src` entries:
- `https://auth.havenstudy.app` + `wss://auth.havenstudy.app` — **must be explicit**; `*.supabase.co` does NOT cover a custom domain
- `https://*.supabase.co` + `wss://*.supabase.co`
- `https://api.stripe.com`

Key `form-action`: `https://checkout.stripe.com`

---

## PWA

Phase 1 is live:
- **Manifest** — `start_url: '/uk/'`, `display: 'standalone'`, theme `#0d9488`
- **Icons** — all sizes in `public/haven-icons/` (16px → 512px + maskable)
- **Service worker** — Workbox `generateSW`, precaches 25 entries (~3.5 MB), `navigateFallback: '/uk/'`
- **Auto-update** — `registerType: 'autoUpdate'`

Phase 2 (offline study + IndexedDB progress queue) — not yet built.

---

## SEO / Social

- **OG tags** — `og:title`, `og:description`, `og:image`, `og:url` in `index.html`
- **Twitter card** — `summary_large_image`
- **OG image** — `public/haven-icons/haven_study_banner.png` (1200×630), served at `https://havenstudy.app/haven-icons/haven_study_banner.png`
- Test link previews at: https://www.opengraph.xyz

---

## Pippa AI (AskPippa)

Available to Premium subscribers only. Floating teal button bottom-right on all pages.

- **Component** — `src/components/AskPippa.tsx` — chat panel, message history (session only, not persisted), auto-scroll, dark mode
- **Function** — `netlify/functions/ask-pippa.ts` — verifies JWT + Premium tier, calls `claude-haiku-4-5-20251001`
- **Context** — reads user's weak/strong lesson areas from localStorage progress and passes to Claude as context for personalised answers
- **System prompt** — defines Pippa as calm, warm, plain-English study assistant for the Life in the UK test. No markdown formatting.
- **Auth** — JWT verified server-side; tier checked against `profiles.subscription_tier`; returns 401 (unauth) or 403 (not Premium) if rejected
- **Cost** — Claude Haiku, ~$0.001 per conversation. Set a spend cap at console.anthropic.com → Settings → Limits.
- **E2E test** — `scripts/test-ask-pippa.ts` — run with `npx tsx scripts/test-ask-pippa.ts`. Tests: real reply, conversation history, free user rejection, unauthenticated rejection.

---

## Resit Support system

End-to-end feature for users who fail their test — available to Plus and Premium subscribers.

**User flow (Profile page):**
1. Section auto-checks 3 eligibility criteria from the DB in parallel:
   - All 24 completable lessons finished (5 chapter intros have no questions and can't be completed)
   - Average practice score ≥ 75%
   - At least 1 mock exam passed
2. One manual checkbox: "I sat the test within the last 14 days"
3. When all 4 conditions are met, the form unlocks → user uploads photo evidence → submits claim → row inserted into `resit_claims`

**Admin flow (Admin portal → Resit tab):**
- Lists pending / approved / rejected claims
- "Approve" button calls `approve-resit-claim` function → extends Stripe `trial_end` by 30 days, updates claim status to `approved`
- "Reject" button (with optional notes) calls `reject-resit-claim` → updates status to `rejected`
- Evidence photos link directly to the `resit-evidence` storage bucket

**Storage:** `resit-evidence` bucket (public). Evidence paths: `{user_id}/{filename}`.

**Test script:** `scripts/test-resit-flow.ts` — run with `npx tsx scripts/test-resit-flow.ts`. Last run: 11/11 passed.

---

## Admin portal (`/uk/admin`)

Accessible only to `hello.haven.nz@gmail.com`. Link appears in navbar when logged in as that account. Five tabs:

| Tab | What it shows |
|---|---|
| Overview | Users by tier, signups 7d/30d, DAU/WAU/MAU, recharts AreaChart (daily logins + new accounts, daily/weekly toggle), open reports, exam pass rate, upcoming test dates |
| Reports | Content reports (flag icon on lessons/questions/flashcards), triage open → reviewed → resolved |
| Users | All users with tier, progress, exam stats. Freeze/unfreeze (Supabase ban) + delete with confirm modal. Filter by tier or engagement |
| Exams | Pass rate, avg score, avg duration, 50 most recent attempts |
| Resit | Pending/approved/rejected resit claims, approve/reject with notes |

---

## Environment variables

**Netlify environment (set in Netlify UI → Site config → Environment variables):**

```
VITE_SUPABASE_URL            # https://auth.havenstudy.app (custom domain)
VITE_SUPABASE_KEY            # anon key
SUPABASE_SERVICE_ROLE_KEY    # server-only, used in Netlify functions
VITE_STRIPE_PUBLISHABLE_KEY  # safe for browser
STRIPE_SECRET_KEY            # server-only
STRIPE_WEBHOOK_SECRET        # whsec_... from Stripe dashboard
STRIPE_PLUS_PRICE_ID         # price_... for Plus monthly
STRIPE_PREMIUM_PRICE_ID      # price_... for Premium 6-monthly
ANTHROPIC_API_KEY            # server-only, used by ask-pippa function
```

**Stripe webhook endpoint:**
`https://havenstudy.app/.netlify/functions/stripe-webhook`

---

## Layout architecture

The app uses a single `RootLayout` with sticky navbar + scrollable `<main>`:

```
div.h-screen.flex-col           ← viewport height, no document scroll
  Navbar                        ← fixed at top (Admin link visible to admin only)
  div.flex-1.min-h-0            ← fills remaining height
    aside (sidebar, if any)     ← sidebar pages only
    main.flex-1.overflow-y-auto ← all scrolling happens here
      div (content wrapper)     ← Outlet + page content (no h-full)
      footer                    ← Instagram icon · Privacy · Terms · copyright
  AskPippa                      ← Premium only, fixed floating button
  MobileNav                     ← sidebar pages only
```

Key: `h-screen` on the outer div (not `min-h-screen`) is what makes the navbar truly sticky. Content wrapper must NOT have `h-full` or the footer renders mid-page.

---

## E2E test scripts

| Script | What it tests | Run with |
|---|---|---|
| `scripts/test-resit-flow.ts` | Full resit claim flow against live site | `npx tsx scripts/test-resit-flow.ts` |
| `scripts/test-forgot-password.ts` | Forgot password → recovery token → password update | `npx tsx scripts/test-forgot-password.ts` |
| `scripts/test-ask-pippa.ts` | Pippa AI — real reply, conversation history, free/unauth rejection | `npx tsx scripts/test-ask-pippa.ts` |

---

## Known pending items

- **Supabase password policy** — ✅ minimum length set to 10 (Authentication → Providers → Email). Matches frontend enforcement.
- **Missing profile safeguard** — ✅ `checkSubscriptionStatus()` auto-creates the profile row on PGRST116 so users are never stuck with no DB row.
- **Dynamic exam** — ✅ Built. Adaptive question selection weighted by weak lesson areas (`selectDynamicExamQuestions` in `examUtils.ts`).
- **Resit one-per-account enforcement** — ✅ Enforced via partial unique indexes (`migration 000009`). One approved per user (lifetime), one pending at a time. Rejected users can resubmit.
- **PWA Phase 2** — offline study: cache lesson content on first load, queue progress writes to IndexedDB, sync when back online.
- **Email reminders** — notify users when their test date is approaching. Supabase cron + edge functions.
