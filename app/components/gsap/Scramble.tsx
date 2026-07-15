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
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, useGSAP);

/**
 * Decodes text into place on scroll-in (or on mount). Purely presentational —
 * the final string is always in the DOM for a11y; reduced motion shows it plain.
 */
export function Scramble({
  text,
  as,
  className,
  duration = 1.1,
  scroll = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  // See Reveal.tsx: concrete type dodges R3F's global JSX augmentation
  // collapsing this polymorphic tag's children to `never`.
  const Comp = (as ?? "span") as unknown as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to(el, {
        duration,
        ease: "none",
        scrambleText: {
          text,
          chars: "upperCase",
          speed: 0.6,
          tweenLength: false,
        },
        scrollTrigger: scroll ? { trigger: el, start: "top 88%", once: true } : undefined,
      });
    },
    { scope: ref },
  );

  return (
    <Comp ref={ref} className={className}>
      {text}
    </Comp>
  );
}
