# Footnote — design system

The site for a web studio should feel like the best thing they've built. The
direction is **kinetic editorial**: award-site energy, deliberately *not* SaaS.
Bone paper, warm ink, a single electric-blue accent, oversized grotesque type,
generous whitespace, hairline rules, and heavy-but-purposeful motion.

All tokens live in `app/globals.css` under `@theme` (Tailwind v4). Use the
tokens in components — don't hardcode hex.

---

## Vibe

- **Editorial, confident, tactile.** Big type does the talking; color is used
  sparingly. Structure is exposed (mono eyebrows, indexes, hairlines).
- **Anti-template.** Avoid the dark-glass-gradient SaaS look and the
  cream-serif-terracotta cliché. Sharp corners, flat surfaces, one accent.
- **Motion as craft.** The page loads with an intro, reveals on scroll, skews
  with scroll velocity, pins and scrolls sideways. Motion is the signature —
  but always restrained and always with a reduced-motion fallback.

---

## Colors

Warm, paper-based neutrals + one electric accent. (Token → hex → use.)

| Token | Hex | Use |
|---|---|---|
| `bone` | `#ece8e1` | Page background (the default canvas). |
| `paper` | `#f4f1ea` | Slightly lighter surface; text/fills on dark sections. |
| `ink` | `#141310` | Primary text; dark section backgrounds (CTA, footer, cards). |
| `ink-soft` | `#34322c` | Secondary body copy on light. |
| `muted` | `#6b675e` | Supporting text, captions. |
| `faint` | `#9c988e` | Tertiary text, disabled, mono meta. |
| `electric` | `#2b2bf5` | The one accent — links, active state, punctuation dot, hovers, cursor hover ring, hero dot-cloud scatter tint. Use sparingly. |
| `electric-ink` | `#1414c9` | Darker electric for tight contrast needs. |
| `line` | `rgba(20,19,16,.14)` | Hairline borders/dividers. |
| `line-strong` | `rgba(20,19,16,.28)` | Stronger hairlines, inputs. |

**Rules of thumb**
- Light sections = `bone`/`paper` bg, `ink` text. Dark sections = `ink` bg,
  `paper` text. Alternate them for rhythm (hero light → CTA/footer dark).
- Electric is a spotlight, not a fill. A single word, a `.` after a headline, a
  hover wash, the active marker — not whole surfaces (project panels excepted).
- On dark surfaces derive hairlines/fills from `currentColor` with
  `color-mix(... transparent)` so they adapt (see `WorkGallery` cards).

---

## Fonts

Three self-hosted **variable** fonts (`next/font/local`, files in `app/fonts/`,
wired in `app/layout.tsx`). No Google Fonts fetch at build time.

| Role | Family | CSS var / class | Notes |
|---|---|---|---|
| **Display** | **Bricolage Grotesque** | `--font-display` / `font-display` | Headlines, oversized type, project names. Characterful grotesque — the personality of the page. Weights 200–800. |
| **Body** | **Inter** | `--font-sans` / `font-sans` (default) | Paragraphs, UI text. Weight axis 100–900. |
| **Mono** | **JetBrains Mono** | `--font-mono` / `font-mono` | Eyebrows, labels, indexes, meta, URL bars, "live" ticks. The editorial connective tissue. |

> `SpaceGrotesk-Variable.woff2` is still in `app/fonts/` but **unused** (display
> switched to Bricolage). Safe to delete.

**Type treatment**
- Display headlines: `font-display`, `font-semibold`, tight tracking
  (`-0.03em` to `-0.05em`), short line-height (`0.86`–`0.98`). Often `uppercase`
  for the mega statements (hero, CTA). Sized with `clamp()` for fluid scale.
- Mono labels: `font-mono`, `text-[11–13px]`, `uppercase`, `tracking-[0.08–
  0.14em]`. Frequently bracketed/indexed via `<Eyebrow>` → `[ 03 ] SELECTED WORK`.
- Body: `text-[16–20px]`, `leading-[1.5–1.6]`, `text-muted`/`ink-soft`.

**Type scale tokens** (`--text-*`): `caption 12 · body-sm 14 · body 16 ·
lead 20 · heading-sm 30 · heading 52 · display 92 · mega 168`. In practice
big headings use `clamp()`/arbitrary sizes rather than the fixed tokens.

Radii are intentionally **sharp**: `sm 3 · md 6 · lg 12 · pill 9999`. Cards use
`rounded-lg`; buttons/pills use `rounded-pill`; most dividers/blocks are square.

---

## Custom utilities (globals.css)

- `text-electric` — accent color helper.
- `text-outline` — stroke-only display text (`-webkit-text-stroke` in ink).
- `bg-grid` — faint blueprint grid (72px). Used behind hero / dark CTA.
- `bg-dots` — radial dot field.
- `reveal-hidden` — `visibility:hidden` guard for split-text targets before GSAP
  runs; auto-shown under reduced motion.
- `--animate-marquee` / `--animate-marquee-rev` — infinite marquee keyframes.

---

## Components

### Global chrome (mounted once in `layout.tsx`)
- **`Intro`** — first-load reveal: ink curtain with a `000→100` counter and the
  wordmark building, then panels wipe up. Runs once per session; broadcasts
  `fn:intro-done` (the hero waits on it). Skipped under reduced motion.
- **`Cursor`** — bespoke cursor: ink dot + lagging ring. Over `[data-cursor="…"]`
  / links / buttons the ring swells to a **hollow electric outline** with the
  label inside — outline-only so it never covers what you're about to click.
  Flips to `paper` over `[data-cursor-dark]` surfaces. Off on touch + reduced
  motion (native cursor hidden on fine pointers via `globals.css`).
- **`SmoothScroll`** — Lenis, synced to GSAP ScrollTrigger; smooth anchor jumps.
- **`booking/`** — `BookingModalProvider` (context + scroll lock),
  `BookingButton` (the "Start a project" trigger; `magnetic` is an opt-in prop,
  currently unused), `BookingModal` (project-inquiry form).

### Sections (`app/page.tsx` order)
1. **`Header`** — fixed; wordmark `Footnote[1]`, mono nav, "Start a project".
   Transparent → bone/blur on scroll.
2. **`Hero`** — full-viewport statement (`WEBSITES / WORTH / BUILDING.`) revealed
   line-by-line after the intro, wrapped in `SkewOnScroll`; mono meta row
   (`● Live`); a WebGL **`HeroParticles`** dot-cloud (laptop ⇄ globe morph)
   filling the empty right half on `lg`+; a dark services **`Marquee`** at the
   bottom.
3. **`Engines`** — static "modern web stack" strip (Next.js, React, …).
4. **`Stats`** — four big numerals that count up on scroll.
5. **`Services`** — interactive selector list (Design / Development / SEO &
   Performance / Brand) + a bordered detail panel that cross-fades.
6. **`WorkGallery`** — pinned **horizontal scroll** of project cards, each a
   browser-framed live-site preview (chrome + screenshot + meta footer, links
   out). Degrades to a swipeable row on mobile. Data = `PROJECTS`.
7. **`Process`** — pinned, scroll-scrubbed step-through (Discovery → Launch)
   with a filling spine. Degrades to a stacked editorial list.
8. **`FAQ`** — hairline accordion.
9. **`CTASection`** — dark ink block, mega "LET'S BUILD SOMETHING WORTH
   VISITING." + inquiry CTA.
10. **`Footer`** — dark; link columns + an oversized `Footnote[1]` wordmark.

### Primitives
- **`Eyebrow`** (`ui/primitives.tsx`) — the indexed mono label, `[ 03 ] LABEL`.
- **`Buttons`** — `PillButton` (ink → electric wash), `GhostButton` (outline →
  ink), `TextLink`. `BookingButton` variants: `default` / `ghost` / `light`.

---

## Motion system (GSAP + Lenis)

Reusable primitives in `app/components/gsap/`:

- **`Reveal`** — fade/lift on scroll-in; `stagger` animates children.
- **`SplitReveal`** — headline reveal via SplitText line/word masks
  (`yPercent` wipe from below). Guards with `reveal-hidden`.
- **`Scramble`** — decodes text into place (ScrambleText) on scroll-in.
- **`Magnetic`** — pulls a target toward the cursor on hover (springs back).
- **`Kinetic`** → **`SkewOnScroll`** (skews content by scroll velocity — the
  kinetic signature) and **`Marquee`** (infinite band, electric-diamond
  separators).

Also used inline: **count-up** (`Stats`), **pinned scrub** (`Process`,
`WorkGallery` via `gsap.matchMedia` + ScrollTrigger `pin`), **velocity skew**,
**intro timeline**.

### WebGL point-cloud — `hero/HeroParticles.tsx`

The only WebGL on the site (three.js + `@react-three/fiber`). ~7k dots that
loop **laptop → scatter → globe → scatter → laptop**: ink dots that flash
`electric` while dispersed mid-morph. A custom vertex shader `mix()`es each
particle between its laptop and globe positions (globe = fibonacci sphere;
laptop = two boxes surface-sampled) with a `sin(progress·π)` scatter blowout;
the fragment shader draws soft round dots and tints them electric by scatter
amount. Notes for anyone touching it:

- **Progress is clock-driven in `useFrame`, not GSAP** — a linear 0→1 ramp with
  holds — and written to the **live material via ref** (`materialRef.current
  .uniforms`), *not* the memoized `uniforms` prop, whose identity can diverge
  from the committed material under React StrictMode.
- **Deferred + client-only:** `dynamic(…, { ssr:false })`, mounted after first
  paint so three never blocks the headline's LCP.
- **Accessible:** hidden below `lg` (perf + space); under reduced motion it
  freezes to a static globe (no loop, no rotation).
- Importing R3F augments the global JSX namespace — see the "three / R3F
  caveat" in `CLAUDE.md` if the polymorphic helpers start erroring.

**Non-negotiables**
- Every effect respects `prefers-reduced-motion` (early-return to a static,
  visible state) — GSAP ignores the CSS media query, so check it in JS.
- Pinned / horizontal / velocity effects are gated behind
  `(min-width:…) and (prefers-reduced-motion: no-preference)` via
  `gsap.matchMedia`, with a stacked fallback rendered for the other case
  (toggled with `motion-safe:` / `motion-reduce:` variants).
- Keep it purposeful. One orchestrated moment beats scattered effects; extra
  animation is what makes a page feel AI-generated.

---

## Adding to it

- **New section:** plain component; wrap headings in `SplitReveal`, blocks in
  `Reveal`; add an `<Eyebrow index="0X">`; alternate light/dark for rhythm; tag
  dark roots with `data-cursor-dark`.
- **New project:** add to `PROJECTS` in `WorkGallery.tsx` (`url`, `image` under
  `public/`, optional `imagePosition`).
- **New color/font/token:** add under `@theme` in `globals.css`; never hardcode.
