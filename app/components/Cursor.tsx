"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Bespoke cursor: a small dot with a lagging ring. The ring swells and shows a
 * label when hovering anything marked `data-cursor` (value becomes the label),
 * and flips from ink to paper over surfaces marked `data-cursor-dark` so it
 * stays visible on dark backgrounds. Disabled on touch / reduced motion.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

    let vis = false;
    let dark = false;

    const onMove = (e: PointerEvent) => {
      if (!vis) {
        vis = true;
        setVisible(true);
      }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      const isDark = !!(e.target as HTMLElement)?.closest?.(
        "[data-cursor-dark]",
      );
      if (isDark !== dark) {
        dark = isDark;
        setOnDark(isDark);
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-cursor], a, button",
      ) as HTMLElement | null;
      setActive(!!el);
      setLabel(el?.getAttribute("data-cursor") || "");
    };

    const onLeave = () => {
      vis = false;
      setVisible(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const baseColor = onDark ? "var(--color-paper)" : "var(--color-ink)";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] hidden [@media(pointer:fine)]:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s" }}
    >
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: active ? "transparent" : baseColor }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full transition-[width,height,margin,border-color,border-width] duration-300 ease-out"
        style={{
          width: active ? 88 : 34,
          height: active ? 88 : 34,
          marginLeft: active ? -44 : -17,
          marginTop: active ? -44 : -17,
          borderStyle: "solid",
          borderWidth: active ? 2 : 1,
          borderColor: active ? "var(--color-electric)" : baseColor,
        }}
      >
        {/* Outline only — the center stays open so the puck never occludes
            what you're about to click. Label picks up the electric accent
            since there's no fill behind it. */}
        <span
          className="font-mono text-[10px] uppercase tracking-wide text-electric transition-opacity duration-200"
          style={{ opacity: active && label ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
