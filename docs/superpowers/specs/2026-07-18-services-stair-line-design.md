# Services stair-line reveal — design

**Date:** 2026-07-18
**Section:** `app/components/Services.tsx` (+ `app/components/services/`)

## Goal

Replace the Services section's canvas graphics with a single stair-like line
that draws in segment-by-segment, in sync with each step's reveal. The line is
the section's only graphic: a thin warm-ink stepped path with a small electric
dot riding its leading tip.

## Removals

- Delete `app/components/services/LivingSheet.tsx` (desktop canvas backdrop).
- Delete `app/components/services/PrintMarks.tsx` (mobile halftone backdrop).
- Delete the untracked leftovers `app/components/services/AtlasGhost.tsx` and
  `app/components/services/atlas-dots.json` (unused elsewhere — verify with a
  grep before deleting).
- Remove the `progressRef` plumbing in `Services.tsx` that existed only to feed
  `LivingSheet` (the ScrollTrigger `onUpdate` callback and the ref itself).

## Desktop stair line

- A new client component, `app/components/services/StairLine.tsx`, renders one
  SVG absolutely positioned over the pinned stage (`aria-hidden`,
  `pointer-events-none`), containing:
  - A single stepped `<path>`: horizontal run under step 01's word → vertical
    drop → horizontal run under step 02 → vertical drop → horizontal run under
    step 03. Path coordinates mirror the `POS` staircase percentages so each
    run underlines its step.
  - A small `<circle>` in electric (`#2b2bf5` via the theme token /
    `currentColor` pattern) that sits at the drawn tip of the path.
- Stroke: 1px (non-scaling stroke), warm ink at partial opacity — quiet behind
  text, consistent with the site's hairline borders.
- The SVG uses a `viewBox` with `preserveAspectRatio="none"` stretched to the
  stage. Dash lengths come from `getTotalLength()` and are recomputed on
  ScrollTrigger refresh (`invalidateOnRefresh` is already set), so resizes
  don't desync the draw. Because `preserveAspectRatio="none"` makes on-screen
  arc-length nonlinear in path space, the dot's position is taken from
  `getPointAtLength()` in viewBox space and mapped through the same stretch,
  which keeps it glued to the visible tip.

## Sync with the step reveals

- No new ScrollTrigger. The draw tweens are added to the existing pinned scrub
  timeline in `Services.tsx`:
  - Segment 1 (run under 01) draws during step 01's cover-open window.
  - Drop 1 + segment 2 draw during step 02's window.
  - Drop 2 + segment 3 draw during step 03's window.
- Implemented as one `stroke-dashoffset` tween per window (three tweens over
  the same path, each ending at the cumulative length for that step), placed at
  the same timeline positions (`i * 1.05`) as the cover-open tweens.
- The dot's position updates in each tween's `onUpdate` from the current drawn
  length; it parks at the path's end once the line is fully drawn.
- The cover-open step animation (rotateY hinge + body rise) is unchanged.

## Mobile

- The stacked layout keeps its `Reveal`-based step entrances. Behind the
  stacked steps, a slim vertical connector line (same `StairLine` idea, but a
  simple top-to-bottom stepped path following the `ml-[8%]`/`ml-[16%]`
  indents) draws in with a lightweight non-pinned scrub
  (`scrollTrigger: { scrub: true }` over the list's height).
- Same ink stroke + electric tip dot as desktop.

## Reduced motion / degradation

- `prefers-reduced-motion: reduce` (any width): the path renders fully drawn
  (no dash setup), dot parked at the end. No tweens, no rAF.
- Matches the site-wide contract: static, fully visible fallback.

## Testing / verification

- Typecheck + build.
- Visual verification in headless Chrome per project convention: scroll the
  pinned section at several progress points (0%, ~33%, ~66%, 100%) and confirm
  the line tip tracks the revealing step; check mobile width and
  reduced-motion emulation.
