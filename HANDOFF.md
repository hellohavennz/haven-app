# Haven App — Handoff Notes
_Last updated: 2026-03-10 (session 16)_

---

## Repo & deployment

| | |
|---|---|
| **GitHub** | https://github.com/hellohavennz/haven-app |
| **Branch** | `main` (always deployable) |
| **Hosting** | Netlify (primary) — auto-deploys on push to `main` |
| **App URL** | https://havenstudy.app (Netlify primary domain) |
| **Marketing URL** | https://haven.study (separate Netlify site — repo: hellohavennz/haven-study-landing) |
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
| `send-exam-reminders.ts` | **Scheduled** (daily 08:00 UTC): queries profiles for exam_date = today+7 or today+1, sends reminder emails via Resend, marks flags to prevent duplicates |

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
| `20260228000010_exam_reminder_flags.sql` | Adds `exam_reminder_7d_sent` + `exam_reminder_1d_sent` boolean columns to profiles | ✅ Applied |
| `20260301000011_lesson_read.sql` | — | ✅ Applied |
| `20260301000012_drop_study_goal.sql` | Drops unused `study_goal` column from profiles | ✅ Applied |
| `20260303000013_admin_revenue_series.sql` | Adds `revenue_by_day` series to `admin_overview` RPC (powers MRR bar chart) | ✅ Applied |
| `20260303000014_exam_attempts_deny_dml.sql` | Explicit DENY policies for DELETE + UPDATE on `exam_attempts` | ✅ Applied |
| `20260305000015_app_settings.sql` | `app_settings` table + RLS (sale toggle, discount level) | ✅ Applied |
| `20260305000016_fix_rls_performance.sql` | Fix `auth_rls_initplan` + `multiple_permissive_policies` + drop duplicate constraint on `user_progress` | ✅ Applied |
| `20260305000017_fix_security_warnings.sql` | `SET search_path = ''` on 9 functions; drop always-true UPDATE policy on profiles | ✅ Applied |

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

- **OG tags** — full set: `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:url`, `og:locale: en_GB` in `index.html`
- **Twitter card** — `summary_large_image` with distinct description from OG
- **OG image** — `public/haven-icons/haven_study_banner.png` (1200×630), served at `https://havenstudy.app/haven-icons/haven_study_banner.png`
- **Schema.org** — full `@graph`: Organization, WebSite, WebApplication (with pricing offers + `availability`), FAQPage (5 questions)
- **Keywords** — 8 targeted keywords covering "life in the uk test", ILR, citizenship test, study guide variants
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
VITE_SUPABASE_KEY            # Publishable key (haven_frontend) — baked into frontend build
SUPABASE_SERVICE_ROLE_KEY    # Secret key (haven_netlify_functions) — server-only, Netlify functions only
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

⚠️ Scripts are **gitignored** (`scripts/` in `.gitignore`) — local only, never committed.

| Script | What it tests | Run with |
|---|---|---|
| `scripts/test-resit-flow.ts` | Full resit claim flow against live site | `npx tsx scripts/test-resit-flow.ts` |
| `scripts/test-forgot-password.ts` | Forgot password → recovery token → password update | `npx tsx scripts/test-forgot-password.ts` |
| `scripts/test-ask-pippa.ts` | Pippa AI — real reply, conversation history, free/unauth rejection | `npx tsx scripts/test-ask-pippa.ts` |
| `scripts/test-email-reminders.ts` | Exam reminder emails — creates test users, runs reminder loop, checks DB flags, verifies idempotency | `npx tsx --env-file=.env scripts/test-email-reminders.ts` |

All scripts load credentials from `.env` via a local `loadEnv()` — no hardcoded keys.

---

## Known pending items

- **Supabase password policy** — ✅ minimum length set to 10 (Authentication → Providers → Email). Matches frontend enforcement.
- **Missing profile safeguard** — ✅ `checkSubscriptionStatus()` auto-creates the profile row on PGRST116 so users are never stuck with no DB row.
- **Dynamic exam** — ✅ Built. Adaptive question selection weighted by weak lesson areas (`selectDynamicExamQuestions` in `examUtils.ts`).
- **Resit one-per-account enforcement** — ✅ Enforced via partial unique indexes (`migration 000009`). One approved per user (lifetime), one pending at a time. Rejected users can resubmit.
- **PWA Phase 2** — ✅ Built. Three-layer offline strategy: (1) Workbox `runtimeCaching` (`StaleWhileRevalidate`, 7-day TTL) caches all 5 Supabase content API endpoints transparently after first online visit; (2) `content-snapshot-v1` in localStorage provides a second fallback for cold service worker; (3) `syncProgressOnReconnect()` batch-upserts all localStorage progress to Supabase on reconnect. Offline banner shown in `RootLayout` when `navigator.onLine` is false.
- **Email reminders** — ✅ Built and live. Netlify Scheduled Function (`send-exam-reminders.ts`) runs daily at 08:00 UTC. Sends 7-day and 1-day reminder emails via Resend. `haven.study` domain verified at resend.com, `RESEND_API_KEY` set in Netlify env. Flags on `profiles` prevent duplicates; flags reset when exam date changes.
- **Visual rebrand** — ✅ Done (session 3, v2). Design v2 palette: teal-500 `#5F9D86` (brand), amber-500 `#C9973F` (gold accent), cream `#FAF7F2` (page bg), app-bg `#F4F7F5`, warm green-grey slate neutrals. Fonts: Montserrat (headings 600/700) + Source Sans 3 (body/UI 400/600/700). Rollback tag: `pre-design-v2` (commit `07ea806`). Dark mode unchanged. See MEMORY.md design system section for full palette.
- **Instagram landing page** — ✅ Done (session 3). Standalone at `/uk/instagram`. No app navbar/footer. Prices: Free £0 / Plus £4.99/mo / Premium £24.99/6mo. Route is top-level in `main.tsx`, outside `RootLayout`.
- **Monthly-rotating exam questions** — ✅ Done (session 3). Static exam 1 and 2 now use a month+year component in their seed so questions rotate each calendar month while remaining deterministic within a month.
- **"handbook" / "chapters" language** — ✅ Done (session 3). UI/marketing copy updated to use "test syllabus" / "modules". Factual lesson content about the official book left intact. Chapter intros updated to say "module".
- **Homepage syllabus alignment callout** — ✅ Done (session 3). Added `ShieldCheck` section between stats bar and features on `App.tsx`, plus `✓ Built around the official test syllabus` trust badge in hero strip.
- **Mobile study menu** — ✅ Fixed (session 3). Tapping a module heading on mobile now only expands/collapses the list; drawer stays open. Desktop still auto-navigates to first lesson on expand. Signal: `onNavigate` prop defined = mobile context.
- **Dashboard mobile header** — ✅ Fixed (session 3). Header now stacks vertically on mobile (`flex-col sm:flex-row`). Upgrade button text shortened to "Upgrade to Plus".
- **iOS date picker** — ✅ Fixed (session 3). `overflow-hidden` on tile container; `[color-scheme:light] dark:[color-scheme:dark]` on the `<input type="date">` prevents the blank-input / overflow issue on iOS Safari.
- **Onboarding study goal step removed** — ✅ Done (session 3). Step 2 (study time dedication) removed from `Welcome.tsx`. Onboarding is now 2 steps: exam date → all set. `studyGoal` made optional in `OnboardingData` type for backward-compat; field no longer written to localStorage or Supabase. `Dashboard.tsx` pacing widget simplified to show raw lessons/day needed.

---

## Session 8 changes (2026-03-03)

- **Admin logout** — Sign Out button added to admin navbar (logo + ThemeToggle + Sign Out)
- **Google OAuth blank screen** — Root cause: Supabase Site URL and Redirect URLs not configured for `/uk`. Code fix: `App.tsx` now listens for `SIGNED_IN` event (not just one-shot `getCurrentUser()`) so PKCE code exchange is caught even if user lands on marketing page. **Still required: fix Supabase URL Configuration (see pending tasks below).**
- **Google OAuth + paid plan** — Fixed: `Signup.tsx` now saves `pending_checkout_plan` to localStorage before launching OAuth. `Dashboard.tsx` checks on mount and triggers Stripe checkout if a pending plan exists and user is free tier.
- **Instagram page** — Stats corrected: 590+→560+, 610+→570+ (actual counts: 563 questions, 574 flashcards)
- **Pre-launch fixes** — Fake testimonial removed, "join thousands" claim removed, v1 sage palette→v2 teal, emoji icons→SVGs, house brand mark→actual Haven logo, Sentry installed (`@sentry/react`, initialised in `main.tsx`, disabled unless `VITE_SENTRY_DSN` is set)
- **Security** — `create-checkout-session` and `send-welcome-email` require JWT; `exam_attempts` deny DELETE/UPDATE policies (migration 000014 applied)
- **Docs** — README and CONTEXT_FOR_CONTENT_CREATION fully rewritten

---

## Session 7 changes (2026-03-03)

- **Security: `create-checkout-session`** — Now requires `Authorization: Bearer <token>`. JWT is verified via `supabase.auth.getUser()`; `userId` and `email` are derived from the verified token instead of trusting client-supplied request body fields.
- **Security: `send-welcome-email`** — Same JWT check added. Unauthenticated callers receive 401, preventing endpoint abuse for email spam.
- **`Signup.tsx`** — Reads `data.session.access_token` after `signUp()` and passes it as `Bearer` token in both Netlify function calls.
- **Migration `000014`** — Explicit `FOR DELETE USING (false)` and `FOR UPDATE USING (false)` policies added to `exam_attempts`. Applied ✅.

---

## Session 6 changes (2026-03-03)

- **Practice UX** — Removed intermediate choice screen. `/practice` now shows per-lesson rows inside each module card, each with direct "Questions" and "Flashcards" buttons. Navigating to `/practice/:lessonId/questions` skips the choice screen and starts immediately. Accuracy dot per lesson (grey/green/yellow/red).
- **Practice results — Next lesson** — Results screen now has three buttons: "Study notes" (→ lesson content), "Try again", and "Next lesson →" (→ next lesson's questions). Button absent on the final lesson.
- **Admin MRR chart** — Static MRR stat replaced with `MrrCard` component: clickable bar chart cycling daily → weekly → monthly. Shows new paid subscriber revenue per period (180-day history). Powered by `revenue_by_day` field in `admin_overview` RPC.
- **Content fixes** — 5 questions in Supabase updated via SQL to remove pronoun context-dependency ("these values", "said they had no religion" etc.). Run directly in Supabase SQL editor.
- **Migrations applied** — `000012_drop_study_goal` and `000013_admin_revenue_series` both applied.
- **Resend** — Domain verified, `RESEND_API_KEY` set in Netlify. Email reminders fully live.
- **Profile backfill** — Missing profile rows created for all existing auth users. Admin Users tab now shows all accounts.

---

## Session 5 changes (2026-03-03)

- **PWA theme-color** — `index.html` meta tag updated from `#7B9E87` (old sage) to `#4E8571` (teal-600 v2). Android PWA title bar will show correct brand green after next deploy.
- **drop_study_goal migration** — `supabase/migrations/20260301000012_drop_study_goal.sql` created. **Action required: run in Supabase SQL editor** to drop the unused `study_goal` column from `profiles`.
- **Admin redirect** — `Dashboard.tsx` redirects admin email to `/admin` on mount, bypassing the regular dashboard entirely.
- **Admin stripped navbar** — `Navbar.tsx` returns a minimal bar (logo + ThemeToggle only) when `isAdmin`. No nav links, no mobile hamburger, no upgrade button.
- **Admin UI guards** — `RootLayout.tsx` adds `isAdmin` state (set from `supabase.auth.getUser()` in the preload effect). `AskPippa`, `MobileNav`, and the drawer are all hidden when `isAdmin` is true.
- **Admin Overview: Est. MRR + Conversion rate** — Two new stat cards added to a new "Revenue" section in `OverviewTab`. MRR = `(plus × £4.99) + (premium × £24.99/6)`; conversion = paid ÷ total users.
- **Admin Users: search box** — Text input above filter pills in `UsersTab`. Filters `email` and `display_name` case-insensitively.
- **Admin Exams: pass/fail counts** — Pass rate stat card now includes `sub` text: "X passed · Y failed" derived from `total_attempts × pass_rate`.

---

---

## Session 4 changes (2026-03-02)

- **Dashboard exam widget mobile** — Empty state ("No exams yet") now stacks `flex-col` on mobile, `sm:flex-row` on desktop. Prevents icon + text + CTA from cramming onto one line.
- **Key Fact tile icon** — Removed clipboard SVG from the "Key Fact" heading in `src/components/LessonContent.tsx`. Label remains, icon gone.
- **Navbar logo** — Logo now links to `/dashboard` when the user is on `/content`, `/practice`, or `/flashcards`; links to `/` (marketing homepage) everywhere else. Logic in `src/components/Navbar.tsx` using `useLocation`.
- **Module tile small locks** — Removed `h-3 w-3` `<Lock>` icons from beside "Module X" label on locked tiles in `ContentIndex.tsx` and `PracticeIndex.tsx`. Larger lock icon in tile corner/body unchanged.

---

## Session 16 changes (2026-03-10)

- **Blog at havenstudy.app/blog/** — Astro 4 blog scaffolded in `astro-blog/` directory. Builds to `dist/blog/` as part of the same Netlify deploy. No separate hosting needed.
- **netlify.toml build command updated** — `npm run build && cd astro-blog && npm install && npm run build`. Vite builds first, then Astro appends its output to `dist/blog/`.
- **Two articles published** — Cornerstone: "Life in the UK Test: The Complete Study Guide" (`/blog/life-in-the-uk-test-study-guide/`). Supporting: "When Should You Take the Life in the UK Test Before ILR?" (`/blog/when-to-take-life-in-the-uk-test-before-ilr/`).
- **Study Guides section on homepage** — Two article preview cards added to `App.tsx` between "How It Works" and Pricing. Links to both blog posts. "View all guides" link to `/blog/`.
- **Blog structure** — Astro content collections. Posts use frontmatter: `title`, `description`, `excerpt`, `pubDate`, `readTime`, `featured`. Sitemap auto-generated at `/blog/sitemap-index.xml`.

### How to add a new blog post

1. Create a new `.md` file in `astro-blog/src/content/posts/`
2. Use this frontmatter at the top:

```markdown
---
title: "Your Article Title"
description: "Meta description for Google (150-160 chars)"
excerpt: "Short summary shown on listing page and post header"
pubDate: 2026-03-10
readTime: 7
featured: false
---

Article body in Markdown...
```

3. The filename becomes the URL slug. Example: `what-happens-if-you-fail.md` becomes `havenstudy.app/blog/what-happens-if-you-fail/`
4. Commit and push to `main`. Netlify deploys automatically.
5. Update the Study Guides cards in `src/App.tsx` if you want to feature the new article on the homepage.

---

## Session 15 changes (2026-03-08)

- **Memory hooks — formatting** — All 29 lesson memory hooks reformatted with consistent structure. Added `whitespace-pre-line` to `<p>` in `ContentLesson.tsx` and `Lesson1Content.tsx` so newlines render. Each hook now uses ALL CAPS section headers, dash-prefix bullet lists, and pipe separators for parallel items. Fixed em dash in lesson-1.3 hook.
- **Continue button — study dashboard** — `ContentIndex.tsx` `nextLesson` logic fixed. Previously found first lesson where practice accuracy was null (always lesson 1 for unstarted users). Now finds first lesson not marked as read (`progress.read !== true`), falling back to first low-accuracy lesson, then first lesson.
- **Key fact stale index bug** — `KeyFactTile` held internal `currentIndex` state that persisted across React Router navigations. Navigating from a lesson where you'd clicked to index 3, to a lesson with only 2 facts, left `currentIndex=3` — blank content and a wrong counter (e.g. "4/2"). Fixed by adding `key={lessonId}` to `<LessonContent>` in `ContentLesson.tsx`, forcing a full remount on lesson change.
- **Handbook language audit** — Searched all Supabase lesson content for self-referential "handbook" language (Haven calling itself a handbook). One genuine fix: section heading "How to Use This Handbook" renamed to "The Official Handbook" and content rewritten to open with "Haven is the study platform — the source material is the official government publication...". All other bare "handbook" references updated to "official handbook" for clarity. Memory hooks updated. Study Tips section now ends: "Haven is built around that material — use both together for the best chance of passing."
- **Module completion transition page** — New page at `/content/module-complete/:moduleSlug`. When a user clicks Next on the last lesson of a module, they now land on a transition page instead of silently entering the next module. Shows: module name + lesson count in a teal completion card; next module name + description with one-click continue button; "Back to study dashboard" link. Final module shows "Take a mock exam" instead. The Next button in `ContentLesson.tsx` detects module boundary crossings (`lesson.module_slug !== nextLesson.module_slug`) and its label changes to "Module complete / Up next: [next module title]".

---

## Session 14 changes (2026-03-06)

- **Navbar desktop links** — Hidden for logged-out users. Sign In / Sign Up remain visible. All nav links (Study, Practice, Exam, Dashboard, Help, Analytics) only render when `user` is set.
- **PWA icons** — Replaced `icon-192x192.png` and `icon-512x512.png` with new dark circle + teal H design matching the favicon. Generated via Node + sharp from SVG source.
- **haven.study founding story** — "Built by someone who failed the test" headline. Story tightened to 5 short paragraphs. Live on haven.study between Resit Support callout and Pricing sections.
- **MARKETING.md** — Created. Full launch plan: founding story (long + short form), pre-launch checklist, channel strategy (Instagram, Facebook groups, Reddit, paid ads, SEO), pricing/conversion strategy, metrics targets, competitor notes.
- **Exam question deduplication** — `selectExamQuestions` and `selectStaticExamQuestions` now track `usedPrompts` during module selection, preventing the same question appearing twice in one exam. `selectDynamicExamQuestions` was already correct.
- **Grammar fixes (Supabase)** — 6 flashcards/questions updated: added "the" before MRI scanner, hovercraft, jet engine, television, ATM. Rephrased "An 1851 showcase..." option. Rewrote ambiguous alcohol question: "Is it a criminal offence to sell alcohol to an 18-year-old?" → "What is the minimum age to buy alcohol in the UK?" with clean options (18/16/21/17).
- **Content scan** — 563 questions and 574 flashcards scanned for context-dependency (zero found), duplicate prompts (14 identified, 7 cross-lesson pairs fixed via deduplication), and grammar issues (6 fixed above).
- **ChatGPT Custom GPT** — `marketing/chatgpt-custom-gpt.md` created with full system prompt and 6 workflow templates. `marketing/haven-content-export.md` (315 KB) generated from Supabase as knowledge file.
- **Content gap analysis** — Compared Haven content against official LITUK handbook. Two confirmed gaps fixed:
  1. **Rudyard Kipling** — Added study section, 3 questions, 3 flashcards to Arts and Culture lesson. Born India 1865, The Jungle Book + Just So Stories, Nobel Prize 1907, poem "If".
  2. **How many American colonies?** — Added dedicated question (answer: 13) and flashcard to A Global Power lesson. The number was in study text but had no dedicated question.
  3. **Mary Quant + designers** — Added designers paragraph to Art and Architecture study section: Chippendale, Clarice Cliff, Terence Conran, Mary Quant, Alexander McQueen, Vivienne Westwood.
- **Deep content audit (session 14 continued)** — Full chapter-by-chapter comparison of official LITUK handbook vs Haven. 22 missing facts and 4 partials identified and fixed:
  - Updated sections: Victorian Age, Right to Vote, Restoration/Glorious Revolution, Classical Music, Art and Architecture, Literature
  - New sections added: Robert Burns, Immigration and Refugees (Huguenots/Jews), John Maynard Keynes
  - New content: Florence Nightingale, George/Robert Stephenson, Boer War, 13 million emigrants, Married Women's Property Acts 1870/1882, Pankhurst's Women's Franchise League 1889, Killiecrankie 1689, Glencoe massacre, William Walton, Pre-Raphaelites (Rossetti/Hunt/Millais), Gertrude Jekyll, David Allan, John Lavery, John Petts, Lucian Freud, Kidnapped (RLS), Attlee as Deputy PM, Keynes
  - 18 new questions and 18 new flashcards added across 4 lessons
- **haven-content-export.md regenerated** — Now 329.3 KB, 141 sections, 585 questions, 596 flashcards.

---

## Session 13 changes (2026-03-05)

- **haven.study landing page** — Built and deployed as a standalone static site. New repo: `hellohavennz/haven-study-landing`. Deployed to Netlify (project: `jolly-banoffee-77bb55`). Domain `haven.study` moved from havenstudy.app Netlify alias → own Netlify site with custom domain. Files: `index.html`, `netlify.toml`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `og-image.png`. Full SEO: title, meta description, canonical, OG tags, Twitter Card, Schema.org `@graph` (Organization, WebSite, Course with pricing offers, FAQPage with 6 questions). Sections: hero, stats bar, "What is the test?", features, how it works, resit callout, pricing (3 tiers), FAQ accordion, CTA, footer. All CTAs link to `havenstudy.app/uk`.
- **Logo update** — Replaced book icon image with `Haven.` text logo (Montserrat bold, teal full stop) in `Navbar.tsx`. Works in light and dark mode. Both admin and regular navbar updated.
- **Favicon** — New SVG favicon: dark circle (`#0F172A`) with teal H (`#14B8A6`), Montserrat font stack. Added to both repos. Main app: `public/haven-icons/favicon.svg` (SVG link takes priority over legacy `favicon.ico`).
- **SEO — haven.study** — Removed unverified `sameAs` social links from Organization schema (add back once accounts created). Fixed Organization `logo` to point to `favicon.svg`. Added `og:image:alt`.
- **SEO — havenstudy.app** — Meta description rewritten with numbers + CTA. Keywords expanded to 8. Added `robots`, `author`, `og:locale`, `og:image:alt`. Title updated to keyword-first. OG and Twitter descriptions now distinct. Canonical and `og:url` now consistent (both `/uk/`). Schema.org upgraded from bare `WebApplication` to full `@graph` (Organization, WebSite, WebApplication, FAQPage).
- **Em dashes** — All 13 em dashes removed from `haven.study/index.html`, replaced with commas, colons, or full stops.
- **Google Search Console** — haven.study verified via DNS TXT record at onlydomains.com. Sitemap submitted. URL inspection + index request done.

---

## Session 12 changes (2026-03-05)

- **Critical security fix: anon data leak on profiles** — Anonymous requests (using only the publishable API key, no JWT) were returning user profile rows including email, Stripe customer/subscription IDs, and subscription tier. Root cause: RLS policies were scoped to `{public}` (all roles) rather than `TO authenticated`. Even with a correct `USING (auth.uid() = id)` expression, Supabase's new publishable key format caused anon requests to bypass the USING filter.
- **Migration `000020`** — Rewrote all sensitive table policies with explicit `TO authenticated` scope: `profiles`, `user_progress`, `exam_attempts`, `resit_claims`, `content_reports`, `login_events`. Anon role now has zero matching policies on these tables → PostgreSQL denies all rows by default. Verified: anon curl returns `[]` on all tables; authenticated curl returns own row only.
- **Content tables remain public-readable** (`lessons`, `questions`, `flashcards`, `study_sections`, `modules`) — intentional, these contain no user data and are needed before login.
- **Migration `000018`** — Fixed remaining `app_settings` RLS warnings: split `FOR ALL` admin policy into `FOR INSERT` + `FOR UPDATE` (removes SELECT overlap with public_read policy); switched from inline `auth.jwt()` to `public.is_admin()`.
- **Migration `000019`** — Added `btree` indexes on `order_index` for `questions`, `study_sections`, `lessons`, `flashcards` — ~8x query cost reduction on content load (confirmed by index_advisor).
- **Landing page login** — "Sign In" link now always visible in navbar (was `hidden md:flex`, invisible on mobile). "Sign Up" remains desktop-only.

---

## Session 11 changes (2026-03-05)

- **Supabase security warnings cleared** — All 11 security issues resolved:
  - Migration `000017`: `SET search_path = ''` added to 9 public functions (`handle_new_user`, `is_admin`, `admin_overview`, `admin_get_reports`, `admin_update_report`, `admin_get_users`, `admin_get_exam_stats`, `update_updated_at_column`, `moddatetime`) to fix `function_search_path_mutable` warnings.
  - Migration `000017`: Dropped "Service role can update all" always-true UPDATE policy on `profiles` (service role bypasses RLS anyway).
  - Supabase Dashboard → Authentication → Settings: **Leaked password protection** (HaveIBeenPwned.org) enabled.
- **Supabase performance warnings cleared** — All 51 performance issues resolved:
  - Migration `000016`: Dropped all legacy duplicate RLS policies on `profiles`, `user_progress`, `exam_attempts`, `content_reports`, `login_events`, `resit_claims`, `app_settings`. Recreated canonical policies using `(select auth.uid())` pattern to fix all `auth_rls_initplan` warnings.
  - Migration `000016`: Dropped redundant `user_progress_user_lesson_unique` constraint (was a duplicate unique constraint alongside the UNIQUE constraint index). Required `ALTER TABLE DROP CONSTRAINT` not `DROP INDEX`.
  - Note: migration 000016 initially rolled back due to the index error (Supabase SQL Editor runs multi-statement SQL in a single transaction). Re-run of corrected migration applied all policy changes successfully.
- **Legacy tables dropped** — `public.attempts` and `public.purchases` (unused Supabase template tables flagged by advisor) confirmed empty and dropped.

---

## Session 10 changes (2026-03-05)

- **Security: Supabase API key rotation** — Legacy JWT-based `service_role` and `anon` keys replaced with Supabase's new API key model. New keys: `haven_netlify_functions` (Secret, replaces service_role) and `haven_frontend` (Publishable, replaces anon). All legacy JWT keys deactivated. Netlify env vars updated (`SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_KEY`). Frontend redeployed to bake in new anon key.
- **Security: test scripts removed from git** — `test-resit-flow.ts`, `test-ask-pippa.ts`, `test-email-reminders.ts`, `test-forgot-password.ts` were tracked in git despite `scripts/` being in `.gitignore`. They contained hardcoded service_role and anon keys. Removed from git tracking (`git rm --cached`); local copies updated to load all credentials from `.env` via `loadEnv()` (same pattern as `seed.ts`). Old key values in git history are now harmless (keys deactivated).
- **Bug fix: onboarding re-prompt on new devices** — `preloadOnboarding()` in `onboarding.ts` was only hydrating localStorage if `profile.onboarding_complete = true`. Users whose profile had `exam_date` set but the boolean unset (e.g. early users, silent upsert failure) would be re-prompted on every new device. Fixed: now also hydrates if `profile.exam_date` is non-null.
- **Bug fix: sidebar flash for logged-out users** — Navigating to `/content` or `/practice` while logged out briefly showed the study/practice sidebar before `RequireAuth` redirected to login. Fixed in `RootLayout.tsx`: `showStudySidebar` and `showPracticeSidebar` now also require `isLoggedIn` to be true. Since `onAuthStateChange` fires before the `contentReady` spinner resolves, logged-in users see no difference.
- **Bug fix: "Upgrade to Plus" showing for Premium account** — Root cause: Stripe `checkout.session.completed` webhook failed during key-rotation window, leaving `profiles.subscription_tier = null`. Fixed by running SQL: `UPDATE profiles SET subscription_tier = 'premium' WHERE id = (SELECT id FROM auth.users WHERE email = 'hello.haven.nz@gmail.com')`. Webhook verified working going forward.
- **Mobile nav overhaul** — Bottom nav (`MobileNav`) now always visible on all main app pages (study, practice, flashcards, exam, dashboard, profile, help, analytics). Items: Study | Practice | Flashcards | Exam | Dashboard. Pippa tab removed from bottom nav (Pippa has its own floating button).
- **Navbar avatar dropdown** — Hamburger menu removed. Replaced with teal initials circle that opens a dropdown: Profile, Dashboard, Analytics (Premium only), Help, Upgrade (if applicable), Sign Out. Closes on outside click and route change.
- **Pippa floating button** — Reverted to `MessageCircle` speech bubble icon. Positioned `bottom-24 right-4 md:bottom-6 md:right-6` to clear bottom nav on mobile. Hidden on `/exam`. Only renders when `tier === 'premium' && isLoggedIn`.
- **Help page back-to-top** — Moved to `bottom-40 right-4 md:bottom-24 md:right-6` to avoid overlap with Pippa button.
- **Landing page fixes** — "Start Learning Free" CTA now routes to `/signup` (was `/content` which showed "Welcome Back"). Added "Already have an account? Log in" link below hero CTAs.
- **Root redirect confirmed** — `https://havenstudy.app/` correctly 302-redirects to `/uk` via `netlify.toml`. Old keys in git history are no longer a concern (deactivated).

---

## Session 9 changes (2026-03-04)

- **Stripe auth header bug fixed** — `Paywall.tsx` was sending the JWT in the request body (`token:`) instead of the `Authorization: Bearer` header. This caused every checkout attempt to return 401, so Stripe was never reached. Fixed to match how `Dashboard.tsx` already does it.
- **Stripe live mode** — All 8 env vars updated in Netlify (live publishable key, secret key, webhook secret, Plus price ID, Premium price ID, 3 coupon IDs). Stripe webhook endpoint created in live mode. Checkout confirmed working end-to-end.
- **Sale/discount system** — Full site-wide sale toggle + promo code support:
  - Migration `000015_app_settings.sql` — `app_settings` table (public read, admin-write RLS). Default sale row: `{"active": false, "discount": 0}`. Applied ✅.
  - `create-checkout-session.ts` — reads sale state from Supabase at checkout time. If sale active, auto-applies Stripe coupon (`STRIPE_COUPON_10/20/30` env vars). If no sale, sets `allow_promotion_codes: true` so Stripe shows promo code field.
  - Admin portal → new **Settings tab** (6th tab) — toggle sale ON/OFF, pick discount level (10/20/30%). Saves to `app_settings` instantly.
  - `Paywall.tsx` — reads sale state on load. If active: amber banner "X% off — applied automatically", strikethrough original prices, discounted prices shown.
- **Stripe coupons created** — 10%, 20%, 30% off coupons in live mode. Promo codes: HAVEN10, HAVEN20, HAVEN30. 100% off coupon (30 uses) created for beta testers with promo code.
- **PWA install prompt** — Hidden on desktop (macOS/Windows). Now only shows on iOS and Android where "install to home screen" makes sense. Fix in `src/hooks/usePWAInstall.ts`.
- **Navbar avatar** — Replaced "Hi, name" text link with a teal initials circle on desktop (compact, no text). Mobile menu shows initials circle + name. Logic in `src/components/Navbar.tsx` (`getInitials` + `Avatar` helpers).

---

## Next session — tasks queued

### ✅ Stripe live mode — DONE
All env vars set, webhook live, coupons created, checkout confirmed working.
`STRIPE_SECRET_KEY` is a **restricted key** — permissions: Customers write, Checkout Sessions write, Billing Portal Sessions write, Subscriptions read, Coupons read.

### ✅ Security hardening — DONE (sessions 10–12)
- Legacy Supabase JWT keys (service_role + anon) deactivated
- New API keys in use: `haven_netlify_functions` (Secret) + `haven_frontend` (Publishable)
- Test scripts removed from git; all load creds from `.env`
- All Supabase security advisor warnings resolved
- All Supabase performance advisor warnings resolved
- Leaked password protection enabled in Supabase Auth settings
- **Anon data leak patched** — all sensitive RLS policies now `TO authenticated` (migration 000020)
- Verified via curl: anon → `[]` on all user tables; authenticated → own row only

### ✅ haven.study landing page — DONE (session 13)
Repo: `hellohavennz/haven-study-landing`. Live at `haven.study`. GSC verified + sitemap submitted.

### Pending — haven.study social accounts
Once Facebook, Instagram, X accounts are created:
1. Update 3 placeholder `href="#"` social links in `haven-study-landing/index.html`
2. Add `sameAs` back to the Organization schema in `haven-study-landing/index.html`
3. Push to deploy

### ✅ Supabase URL Configuration — DONE
Site URL and redirect URLs confirmed set correctly.

### ✅ Stripe webhook verification — DONE
Recent Deliveries confirmed showing 200s.

### Pending — Sentry activation
`@sentry/react` is installed and initialised. Just needs the DSN:
1. Sign up at sentry.io → New project → React → copy DSN
2. Netlify → Environment variables → add `VITE_SENTRY_DSN` = DSN value
3. Trigger redeploy

### Pending — Social accounts (this weekend)
Create Facebook, Instagram, X accounts for Haven Study. Then:
1. Update 3 placeholder `href="#"` social links in `haven-study-landing/index.html`
2. Add `sameAs` back to Organization schema in `haven-study-landing/index.html`
3. Push to deploy

### Pending — Content review (this weekend)
Grammar scan complete (563 questions + 574 flashcards). 6 issues fixed.
Remaining: manual factual accuracy review of all 29 lessons. Priority before paid marketing spend.

### Pending — Launch / marketing
See `MARKETING.md` for full plan.
