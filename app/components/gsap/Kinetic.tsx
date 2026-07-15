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
 * Infinite marquee band. `items` render inline separated by a bullet; the
 * whole strip drifts and slants slightly with scroll velocity.
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
  const Row = () => (
    <div className="flex shrink-0 items-center" aria-hidden>
      {items.map((it, i) => (
        <span key={i} className={`flex items-center ${itemClassName ?? ""}`}>
          {it}
          <span className="mx-8 inline-block h-3 w-3 shrink-0 rotate-45 bg-electric" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div
        className={`flex w-max ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}
      >
        <Row />
        <Row />
      </div>
    </div>
  );
}
