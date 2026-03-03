# Haven — Life in the UK Test Prep

A calm, guided study platform for the UK citizenship test. Covers all 29 official lessons with practice questions, flashcards, mock exams, and an AI study assistant (Pippa).

**Live:** https://havenstudy.app/uk

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (dark mode via `dark:` classes) |
| Routing | React Router v6 (`basename: '/uk'`) |
| Backend / DB | Supabase Pro (PostgreSQL + RLS + Auth) |
| Serverless | Netlify Functions (TypeScript) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| AI | Anthropic Claude Haiku — powers Pippa AI assistant |
| PWA | vite-plugin-pwa + Workbox |
| Hosting | Netlify (auto-deploys on push to `main`) |

---

## Subscription tiers

| | Free | Plus (£4.99/mo) | Premium (£24.99/6 mo) |
|---|---|---|---|
| Lessons | 2 modules | All 29 | All 29 |
| Practice questions | Free modules | 500+ | 500+ |
| Flashcards | 5/session | All | All |
| Mock exams | — | 2/month | 2/month |
| Pippa AI | — | — | ✅ |
| Offline access | — | — | ✅ |

---

## Development

```bash
npm install
npm run dev          # http://localhost:5173/uk/
```

Netlify Functions run locally via `netlify dev` (requires Netlify CLI).

### Environment variables

Copy `.env.example` → `.env` and fill in:

```
VITE_SUPABASE_URL
VITE_SUPABASE_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PLUS_PRICE_ID
STRIPE_PREMIUM_PRICE_ID
ANTHROPIC_API_KEY
RESEND_API_KEY
```

---

## Key directories

```
src/
  App.tsx               — marketing homepage
  main.tsx              — all route definitions
  layouts/RootLayout    — app shell
  pages/                — route-level page components
  components/           — shared UI components
  lib/                  — Supabase, auth, content, subscription hooks
netlify/functions/      — serverless functions (Stripe, Pippa, email)
supabase/migrations/    — database migrations
scripts/                — E2E test scripts (npx tsx scripts/*.ts)
public/haven-icons/     — PWA icons + OG image
```

---

## Content

All lesson content (29 lessons, 500+ questions, flashcards) is stored in Supabase. See `HANDOFF.md` for full architecture details and `CONTEXT_FOR_CONTENT_CREATION.md` for the Supabase content schema.

---

## Admin portal

Accessible at `/uk/admin` to `hello.haven.nz@gmail.com` only. Five tabs: Overview (DAU/WAU/MAU, MRR chart), Reports (content flag triage), Users (freeze/delete), Exams (pass rate, recent attempts), Resit (approve/reject resit claims).
