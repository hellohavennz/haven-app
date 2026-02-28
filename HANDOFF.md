# Haven App — Handoff Notes
_Last updated: 2026-02-28_

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
| Backend / DB | Supabase (PostgreSQL + RLS + Auth) |
| Serverless | Netlify Functions (TypeScript, in `netlify/functions/`) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Build / CI | Netlify auto-deploy on `main` push |

---

## Key file locations

| What | Where |
|---|---|
| Route definitions | `src/main.tsx` |
| App shell + login tracking | `src/layouts/RootLayout.tsx` |
| Landing page + pricing cards | `src/App.tsx` |
| Paywall / upgrade page | `src/pages/Paywall.tsx` |
| User profile + Resit Support form | `src/pages/Profile.tsx` |
| Admin portal | `src/pages/Admin.tsx` |
| Help & FAQ page | `src/pages/Help.tsx` |
| Subscription hook | `src/lib/subscription.ts` — `useSubscription()` → `{ tier, hasPlus, hasPremium }` |
| Admin API (TypeScript) | `src/lib/adminApi.ts` |
| Exam utilities | `src/lib/examUtils.ts` — `selectStaticExamQuestions(1\|2)`, seeded PRNG |
| Report button component | `src/components/ReportButton.tsx` |
| Supabase client | `src/lib/supabase.ts` |
| Netlify functions | `netlify/functions/` |
| DB migrations | `supabase/migrations/` |

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

**Test script:** `scripts/test-resit-flow.ts` — run with `npx tsx scripts/test-resit-flow.ts`. Tests all 8 steps end-to-end against the live site. Last run: 11/11 passed.

---

## Admin portal (`/uk/admin`)

Accessible only to `hello.haven.nz@gmail.com`. Five tabs:

| Tab | What it shows |
|---|---|
| Overview | Users by tier, signups 7d/30d, DAU/WAU/MAU, 30-day login chart, open reports, exam pass rate, upcoming test dates |
| Reports | Content reports (flag icon on lessons/questions/flashcards), triage open → reviewed → resolved |
| Users | All users with tier, progress, exam stats. Filter by tier or engagement (doing well / struggling) |
| Exams | Pass rate, avg score, avg duration, 50 most recent attempts |
| Resit | Pending/approved/rejected resit claims, approve/reject with notes |

---

## Environment variables

**Netlify environment (set in Netlify UI → Site config → Environment variables):**

```
VITE_SUPABASE_URL
VITE_SUPABASE_KEY           # anon key
SUPABASE_SERVICE_ROLE_KEY   # server-only, used in Netlify functions
VITE_STRIPE_PUBLISHABLE_KEY # safe for browser
STRIPE_SECRET_KEY           # server-only
STRIPE_WEBHOOK_SECRET       # whsec_... from Stripe dashboard
STRIPE_PLUS_PRICE_ID        # price_... for Plus monthly
STRIPE_PREMIUM_PRICE_ID     # price_... for Premium 6-monthly
```

**Stripe webhook endpoint:**
`https://havenstudy.app/.netlify/functions/stripe-webhook`

---

## Layout architecture

The app uses a single `RootLayout` with sticky navbar + scrollable `<main>`:

```
div.h-screen.flex-col          ← viewport height, no document scroll
  Navbar                       ← fixed at top
  div.flex-1.min-h-0           ← fills remaining height
    aside (sidebar, if any)    ← sidebar pages only
    main.flex-1.overflow-y-auto ← all scrolling happens here
      div (content wrapper)    ← Outlet + page content
      footer                   ← scrolls with content
  AskPippa                     ← Premium only, fixed floating button
  MobileNav                    ← sidebar pages only
```

Key: `h-screen` on the outer div (not `min-h-screen`) is what makes the navbar truly sticky — the document never grows taller than the viewport.

---

## Known pending items

- **Support email**: `support@haven.study` is used in `src/pages/Help.tsx` — set up the inbox once the domain is fully configured.
- **Google Auth CSP** (if added): update `netlify.toml` + `vercel.json` to add `https://accounts.google.com` to `connect-src` and `frame-src`.
- **Resit one-per-account enforcement**: currently relies on admin discretion; a DB constraint could be added to `resit_claims` if abuse becomes an issue.
