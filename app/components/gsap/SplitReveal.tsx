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
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Reveals a headline word-by-word (mask-wipe from below). Uses GSAP SplitText
 * so line wrapping is measured after fonts load. Falls back to a plain fade
 * under reduced-motion (SplitText is skipped via the CSS guard).
 */
export function SplitReveal({
  children,
  as,
  className,
  type = "words",
  stagger = 0.06,
  delay = 0,
  start = "top 88%",
  scroll = true,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  type?: "words" | "chars" | "lines";
  stagger?: number;
  delay?: number;
  start?: string;
  /** When false, plays immediately on mount instead of on scroll. */
  scroll?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  // See Reveal.tsx: concrete type dodges R3F's global JSX augmentation
  // collapsing this polymorphic tag's children to `never`.
  const Comp = (as ?? "h2") as unknown as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.classList.remove("reveal-hidden");
        return;
      }

      const split = SplitText.create(el, {
        type,
        mask: type,
        wordsClass: "split-word",
        charsClass: "split-char",
        linesClass: "split-line",
      });
      const parts =
        type === "chars"
          ? split.chars
          : type === "lines"
            ? split.lines
            : split.words;

      el.classList.remove("reveal-hidden");

      gsap.from(parts, {
        yPercent: 115,
        duration: 0.9,
        ease: "power4.out",
        stagger,
        delay,
        scrollTrigger: scroll
          ? { trigger: el, start, once: true }
          : undefined,
      });

      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Comp ref={ref} className={`reveal-hidden ${className ?? ""}`}>
      {children}
    </Comp>
  );
}
