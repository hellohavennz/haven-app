# Rollback Guide

## Rollback points

| Tag | Commit | Description |
|-----|--------|-------------|
| `pre-design-v2` | `07ea806` | Before design system Phase 1 + Phase 2 changes |

---

## How to rollback

### Option 1 — Full rollback (recommended if things are broken)

Reset your local branch to the tagged commit and push:

```bash
git checkout main
git reset --hard pre-design-v2
git push --force-with-lease origin main
```

This will revert all files AND push to GitHub, triggering a Netlify redeploy.

---

### Option 2 — Preview what changed since the tag

```bash
git diff pre-design-v2..HEAD --stat
```

---

### Option 3 — Rollback a single file

```bash
git checkout pre-design-v2 -- path/to/file.tsx
```

For example, to revert only the tailwind config:

```bash
git checkout pre-design-v2 -- tailwind.config.js
```

---

### Option 4 — Revert specific commits

```bash
git log --oneline pre-design-v2..HEAD   # see what commits were added
git revert <commit-hash>                # revert one commit
```

---

## Netlify note

Netlify auto-deploys on every push to `main`. After any rollback push, a new production build triggers automatically. You can also trigger a manual deploy from the Netlify dashboard.

---

## Colour rollback values (pre-design-v2 palette)

```
# tailwind.config.js — values at pre-design-v2 tag

teal-500: #7B9E87  (sage green)
amber-500: #C8A96E (warm gold)
cream: #FBF8F3

Headings font: Montserrat (600, 700)
Body font: Source Sans 3 (400, 600, 700)
```
