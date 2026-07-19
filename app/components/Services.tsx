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
    src: "/service1.jpg",
    subject: "A call in progress · notes · whiteboard",
    alt: "Two people talking through a project over open laptops",
    // the frame's empty upper wall isn't worth the space at this size — bias
    // the crop down onto the laptops and the gesturing hand
    position: "center 64%",
  },
  {
    src: "/service2.jpg",
    subject: "Screens mid-work · design file · code",
    alt: "A developer working through code at a desk",
    // The only colour frame of the three, and its yellow was pulling harder
    // than the electric accent. Desaturated to match the other two.
    grade: "grayscale(1)",
  },
  {
    src: "/service3.jpg",
    subject: "Analytics · a launch · dashboard",
    alt: "Analytics on screen beside a printed brand sheet",
  },
];

// The descending-right staircase (desktop). Each step sits lower and further
// right than the last, so the section reads left-to-right as it accumulates.
// Room is left up top for the persistent header.
// Each step is a photo-and-text pair that descends together, so the image is
// always beside the word it belongs to rather than parked in a corner while the
// titles walk away from it. Equal widths keep the three cover-opens sweeping
// the same arc on their left hinge; the rows are spaced so they never overlap
// vertically, since they do overlap horizontally.
// The vertical offsets carry a pixel floor as well as a percentage. On a tall
// viewport the percentage wins and nothing changes; on a short one the floors
// hold the rows apart from the header and from each other, whose type doesn't
// shrink with the viewport. `fit()` then scales the whole stage to whatever
// height is left, so the composition never collides and never overflows.
const POS = [
  "left-[4%] top-[max(200px,24%)] w-[42%]",
  "left-[22%] top-[max(415px,48.5%)] w-[42%]",
  "left-[40%] top-[max(630px,73%)] w-[42%]",
];

export function Services() {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
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
          const dot = host.querySelector<SVGGElement>("[data-stair-dot]");
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

          /**
           * Shrink the stage to whatever height the viewport actually has.
           * Measured from layout (offsetTop/offsetHeight ignore transforms, so
           * this stays correct when a scale is already applied) rather than
           * from a breakpoint guess. TAIL covers the stair line's last tread
           * plus a little air beneath it.
           */
          const TAIL = 48;
          const fit = () => {
            const wrap = fitRef.current;
            if (!wrap || !lg) return;
            const last = steps[steps.length - 1];
            const available = host.clientHeight;
            if (!last || !available) return;
            const needed = last.offsetTop + last.offsetHeight + TAIL;
            const s = Math.min(1, available / needed);
            gsap.set(wrap, { scale: s, transformOrigin: "top center" });

            // The numeral's 84px floor keeps it below the fixed nav, but it's
            // inside the scaled wrapper — so the floor has to be divided by the
            // scale to survive as 84px on screen.
            const box = host.querySelector<HTMLElement>("[data-numeral-box]");
            if (box) box.style.top = `${Math.max(84 / s, available * 0.08)}px`;
          };

          layout();
          fit();

          // The photos ride along inside their steps now; only the outsized
          // numeral in the top-right still swaps.
          const numerals = gsap.utils.toArray<HTMLElement>(
            "[data-numeral]",
            host,
          );

          if (!motion) {
            // Static: hold the first numeral, since every step shows at rest.
            if (numerals.length) {
              gsap.set(numerals, { autoAlpha: 0 });
              gsap.set(numerals[0], { autoAlpha: 1 });
            }
            const ro = new ResizeObserver(() => { layout(); fit(); });
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
                onRefresh: () => { layout(); fit(); },
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
              const photo = el.querySelector("[data-photo]");
              const shot = el.querySelector("[data-photo] img, [data-photo] div");
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
                // the photo wipes open left-to-right, the same direction the
                // cover swings and the stair line draws
                .fromTo(
                  photo,
                  { clipPath: "inset(0% 100% 0% 0%)" },
                  {
                    clipPath: "inset(0% 0% 0% 0%)",
                    duration: 0.65,
                    ease: "power3.inOut",
                  },
                  at + 0.28,
                )
                // and the image settles back as the wipe passes over it, so the
                // frame isn't just uncovering something already at rest
                .fromTo(
                  shot,
                  { scale: 1.18 },
                  { scale: 1, duration: 0.95, ease: "power3.out" },
                  at + 0.28,
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

              // the numeral turns over with the step
              swapTo(numerals, i, at);
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
          {/* Everything in the stage scales together to fit the viewport's
              height. The rows are positioned as a share of that height but
              sized from their photo and type, which don't shrink with it — so
              on a short laptop (Firefox at HiDPI scaling especially) the last
              step and the stair line's final tread ran off the bottom. Scaling
              the whole composition keeps the layout identical and only ever
              makes it smaller when the height genuinely isn't there. */}
          <div ref={fitRef} className="absolute inset-0">
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
            data-numeral-box
            // top is set by fit(), which has to divide the 84px floor by the
            // stage scale to keep the numeral clear of the fixed nav on screen
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

          {STEPS.map((s, i) => (
            <article
              key={s.word}
              data-step
              className={`absolute flex origin-left items-center gap-5 ${POS[i]}`}
            >
              {/* the step's own photo, travelling with it */}
              <ServicePhoto
                shot={SHOTS[i]}
                className="aspect-square w-[27%] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[14px] text-electric">
                    {s.num}
                  </span>
                  <h3 className="font-display text-[clamp(38px,5.4vw,82px)] font-semibold leading-[0.9] tracking-[-0.035em] text-ink">
                    {s.word}
                  </h3>
                </div>
                <p
                  data-body
                  className="mt-3 text-pretty text-[clamp(14px,1.2vw,17px)] leading-[1.45] text-ink-soft"
                >
                  {s.body}
                </p>
              </div>
            </article>
          ))}
          </div>
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
                  className="mt-5 aspect-square w-[62%] max-w-[260px]"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
