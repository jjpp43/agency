"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const WORD = "FOOTNOTE";

/**
 * First-load reveal: an ink curtain with a 00→100 counter and the wordmark
 * building letter by letter, then two panels wipe apart to reveal the page.
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

      const counter = { v: 0 };
      const numEl = ref.current!.querySelector("[data-count]") as HTMLElement;
      const letters = gsap.utils.toArray<HTMLElement>("[data-il]");

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          signalDone();
          setDone(true);
        },
      });

      tl.set(letters, { yPercent: 110 })
        .to(letters, {
          yPercent: 0,
          duration: 0.7,
          ease: "power4.out",
          stagger: 0.05,
        })
        .to(
          counter,
          {
            v: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              numEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0,
        )
        .to(letters, { yPercent: -110, duration: 0.5, ease: "power3.in", stagger: 0.03 }, ">-0.1")
        .to("[data-count-wrap]", { opacity: 0, duration: 0.3 }, "<")
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="overflow-hidden">
          <div className="flex">
            {WORD.split("").map((c, i) => (
              <span
                key={i}
                data-il
                className="inline-block font-display text-[13vw] font-semibold leading-none tracking-tight text-paper sm:text-[8vw]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        data-count-wrap
        className="absolute bottom-8 right-8 font-mono text-[13px] text-paper/70"
      >
        <span data-count>000</span> / 100
      </div>
    </div>
  );
}
