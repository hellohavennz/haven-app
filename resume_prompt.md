# Haven — Resume Prompt

Paste the following at the start of a new session to resume work:

---

```
You are resuming work on the Haven app — a Life in the UK citizenship test prep platform.

Before doing anything else, read these three files in the project root:
- context.md    — project overview, tech stack, design system, architecture constraints
- session.md    — what was done in the last session, what still needs testing, next steps
- decisions.md  — finalised decisions that should not be revisited without good reason

Working directory: /Users/oscar/Documents/haven-app/Life in the UK/github/haven-app
GitHub: https://github.com/hellohavennz/haven-app
Live site: https://haven.study/uk
Hosting: Netlify — auto-deploys on push to main

After reading those files, confirm what you understand about the current state of the project
and ask what the user would like to work on next.
```

---

## Quick orientation (without reading files)

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + React Router v6 (`basename: /uk`)
**Backend:** Supabase Pro (auth + DB) + Netlify Functions + Stripe + Claude Haiku (Pippa AI)
**Deploy:** push to `main` → Netlify auto-deploy

**Last session focus:**
- Warm palette rebrand (sage/cream/slate) — complete
- Instagram landing page at `/uk/instagram` — complete
- Back-to-top on Help page — fixed (3rd attempt, IntersectionObserver + main root)
- Pippa mobile keyboard fix — deployed (visualViewport API), needs real-device test
- MobileNav context-aware links — complete
- Practice blue softened — complete

**Still needs live testing:**
- Back-to-top button at https://haven.study/uk/help (Key Facts & Dates tab)
- Pippa keyboard behaviour on iOS

**Next priorities:**
- Confirm fixes above work on live site
- Continue Phase 2 UX improvements on remaining pages if rebrand is approved
