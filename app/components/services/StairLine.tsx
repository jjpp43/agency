"use client";

/**
 * The stair line — the services section's only graphic now that the
 * print-sheet backdrops are retired. One thin warm-ink stepped path that runs
 * under each step and drops to the next, with a small electric dot riding the
 * drawn tip. Dumb markup by design: the parent owns the draw (the desktop pin
 * syncs it to the cover-open windows; mobile scrubs it over the stack). The
 * measure helpers build the path in pixel space from the live step boxes, so
 * the line hugs the real text at any viewport and never strikes through copy.
 */

type Pt = { x: number; y: number };

export type StairMetrics = {
  /** SVG path data, in host pixel space. */
  d: string;
  /** Cumulative drawn length at the end of each step's window. */
  marks: number[];
  total: number;
};

function metrics(pts: Pt[], markIdx: number[]): StairMetrics {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum[i] =
      cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return {
    d: pts
      .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" "),
    marks: markIdx.map((i) => cum[i]),
    total: cum[pts.length - 1],
  };
}

/**
 * Desktop staircase: a tread under each step's block, dropping just short of
 * the next step's left edge (the drops live in the empty gutters, so they
 * never cross the copy); the last tread runs off toward the right margin.
 */
export function measureStair(
  stage: HTMLElement,
  steps: HTMLElement[],
): StairMetrics | null {
  if (steps.length < 3 || stage.clientWidth < 200) return null;
  const GAP = 20; // tread sits this far below a step's block
  const LEAD = 26; // drop lands this far left of the next step's text
  const y = steps.map((el) => el.offsetTop + el.offsetHeight + GAP);
  const drop = [steps[1].offsetLeft - LEAD, steps[2].offsetLeft - LEAD];
  return metrics(
    [
      { x: steps[0].offsetLeft + 2, y: y[0] },
      { x: drop[0], y: y[0] },
      { x: drop[0], y: y[1] },
      { x: drop[1], y: y[1] },
      { x: drop[1], y: y[2] },
      { x: stage.clientWidth * 0.96, y: y[2] },
    ],
    [1, 3, 5],
  );
}

/**
 * Mobile switchback: under each stacked step, then down whichever gutter is
 * free — the right margin after step one, the second step's indent (left of
 * the further-indented third step) after step two.
 */
export function measureSwitchback(
  host: HTMLElement,
  steps: HTMLElement[],
): StairMetrics | null {
  if (steps.length < 3 || host.clientWidth < 100) return null;
  const GAP = 12;
  const xR = host.clientWidth - 2;
  const xM = steps[1].offsetLeft + 2;
  const y = steps.map((el) => el.offsetTop + el.offsetHeight + GAP);
  return metrics(
    [
      { x: steps[0].offsetLeft + 2, y: y[0] },
      { x: xR, y: y[0] },
      { x: xR, y: y[1] },
      { x: xM, y: y[1] },
      { x: xM, y: y[2] },
      { x: xR, y: y[2] },
    ],
    [1, 3, 5],
  );
}

/** Paint a drawn-length onto the path (dash trick) and park the mark at the tip. */
export function applyDraw(
  path: SVGPathElement,
  dot: SVGGElement,
  m: StairMetrics,
  len: number,
) {
  const l = Math.max(0, Math.min(len, m.total));
  path.style.strokeDasharray = `${m.total}`;
  path.style.strokeDashoffset = `${m.total - l}`;
  const p = path.getPointAtLength(l);
  // a group, so it moves by transform rather than cx/cy
  dot.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  dot.style.opacity = "1";
}

export function StairLine({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={`overflow-visible ${className}`}>
      <path
        data-stair-path
        fill="none"
        stroke="var(--color-line-strong)"
        strokeWidth="1.25"
      />
      {/* The mark riding the drawn tip: an asterisk, drawn as three crossed
          strokes rather than a text glyph so it stays line-work like the rest
          of the section and keeps its weight at any size. Hidden until the
          first measure places it, so it never flashes at 0,0. */}
      <g
        data-stair-dot
        stroke="var(--color-electric)"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ opacity: 0 }}
      >
        <line x1="0" y1="-5" x2="0" y2="5" />
        <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" />
        <line x1="-4.33" y1="2.5" x2="4.33" y2="-2.5" />
      </g>
    </svg>
  );
}
