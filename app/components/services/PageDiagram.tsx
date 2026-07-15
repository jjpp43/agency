/**
 * The page the services act on, drawn as a hairline diagram.
 *
 * Deliberately NOT browser-framed: `WorkGallery` already owns the browser
 * chrome, so this is a page, not a window.
 *
 * Every region is keyed by the same number as the footnote that names it, so a
 * marker means one thing in three places at once — the noun in the card's
 * prose, the note under the rule, and the part of the page here. The regions a
 * service does not touch stay in hairline grey.
 */

export type Region =
  | "meta"
  | "logo"
  | "nav"
  | "hero"
  | "lead"
  | "media"
  | "grid"
  | "foot";

export type Note = {
  text: string;
  /** Which part of the page this note points at. */
  region: Region;
};

/**
 * Vertical centre of each region, in viewBox units — the marker for a region
 * sits at this height in the right margin. Any two regions keyed by the same
 * service must stay far enough apart here that their markers don't collide.
 */
const REGION_Y: Record<Region, number> = {
  meta: 16,
  logo: 61,
  nav: 60,
  hero: 106,
  lead: 142,
  media: 186,
  grid: 238,
  foot: 272,
};

const HAIRLINE = "var(--color-line)";
const OFF = "var(--color-line-strong)";
const ON = "var(--color-electric)";

const EASE = "transition-[fill,stroke] duration-500 ease-out";

export function PageDiagram({ notes }: { notes: Note[] }) {
  // region -> footnote number
  const keyed = new Map<Region, number>(
    notes.map((n, i) => [n.region, i + 1]),
  );
  const lit = (r: Region) => keyed.has(r);
  const fill = (r: Region) => (lit(r) ? ON : OFF);
  const line = (r: Region) => (lit(r) ? ON : OFF);

  return (
    <svg
      viewBox="0 0 460 300"
      // The card's notes already say all of this in words.
      aria-hidden
      className="w-full"
    >
      {/* meta — the title and description that surface outside the page */}
      <rect x="0" y="8" width="150" height="6" className={EASE} fill={fill("meta")} />
      <rect x="0" y="20" width="210" height="4" className={EASE} fill={fill("meta")} />

      {/* the page */}
      <rect
        x="0.5"
        y="40.5"
        width="419"
        height="249"
        fill="none"
        stroke={HAIRLINE}
      />

      {/* nav row */}
      <rect x="16" y="56" width="24" height="10" className={EASE} fill={fill("logo")} />
      {[338, 362, 386].map((x) => (
        <rect key={x} x={x} y="58" width="18" height="5" className={EASE} fill={fill("nav")} />
      ))}
      <line x1="16" x2="404" y1="78" y2="78" stroke={HAIRLINE} />

      {/* headline */}
      <rect x="16" y="90" width="270" height="14" className={EASE} fill={fill("hero")} />
      <rect x="16" y="108" width="190" height="14" className={EASE} fill={fill("hero")} />

      {/* body copy */}
      {[
        { y: 134, w: 240 },
        { y: 142, w: 225 },
        { y: 150, w: 180 },
      ].map((l) => (
        <rect key={l.y} x="16" y={l.y} width={l.w} height="3" className={EASE} fill={fill("lead")} />
      ))}

      {/* media */}
      <rect
        x="16"
        y="164"
        width="388"
        height="44"
        fill="none"
        className={EASE}
        stroke={line("media")}
      />

      {/* component grid */}
      {[16, 148, 280].map((x) => (
        <rect
          key={x}
          x={x}
          y="220"
          width="124"
          height="36"
          fill="none"
          className={EASE}
          stroke={line("grid")}
        />
      ))}

      {/* footer */}
      <line x1="16" x2="404" y1="262" y2="262" stroke={HAIRLINE} />
      <rect x="16" y="270" width="110" height="5" className={EASE} fill={fill("foot")} />

      {/* markers, in the right margin — the footnote convention */}
      {[...keyed].map(([region, n]) => (
        <g key={region}>
          <line
            x1="424"
            x2="430"
            y1={REGION_Y[region]}
            y2={REGION_Y[region]}
            stroke={ON}
          />
          <text
            x="434"
            y={REGION_Y[region] + 3.5}
            fill={ON}
            fontSize="9"
            className="font-mono"
          >
            [{n}]
          </text>
        </g>
      ))}
    </svg>
  );
}
