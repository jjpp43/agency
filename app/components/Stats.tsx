"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Stat = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

const STATS: Stat[] = [
  { value: 4, suffix: "", label: "custom sites shipped so far" },
  { value: 98, label: "average Lighthouse performance score" },
  { value: 3, suffix: " wks", label: "typical design-to-launch timeline" },
  { value: 100, suffix: "%", label: "custom-built. \nzero templates" },
];

function formatValue(v: number, s: Stat) {
  const n =
    s.decimals != null
      ? v.toFixed(s.decimals)
      : Math.round(v).toLocaleString("en-US");
  return `${s.prefix ?? ""}${n}${s.suffix ?? ""}`;
}

export function Stats() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const nums = gsap.utils.toArray<HTMLElement>("[data-num]");
      nums.forEach((el) => {
        const stat = STATS[Number(el.dataset.num)];
        if (reduce) {
          el.textContent = formatValue(stat.value, stat);
          return;
        }
        const counter = { v: 0 };
        gsap.to(counter, {
          v: stat.value,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = formatValue(counter.v, stat);
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="border-b border-line bg-bone">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="border-line px-6 py-12 [&:nth-child(n+3)]:border-t sm:py-16 lg:px-10 lg:[&:not(:first-child)]:border-l lg:[&:nth-child(n+3)]:border-t-0"
          >
            <span
              data-num={i}
              className="block font-display text-[52px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[64px]"
            >
              {formatValue(0, s)}
            </span>
            <p className="mt-4 max-w-[18ch] text-[14px] leading-[1.45] text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
