# Haven — Finalised Decisions
_Last updated: 2026-03-02_

These are decisions that have been made, implemented, and deployed. They should not be revisited without good reason.

---

## Design system

### Colour palette
Tailwind's default `teal`, `amber`, and `slate` palettes are overridden in `tailwind.config.js`.

| Token | Hex | Use |
|---|---|---|
| `teal-600` | `#4E8571` | Primary CTA, buttons, active states, progress fills |
| `teal-500` | `#5F9D86` | Hover states, lighter accents |
| `teal-50` | `#F4F7F5` | Light backgrounds, card tints |
| `amber-500` | `#C9973F` | Premium tier accent, gold highlights |
| `amber-200` | `#EED7A8` | Premium card borders |
| `slate-900` | `#17201E` | All body text and headings (warm near-black) |
| `slate-600` | `#4F5F5B` | Secondary/muted text |
| `slate-200` | `#DDE5E2` | Borders, dividers |
| `blue-600` | `#3C5DB5` | Practice section ONLY — muted periwinkle |
| `cream` | `#FAF7F2` | Page background (light mode) |

**Rule:** `slate-*` is a custom warm green-grey override — NOT Tailwind's default blue-grey. The `dark:` variants intentionally use the default Tailwind `gray-950` / `gray-900` etc. (not overridden).

### Typography
- **Headings:** Montserrat, weights 600 + 700
- **Body/UI:** Source Sans 3, weights 400 + 600 + 700
- Both loaded via Google Fonts in `index.html`
- CSS variables in `src/index.css`: `--font-heading`, `--font-body`, `--font-ui`
- Tailwind `fontFamily.heading`, `fontFamily.body`, `fontFamily.ui`, `fontFamily.sans` all configured

### Practice section is distinctly blue
The Practice section uses `blue-*` classes throughout `PracticeIndex.tsx` and `PracticeSidebar.tsx` to differentiate it from the sage-teal used everywhere else. Final blue: `#3C5DB5` (muted periwinkle, not saturated royal blue).

### No gradients on cards
Cards and action items use flat `bg-white border border-slate-200` — not `bg-gradient-to-br`. Gradients are reserved for hero sections, the Pippa button, and the Pippa header only.

### Gray → Slate migration complete
All light-mode `gray-*` Tailwind classes have been replaced with `slate-*` equivalents. `dark:gray-*` classes are intentionally preserved.

---

## Architecture

### Scroll container is `<main>`, not `window`
`RootLayout` wraps all content in `<main className="flex-1 overflow-y-auto">`. `window.scrollY` is always 0. Any scroll detection must use:
- `IntersectionObserver` with `root: document.querySelector('main')`
- Or `document.querySelector('main').addEventListener('scroll', ...)`
- Scroll-to-top actions: `document.querySelector('main')?.scrollTo({ top: 0 })`

### Pippa mobile keyboard — visualViewport
The `AskPippa` component uses `window.visualViewport` API to resize the mobile panel when the keyboard opens. This is the only reliable way to handle iOS Safari keyboard behaviour with `position: fixed` elements. `100dvh` / `100vh` are not sufficient.

### MobileNav context-aware
The bottom MobileNav extracts a `lessonId` from the current URL path via regex and builds context-aware links for Practice and Flashcards. This means navigating from any lesson-specific page takes the user to that lesson's practice/flashcards rather than the index.

---

## Pricing (source of truth)

| Tier | Price | Billing |
|---|---|---|
| Free | £0 | Forever |
| Haven Plus | £4.99 | Monthly |
| Haven Premium | £24.99 | Every 6 months |

This is reflected in `index.html` schema.org markup, `src/App.tsx`, `src/pages/Paywall.tsx`, and `src/pages/Instagram.tsx`.

---

## Content counts (marketing copy)

- 29 lessons
- 590+ practice questions
- 610+ flashcards
- 5 modules
- 95% pass rate (Haven users vs 68.5% national average)

---

## Routes

All routes under `/uk` basename. Public routes do not require auth. Protected routes redirect to `/login`.

Key public routes: `/`, `/login`, `/signup`, `/help`, `/paywall`, `/instagram`, `/privacy`, `/terms`
Key protected routes: `/dashboard`, `/content`, `/practice`, `/exam`, `/profile`, `/analytics` (Premium), `/admin` (admin email only)

---

## Rollback

Git tag `pre-design-v2` points to commit `07ea806` — the state before the design system rebrand. To roll back:
```bash
git reset --hard pre-design-v2
git push --force-with-lease origin main
```
See `ROLLBACK.md` for full instructions.
