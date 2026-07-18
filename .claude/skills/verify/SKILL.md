---
name: verify
description: Build, run, and visually verify this site (Next.js + GSAP marketing page) with headless Chrome screenshots
---

# Verifying changes to the Footnote site

Motion/layout changes only show up in a real browser — drive it, don't trust
the diff (see CLAUDE.md "Verify visually").

## Build & run

```bash
npm run build                # Next 16 / Turbopack, ~30s
npm run start -- -p 3123     # background it; kill with: lsof -ti :3123 | xargs kill
```

## Drive with puppeteer-core

`puppeteer-core` is in devDependencies; point it at desktop Chrome:
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

ESM scripts outside the repo can't resolve `puppeteer-core` via NODE_PATH —
either run the script from the repo root or `ln -s <repo>/node_modules` next
to it.

Gotchas that matter here:

- **Wait ~3.5s after `goto`** — the `<Intro>` first-load reveal has to finish
  before anything is interactable/visible.
- **Scroll programmatically** with `window.scrollTo(0, y)` (works fine under
  Lenis), then wait ~1.4s for scrubbed ScrollTriggers (scrub 0.6) to catch up
  before screenshotting.
- **Pinned sections**: pin length is in the trigger's `end` (e.g. Services is
  `"+=300%"` → 3 viewport-heights of scroll). Progress p lives at
  `sectionTop + p * 3 * viewportHeight`.
- **Reduced motion**: `page.emulateMediaFeatures([{ name:
  "prefers-reduced-motion", value: "reduce" }])` before `goto`.
- **Resize probes**: when measuring pinned content after a viewport change,
  remember ScrollTrigger only fixes the pin's inline size on `refresh` —
  measurements taken at `refreshInit` are stale.
- Attach `page.on("pageerror", ...)` — GSAP errors are silent otherwise.

Check desktop (1440×900), mobile (390×844), and reduced-motion variants of
whatever section changed, at several scroll stops.
