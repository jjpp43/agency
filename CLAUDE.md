@AGENTS.md

# Footnote — project overview

Marketing site for **Footnote**, a web design & development studio ("we design
& build websites with a point of view"). A single-page, heavily-animated
showcase whose job is to *be* the portfolio — the site itself is the proof of
craft. Kinetic-editorial art direction: bone paper, warm ink, one electric-blue
accent, oversized grotesque type, custom cursor, GSAP motion throughout.

> The full design system — theme, colors, fonts, components, motion — lives in
> **[design.md](./design.md)**. Read it before touching anything visual.

## Stack

- **Next.js 16** (App Router, Turbopack) — see `AGENTS.md`; read the bundled docs
  in `node_modules/next/dist/docs/` before writing Next-specific code.
- **React 19**, **TypeScript**, **Tailwind CSS v4** (config-less; theme tokens
  live in `app/globals.css` under `@theme`).
- **GSAP 3.15** + `@gsap/react` (`useGSAP`) — primary animation engine
  (ScrollTrigger, SplitText, ScrambleText, Observer, Draggable all available).
- **Lenis** — smooth scroll, synced to ScrollTrigger.
- **three.js + `@react-three/fiber`** — WebGL, used **only** for the hero
  point-cloud (`HeroParticles`): a shader-morphed dot cloud (laptop ⇄ globe).
  Loaded via `dynamic(…, { ssr:false })` so three stays out of the initial
  bundle and off the server. No drei (uses three's `MeshSurfaceSampler` direct).
- **motion** (Framer Motion) — used only for a few AnimatePresence bits
  (header menu, FAQ accordion, booking modal).
- **@polar-sh/nextjs** — checkout on the pricing page.
- Fonts are **self-hosted** (`next/font/local`, files in `app/fonts/`) — no
  build-time Google Fonts fetch. See design.md.

## Structure

- `app/page.tsx` — the home page: `Hero → Engines → Stats → Services →
  WorkGallery → Process → FAQ → CTASection`, wrapped by `Header` / `Footer`.
- `app/layout.tsx` — fonts, metadata, and the global chrome mounted once:
  `<Intro>` (first-load reveal), `<Cursor>` (custom cursor), `<SmoothScroll>`
  (Lenis), `<BookingModalProvider>`.
- `app/components/` — one file per section, plus:
  - `gsap/` — reusable motion primitives (`Reveal`, `SplitReveal`, `Scramble`,
    `Magnetic`, `Kinetic` → `SkewOnScroll` + `Marquee`).
  - `hero/HeroParticles.tsx` — the R3F canvas + custom shader for the hero
    dot-cloud (the only WebGL on the site).
  - `booking/` — the "Start a project" modal + provider/trigger.
  - `ui/primitives.tsx` — the `Eyebrow` label.
- `app/payment/` — pricing page + Polar `success` page + `api/checkout` route.
- `public/` — work screenshots (e.g. `datacenters.jpeg`, `work/oval.jpg`).

## Conventions

- **Client vs server:** anything using GSAP/`useGSAP`, hooks, or browser APIs is
  a Client Component (`"use client"`). Sections are otherwise plain.
- **Styling:** Tailwind utilities + the `@theme` tokens (`bg-bone`, `text-ink`,
  `text-electric`, `font-display`, `font-mono`, `border-line`, …). Avoid raw hex
  in components — use the tokens. Custom utilities: `bg-grid`, `bg-dots`,
  `text-outline`, `text-electric`.
- **Motion is accessible:** every GSAP effect checks
  `prefers-reduced-motion: reduce` (or uses `gsap.matchMedia`) and falls back to
  a static, fully-visible state. Pinned/horizontal-scroll sections degrade to
  stacked layouts. Keep this contract when adding motion.
- **Custom cursor:** the native cursor is hidden on fine pointers. Mark dark
  surfaces with `data-cursor-dark` so the cursor flips to a light color; use
  `data-cursor="Label"` to set a hover label. Over links/buttons the ring
  swells to an **electric outline whose disc inverts the page beneath it**
  (`backdrop-filter`, not `mix-blend-mode` — the cursor's own z-index makes a
  stacking context that would neuter a blend).
- **three / R3F caveat:** importing `@react-three/fiber` globally augments
  `React.JSX.IntrinsicElements`, which collapses the `children` of the
  polymorphic `as`/`ElementType` helpers (`Reveal`, `SplitReveal`, `Scramble`)
  to `never`. They cast the tag to a concrete `ComponentType<{…}>` to work
  around it — keep that pattern. And drive R3F uniforms via a **material ref**
  in `useFrame`, not the memoized `uniforms` prop object, whose identity can
  diverge from the live material under React StrictMode.
- **Adding work:** edit `PROJECTS` in `WorkGallery.tsx` — set `url` (live site,
  drives the link + chrome domain) and `image` (`/…` under `public/`), plus
  `imagePosition: "center"` for non-page-top compositions.
- **Verify visually.** After UI changes, build and drive the app in a browser
  (headless Chrome screenshots) rather than trusting the diff — motion and
  layout bugs don't show up in a typecheck.
