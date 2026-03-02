# Haven — Project Context
_Last updated: 2026-03-02_

---

## What it is

Haven is a Life in the UK citizenship test prep app. Users study content, do practice questions, complete flashcard sessions, and take mock exams to prepare for the official test. It targets immigrants in the UK seeking British citizenship.

**Live URL:** https://haven.study/uk
**GitHub:** https://github.com/hellohavennz/haven-app
**Hosting:** Netlify (auto-deploys on push to `main`)
**Router basename:** `/uk` — all app routes live under `/uk/*`

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 (custom palette, dark mode via `dark:` classes) |
| Routing | React Router v6, `basename: '/uk'` |
| Backend / DB | Supabase Pro (PostgreSQL + RLS + Auth) |
| Auth domain | `auth.havenstudy.app` (custom Supabase domain) |
| Serverless | Netlify Functions (`netlify/functions/`) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) — powers Pippa AI assistant |
| PWA | vite-plugin-pwa + Workbox — offline study, precaches content |

---

## Subscription tiers

| Tier | Price | Key features |
|---|---|---|
| Free | £0 | 2 modules, 5 flashcards/session |
| Haven Plus | £4.99/month | All 29 lessons, 590+ questions, 610+ flashcards, 2 mock exams/mo, resit support |
| Haven Premium | £24.99/6 months | Everything in Plus + Pippa AI, analytics, unlimited exams, offline, priority support |

---

## Brand & design system

**Aesthetic:** Calm, warm, focused. Not clinical. Not loud. The app should feel like a trusted study companion.

**Colour palette (Tailwind overrides in `tailwind.config.js`):**

| Name | Role | Key hex |
|---|---|---|
| `teal-600` | Primary brand — sage green | `#4E8571` |
| `teal-500` | Lighter sage | `#5F9D86` |
| `amber-500` | Premium/accent gold | `#C9973F` |
| `slate-900` | Body text, headings | `#17201E` |
| `slate-600` | Secondary text | `#4F5F5B` |
| `slate-200` | Borders, dividers | `#DDE5E2` |
| `blue-600` | Practice section only | `#3C5DB5` (muted periwinkle) |
| `cream` | Page background (light) | `#FAF7F2` |

Slate is a custom warm green-grey override (NOT Tailwind default blue-grey slate).
Dark mode: uses `gray-950` / `gray-900` etc. — these are intentionally preserved as Tailwind defaults.

**Typography:**
- Headings: Montserrat (weights 600, 700) — loaded via Google Fonts
- Body + UI: Source Sans 3 (weights 400, 600, 700) — loaded via Google Fonts
- CSS variables: `--font-heading`, `--font-body`, `--font-ui` in `src/index.css`

---

## Layout architecture

```
div.h-screen.flex-col            ← outer viewport (no document scroll)
  Navbar                         ← sticky top (desktop)
  div.flex-1.min-h-0
    aside (sidebar, if any)      ← content/practice pages only
    main.flex-1.overflow-y-auto  ← ALL scrolling happens here (not window)
      div (content wrapper)
        <Outlet />               ← page content renders here
      footer
  AskPippa                       ← Premium only, fixed floating
  MobileNav                      ← bottom nav, sidebar pages only
```

**Critical:** The scroll container is `<main>`, not `window`. `window.scrollY` is always 0.
Any scroll-detection code must target `document.querySelector('main')` or use `IntersectionObserver` with `root: document.querySelector('main')`.

---

## Key files

| What | Path |
|---|---|
| Routes | `src/main.tsx` |
| App shell | `src/layouts/RootLayout.tsx` |
| Landing page | `src/App.tsx` |
| Tailwind config | `tailwind.config.js` |
| Global CSS + fonts | `src/index.css` |
| Subscription hook | `src/lib/subscription.ts` |
| Pippa AI widget | `src/components/AskPippa.tsx` |
| Mobile bottom nav | `src/components/navigation/MobileNav.tsx` |
| Admin portal | `src/pages/Admin.tsx` |
| Instagram landing | `src/pages/Instagram.tsx` → `/uk/instagram` |
| Handoff notes | `HANDOFF.md` |
| Rollback tag | git tag `pre-design-v2` at commit `07ea806` |

---

## Content

- 29 lessons across 5 modules
- 590+ practice questions
- 610+ flashcards
- All content stored in Supabase, loaded via `src/lib/content.ts`
- 5 modules: Values & Principles, What is the UK, A Long History, A Modern Society, Government/Law/Your Role

---

## Constraints

- Never break existing routes (`/uk/*` basename)
- Preserve all `dark:` Tailwind variants — dark mode must keep working
- Do not touch Supabase schema without a migration file
- Admin email hardcoded: `hello.haven.nz@gmail.com`
- Stripe test vs live mode — test customers don't exist in live Stripe (known issue, deferred)
- PWA service worker precaching — `npm run build` must succeed cleanly
