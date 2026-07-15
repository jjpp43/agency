"use client";

import {
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-triggered entrance. Fades + lifts the element (or, when `stagger`
 * is set, its direct children) once it enters the viewport.
 */
export function Reveal({
  children,
  as,
  className,
  y = 28,
  delay = 0,
  stagger,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  y?: number;
  delay?: number;
  /** When set, animate direct children in sequence instead of the container. */
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  // Concrete component type instead of the raw `ElementType` union: R3F's
  // global JSX augmentation otherwise collapses a polymorphic tag's children
  // to `never`. The `as` prop stays typed as `ElementType` at the API.
  const Comp = (as ?? "div") as unknown as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = stagger != null ? Array.from(el.children) : el;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay,
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}
