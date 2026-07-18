"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "./gsap/Reveal";
import { Eyebrow } from "./ui/primitives";
import {
  StairLine,
  applyDraw,
  measureStair,
  measureSwitchback,
  type StairMetrics,
} from "./services/StairLine";
import { ServicePhoto, type Shot } from "./services/ServicePhoto";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Step = { num: string; word: string; body: ReactNode };

const STEPS: Step[] = [
  {
    num: "01",
    word: "Listen",
    body: (
      <>
        We start by understanding your goals, your audience, and what sets you
        apart.
      </>
    ),
  },
  {
    num: "02",
    word: "Build",
    body: (
      <>
        Then we make it — brand, design, and development, end to end, one small
        team.
      </>
    ),
  },
  {
    num: "03",
    word: "Grow",
    body: (
      <>
        And we get you found: tuned for search engines and the{" "}
        <span className="text-electric">AI answer engines</span> people now ask{" "}
        <span className="font-mono">(SEO&nbsp;&amp;&nbsp;AEO)</span>.
      </>
    ),
  },
];

// One photo per step. Drop a real file at `src` and it replaces the
// placeholder on the next load — nothing here needs to change.
const SHOTS: Shot[] = [
  {
    src: "/services/listen.jpg",
    subject: "A call in progress · notes · whiteboard",
    alt: "Working through a new project's goals",
  },
  {
    src: "/services/build.jpg",
    subject: "Screens mid-work · design file · code",
    alt: "Design and build in progress",
  },
  {
    src: "/services/grow.jpg",
    subject: "Analytics · a launch · dashboard",
    alt: "Measuring a launched site's performance",
  },
];

// The descending-right staircase (desktop). Each step sits lower and further
// right than the last, so the section reads left-to-right as it accumulates.
// Room is left up top for the persistent header.
// Equal widths, so the three cover-opens sweep the same arc on their left
// hinge. 42% is what the last step can take without passing the right margin.
const POS = [
  "left-[4%] top-[25%] w-[42%]",
  "left-[31%] top-[48%] w-[42%]",
  "left-[54%] top-[69%] w-[42%]",
];

export function Services() {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mobRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // One handler for every combination: `lg`/`sm` pick the visible stair
      // line and how it's driven; without `motion` the line paints fully drawn
      // and only re-measures on resize (the static, reduced-motion contract).
      mm.add(
        {
          lg: "(min-width: 1024px)",
          sm: "(max-width: 1023px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { lg, motion } = ctx.conditions as {
            lg: boolean;
            motion: boolean;
          };

          const host = lg ? stageRef.current : mobRef.current;
          if (!host) return;
          const path = host.querySelector<SVGPathElement>("[data-stair-path]");
          const dot = host.querySelector<SVGCircleElement>("[data-stair-dot]");
          const steps = lg
            ? gsap.utils.toArray<HTMLElement>("[data-step]", host)
            : Array.from(host.children).filter(
                (el): el is HTMLElement => el.tagName === "DIV",
              );

          // The line's draw state lives outside the tweens so a re-measure
          // (resize / font swap → refresh) keeps the current progress.
          const line = { len: 0 };
          let m: StairMetrics | null = null;
          const layout = () => {
            if (!path || !dot) return;
            m = lg ? measureStair(host, steps) : measureSwitchback(host, steps);
            if (!m) return;
            path.setAttribute("d", m.d);
            applyDraw(path, dot, m, motion ? line.len : m.total);
          };
          const draw = () => {
            if (m && path && dot) applyDraw(path, dot, m, line.len);
          };
          layout();

          // Two stacks that swap with the steps: the photo slot in the empty
          // lower-left, and the outsized step numeral in the empty top-right.
          const shots = gsap.utils.toArray<HTMLElement>("[data-shot]", host);
          const numerals = gsap.utils.toArray<HTMLElement>(
            "[data-numeral]",
            host,
          );

          if (!motion) {
            // Static: hold the first of each, since every step shows at rest.
            for (const els of [shots, numerals]) {
              if (!els.length) continue;
              gsap.set(els, { autoAlpha: 0 });
              gsap.set(els[0], { autoAlpha: 1 });
            }
            const ro = new ResizeObserver(layout);
            ro.observe(host);
            return () => ro.disconnect();
          }

          if (lg) {
            // Pin the stage and, as the pinned region scrolls, cover-open each
            // step (rotateY on a left hinge) into place, accumulating the
            // staircase — while the stair line draws its next reach in the
            // same window. The header is NOT animated — it stays put the whole
            // pin, so the screen is never empty.
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: pinRef.current,
                start: "top top",
                end: "+=300%",
                pin: true,
                scrub: 0.6,
                invalidateOnRefresh: true,
                // measure after refresh (not refreshInit): mid-refresh the pin
                // still carries the old viewport's inline size, so the step
                // offsets read stale
                onRefresh: layout,
              },
            });

            // Bring stack item i forward and retire the one before it.
            const swapTo = (els: HTMLElement[], i: number, at: number) => {
              if (!els[i]) return;
              tl.to(
                els[i],
                { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
                at,
              );
              if (els[i - 1]) {
                tl.to(
                  els[i - 1],
                  { autoAlpha: 0, duration: 0.5, ease: "power2.out" },
                  at,
                );
              }
            };

            steps.forEach((el, i) => {
              const body = el.querySelector("[data-body]");
              // step 01 opens immediately at pin-start, so there's no empty beat
              const at = i * 1.05;
              // the cover swings open on its left edge and settles (power3.out)
              tl.fromTo(
                el,
                { rotateY: -78, autoAlpha: 0 },
                {
                  rotateY: 0,
                  autoAlpha: 1,
                  duration: 0.75,
                  ease: "power3.out",
                },
                at,
              )
                // one-two: the body copy rises in just after the word lands
                .fromTo(
                  body,
                  { autoAlpha: 0, y: 14 },
                  { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
                  at + 0.5,
                )
                // the line drops down and treads under the step it just reached
                .to(
                  line,
                  {
                    len: () => m?.marks[i] ?? 0,
                    duration: 0.9,
                    ease: "power2.out",
                    onUpdate: draw,
                  },
                  at,
                );

              // the numeral turns over with the step, the photo just behind it
              swapTo(numerals, i, at);
              swapTo(shots, i, at + 0.15);
            });

            tl.to({}, { duration: 0.6 }); // tail — hold the finished staircase
          } else {
            // Mobile: the switchback scrubs in alongside the stacked Reveals.
            gsap.to(line, {
              len: () => m?.total ?? 0,
              ease: "none",
              scrollTrigger: {
                trigger: host,
                start: "top 78%",
                end: "bottom 72%",
                scrub: true,
                invalidateOnRefresh: true,
                onRefresh: layout,
              },
              onUpdate: draw,
            });
          }
        },
      );
    },
    { scope: ref },
  );

  return (
    <section id="services" ref={ref} className="bg-bone">
      {/* Desktop: pinned cover-open staircase with a persistent header */}
      <div
        ref={pinRef}
        className="relative hidden h-screen overflow-hidden lg:block"
      >
        <div
          ref={stageRef}
          className="relative mx-auto h-full max-w-[1320px] px-6"
          style={{ perspective: "1700px", perspectiveOrigin: "40% 45%" }}
        >
          {/* The stair line — draws in under the steps on the pin's clock */}
          <StairLine className="pointer-events-none absolute inset-0 h-full w-full" />

          {/* Persistent header — stays on screen the whole pin, so the section
              never goes empty between the intro and the first step. */}
          <div className="absolute left-[4%] top-[9%] z-10">
            <Eyebrow index="01">Services</Eyebrow>
            <h2 className="mt-4 max-w-[18ch] text-balance font-display text-[clamp(22px,2.5vw,34px)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
              Three moves, one small team.
            </h2>
          </div>

          {/* Step numeral — fills the top-right, the one region the staircase
              never reaches, and balances the header diagonally: small solid
              type up left, outsized hollow type up right. Turns over with each
              step. */}
          <div
            aria-hidden
            // floor the offset so the numeral clears the fixed header on short
            // viewports, where 8% of the stage lands behind it
            className="pointer-events-none absolute right-[3%] top-[max(84px,8%)]"
          >
            {STEPS.map((s, i) => (
              <span
                key={s.num}
                data-numeral
                className="text-outline absolute right-0 top-0 font-display font-semibold leading-[0.78] tracking-[-0.05em]"
                style={{
                  fontSize: "clamp(120px, 16vw, 250px)",
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                {s.num}
              </span>
            ))}
          </div>

          {/* Photo slot — sits in the space the staircase leaves empty as it
              descends to the right, clear of the stair line's first drop. */}
          <div className="absolute left-[4%] top-[48%] aspect-[4/5] w-[22%]">
            {SHOTS.map((shot, i) => (
              <div
                key={shot.src}
                data-shot
                className="absolute inset-0"
                // first shot is the at-rest state; JS drives the rest
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <ServicePhoto shot={shot} className="h-full w-full" />
              </div>
            ))}
          </div>

          {STEPS.map((s, i) => (
            <article
              key={s.word}
              data-step
              className={`absolute origin-left ${POS[i]}`}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[14px] text-electric">
                  {s.num}
                </span>
                <h3 className="font-display text-[clamp(44px,6.6vw,98px)] font-semibold leading-[0.9] tracking-[-0.035em] text-ink">
                  {s.word}
                </h3>
              </div>
              <p
                data-body
                className="mt-3.5 max-w-[34ch] text-pretty text-[clamp(15px,1.35vw,18px)] leading-[1.45] text-ink-soft"
              >
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Mobile / reduced motion: stacked, each step step-indented right */}
      <div className="lg:hidden">
        <div className="mx-auto max-w-[1320px] px-6 pb-24 pt-24">
          <Eyebrow index="01">Services</Eyebrow>
          <h2 className="mt-6 max-w-[16ch] text-balance font-display text-[40px] font-semibold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[56px]">
            Three moves, one small team.
          </h2>

          <div ref={mobRef} className="relative mt-14 flex flex-col gap-14">
            {/* The switchback line — scrubs in behind the stacked steps */}
            <StairLine className="pointer-events-none absolute inset-0 h-full w-full" />
            {STEPS.map((s, i) => (
              <Reveal
                key={s.word}
                className={["ml-0", "ml-[8%]", "ml-[16%]"][i]}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[13px] text-electric">
                    {s.num}
                  </span>
                  <h3 className="font-display text-[52px] font-semibold leading-[0.9] tracking-[-0.03em] text-ink">
                    {s.word}
                  </h3>
                </div>
                <p className="mt-3 max-w-[32ch] text-pretty text-[16px] leading-[1.45] text-ink-soft">
                  {s.body}
                </p>
                <ServicePhoto
                  shot={SHOTS[i]}
                  className="mt-5 aspect-[4/5] w-[62%] max-w-[260px]"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
