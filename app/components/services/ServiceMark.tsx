"use client";

/**
 * The mark: one square, quartered, stood on its point. A quarter per service.
 *
 * The 45° turn lives on the container, not the quarters, which is what makes
 * the lift work: a quarter pushed out along its own diagonal in local space
 * lands as straight up / right / down / left on screen. So the four read as
 * the points of a compass even though they're laid out as a plain 2×2.
 */

/**
 * Local-space direction each quarter travels when it lifts, in grid order
 * (row-major: 0 top-left, 1 top-right, 2 bottom-left, 3 bottom-right). After
 * the container's 45° turn these come out as up, right, left, down.
 * One entry per service — the mark is four quarters because there are four.
 */
const LIFT = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

/** How far a quarter pulls away from the centre, in px of local space. */
const LIFT_PX = 10;

export function ServiceMark({
  active,
  onHover,
}: {
  active: number;
  onHover: (i: number) => void;
}) {
  return (
    // Decorative: the list beside it is the real control and says the same
    // thing in words. Hovering a quarter is a mouse-only shortcut to it.
    <div
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[380px]"
    >
      {/* inset leaves the corners the 45° turn needs, plus room to lift into */}
      <div className="absolute inset-[18%] grid rotate-45 grid-cols-2 gap-3">
        {LIFT.map(([dx, dy], i) => {
          const on = i === active;
          return (
            <div
              key={i}
              onMouseEnter={() => onHover(i)}
              style={{
                transform: on
                  ? `translate(${dx * LIFT_PX}px, ${dy * LIFT_PX}px)`
                  : undefined,
              }}
              className={`border transition-[transform,background-color,border-color] duration-500 ease-out ${
                on ? "border-electric bg-electric" : "border-line-strong"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
