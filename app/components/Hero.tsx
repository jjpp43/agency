"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { BookingButton } from "./booking/BookingButton";
import { GhostButton } from "./Buttons";
import { SkewOnScroll, Marquee } from "./gsap/Kinetic";

// Client-only + code-split: keeps three.js out of the initial bundle and off
// the server so it never blocks the headline's first paint.
const HeroParticles = dynamic(() => import("./hero/HeroParticles"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = ref.current;
      if (!scope) return;
      const title = scope.querySelector("[data-hero-title]") as HTMLElement;
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduce) {
        title.classList.remove("reveal-hidden");
        return;
      }

      gsap.set(fades, { opacity: 0, y: 24 });

      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        const split = SplitText.create(title, { type: "lines", mask: "lines" });
        title.classList.remove("reveal-hidden");
        const tl = gsap.timeline();
        tl.from(split.lines, {
          yPercent: 115,
          duration: 1,
          ease: "power4.out",
          stagger: 0.12,
        }).to(
          fades,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
          },
          "-=0.5"
        );
      };

      const w = window as unknown as { __fnIntroDone?: boolean };
      if (w.__fnIntroDone) play();
      else window.addEventListener("fn:intro-done", play, { once: true });
      // Safety net: reveal regardless if the intro signal is ever missed.
      gsap.delayedCall(4, play);
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden pt-24"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      {/* Meta row */}
      <div className="relative mx-auto flex w-full max-w-[1320px] items-start justify-between px-6 pt-6">
        <span
          data-hero-fade
          className="max-w-[15ch] font-mono text-[12px] uppercase leading-relaxed tracking-[0.08em] text-muted"
        >
          Design & development studio
        </span>
        <span
          data-hero-fade
          className="hidden text-right font-mono text-[12px] uppercase leading-relaxed tracking-[0.08em] text-electric sm:block"
        >
          ● Live
        </span>
      </div>

      {/* Giant statement */}
      <div className="relative mx-auto w-full max-w-[1320px] flex-1 px-6">
        {/* Point-cloud fills the empty right half on large screens. Behind the
            headline, non-interactive, hidden on small screens for perf/space. */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] lg:block"
        >
          <HeroParticles />
        </div>
        <div className="relative flex h-full items-center">
          <SkewOnScroll max={6}>
            <h1
              data-hero-title
              className="reveal-hidden font-display font-semibold uppercase leading-[0.86] tracking-[-0.04em] text-ink"
              style={{ fontSize: "clamp(56px, 12vw, 176px)" }}
            >
              Websites
              <br />
              worth
              <br />
              building<span className="text-electric">.</span>
            </h1>
          </SkewOnScroll>
        </div>
      </div>

      {/* Bottom row: subline + CTAs, then marquee */}
      <div className="relative mx-auto w-full max-w-[1320px] px-6 pb-8">
        <div className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <p
            data-hero-fade
            className="max-w-md text-[18px] leading-[1.5] text-ink-soft"
          >
            A small studio making distinctive, high performing websites for
            businesses that want their own.
          </p>
          <div data-hero-fade className="flex flex-wrap items-center gap-3">
            <BookingButton>Let&apos;s talk</BookingButton>
            <GhostButton href="#work">See the work</GhostButton>
          </div>
        </div>
      </div>

      <div data-cursor-dark>
        <Marquee
          className="relative border-y border-ink bg-ink py-4 text-paper"
          items={["Design", "Development", "Motion", "Brand", "Strategy"]}
          itemClassName="font-display text-[28px] font-medium uppercase tracking-[0.08em] sm:text-[34px]"
        />
      </div>
    </section>
  );
}
