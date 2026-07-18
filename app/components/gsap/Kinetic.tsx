"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Skews and nudges its content in proportion to scroll velocity, springing
 * back to rest when the page stops. The kinetic-editorial signature.
 */
export function SkewOnScroll({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const skewTo = gsap.quickTo(el, "skewY", {
        duration: 0.5,
        ease: "power3",
      });
      const clamp = gsap.utils.clamp(-max, max);

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          skewTo(clamp(self.getVelocity() / -240));
        },
      });
      return () => st.kill();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/**
 * Infinite marquee band, driven off scroll velocity rather than a fixed
 * keyframe: it drifts at rest, accelerates as you scroll, and runs backwards
 * when you scroll up, easing back to the drift when the page settles. Same
 * signature as SkewOnScroll — the band answers the scroll instead of ignoring
 * it.
 *
 * Words alternate solid and outlined for typographic rhythm; the outline picks
 * up `currentColor`, so it inverts correctly on a dark band.
 *
 * Reduced motion parks the strip and never starts the ticker.
 */
export function Marquee({
  items,
  reverse = false,
  className,
  itemClassName,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const strip = stripRef.current;
      const row = rowRef.current;
      if (!strip || !row) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const BASE = 55; // px/sec at rest
      const MAX = 9; // ceiling on the velocity multiplier
      const drift = { mult: 1, dir: reverse ? -1 : 1 };
      let x = 0;
      let span = row.offsetWidth; // one row; the second is its copy

      const measure = () => {
        span = row.offsetWidth;
      };
      const ro = new ResizeObserver(measure);
      ro.observe(row);

      const tick = (_t: number, delta: number) => {
        if (!span) return;
        x -= BASE * drift.mult * drift.dir * (delta / 1000);
        // wrap within one row's width so the seam never shows
        x = gsap.utils.wrap(-span, 0, x);
        gsap.set(strip, { x });
      };
      gsap.ticker.add(tick);

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          // scrolling up runs the band the other way
          drift.dir = (v < 0 ? -1 : 1) * (reverse ? -1 : 1);
          gsap.killTweensOf(drift);
          drift.mult = Math.min(1 + Math.abs(v) / 320, MAX);
          // and it coasts back down to the resting drift
          gsap.to(drift, { mult: 1, duration: 0.9, ease: "power2.out" });
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        st.kill();
      };
    },
    { scope: stripRef },
  );

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div ref={stripRef} className="flex w-max">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            ref={copy === 0 ? rowRef : undefined}
            className="flex shrink-0 items-center"
            aria-hidden
          >
            {items.map((it, i) => (
              <span
                key={i}
                className={`flex items-center ${i % 2 ? "text-outline" : ""} ${
                  itemClassName ?? ""
                }`}
              >
                {it}
                <span className="mx-8 inline-block h-3 w-3 shrink-0 rotate-45 bg-electric" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
