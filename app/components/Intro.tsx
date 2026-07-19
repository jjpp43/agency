"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const WORD = "FOOTNOTE";

/**
 * First-load reveal: an ink curtain with the wordmark as a small tracked label
 * above an oversized 00→100 counter dead-center, a thin electric line beneath
 * filling with the same progress. When it lands on 100 the block lifts out and
 * the panels wipe apart to reveal the page.
 * Shows once per session; respects reduced motion.
 */
export function Intro() {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const seen = sessionStorage.getItem("fn-intro");
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const signalDone = () => {
        (window as unknown as { __fnIntroDone?: boolean }).__fnIntroDone = true;
        window.dispatchEvent(new Event("fn:intro-done"));
      };

      if (seen || reduce) {
        signalDone();
        setDone(true);
        return;
      }

      sessionStorage.setItem("fn-intro", "1");
      document.body.style.overflow = "hidden";

      const prog = { v: 0 };
      const numEl = ref.current!.querySelector("[data-count]") as HTMLElement;
      const barEl = ref.current!.querySelector("[data-bar]") as HTMLElement;

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          signalDone();
          setDone(true);
        },
      });

      // 1. wordmark label + counter rise in together
      tl.set("[data-word]", { yPercent: 110 })
        .set("[data-num]", { yPercent: 40, opacity: 0 })
        .to("[data-word]", { yPercent: 0, duration: 0.6, ease: "power4.out" })
        .to(
          "[data-num]",
          { yPercent: 0, opacity: 1, duration: 0.6, ease: "power4.out" },
          "<0.05",
        )
        // 2. the count runs; the electric line tracks the same value
        .to(
          prog,
          {
            v: 100,
            duration: 1.7,
            ease: "power2.inOut",
            onUpdate: () => {
              const v = prog.v;
              numEl.textContent = String(Math.round(v)).padStart(3, "0");
              barEl.style.transform = `scaleX(${v / 100})`;
            },
          },
          ">-0.15",
        )
        // 3. the whole block lifts out
        .to(
          "[data-block]",
          { yPercent: -14, opacity: 0, duration: 0.5, ease: "power3.in" },
          ">0.2",
        )
        // 4. panels wipe apart to reveal the page
        .to(
          "[data-panel]",
          {
            scaleY: 0,
            transformOrigin: "top",
            duration: 0.8,
            ease: "power4.inOut",
            stagger: 0.08,
          },
          ">-0.1",
        );
    },
    { scope: ref },
  );

  if (done) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} data-panel className="h-full flex-1 bg-ink" />
        ))}
      </div>

      <div
        data-block
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        {/* Small wordmark label */}
        <div className="overflow-hidden">
          <div
            data-word
            className="font-mono text-[12px] uppercase tracking-[0.42em] text-paper/70 sm:text-[13px]"
          >
            {WORD}
          </div>
        </div>

        {/* Oversized counter */}
        <div
          data-num
          className="mt-4 font-display font-semibold leading-[0.82] tracking-[-0.03em] text-paper tabular-nums"
          style={{ fontSize: "clamp(96px, 22vw, 300px)" }}
        >
          <span data-count>000</span>
        </div>

        {/* Electric progress line beneath */}
        <div className="mt-6 h-[2px] w-[min(60vw,320px)] overflow-hidden bg-paper/15">
          <div
            data-bar
            className="h-full w-full origin-left bg-electric"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
