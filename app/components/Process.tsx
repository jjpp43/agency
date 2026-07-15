"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "./gsap/Reveal";
import { SplitReveal } from "./gsap/SplitReveal";
import { Eyebrow } from "./ui/primitives";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Step = {
  n: string;
  title: string;
  duration: string;
  body: string;
  deliverables: string[];
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Discovery",
    duration: "Week 1",
    body: "We dig into your goals, audience, and competitors, then map the sitemap and scope. You leave the kickoff knowing exactly what we're building and why.",
    deliverables: ["Sitemap", "Scope doc", "Kickoff notes"],
  },
  {
    n: "02",
    title: "Design",
    duration: "Week 2",
    body: "Art direction first, then high-fidelity design in Figma with a clickable prototype. We iterate in the open until the direction feels unmistakably yours.",
    deliverables: ["Art direction", "Figma designs", "Clickable prototype"],
  },
  {
    n: "03",
    title: "Build",
    duration: "Week 3",
    body: "We develop the site in Next.js, wire up the CMS, layer in motion, and load your content, testing across devices as we go, not at the end.",
    deliverables: ["Next.js build", "CMS setup", "Cross-device QA"],
  },
  {
    n: "04",
    title: "Launch",
    duration: "Week 4",
    body: "We deploy, hand over a site you can edit yourself, and stay on to tune, measure, and iterate. Launch is the start of the relationship, not the end.",
    deliverables: ["Deployment", "Edit training", "Analytics setup"],
  },
];

const INK = "#141310";
const FAINT = "#9c988e";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-step]");
          const markers = gsap.utils.toArray<HTMLElement>("[data-marker]");
          const total = cards.length;

          gsap.set(cards, { autoAlpha: 0, yPercent: 8 });
          gsap.set(cards[0], { autoAlpha: 1, yPercent: 0 });
          gsap.set(markers[0], { color: INK });

          const setActive = (idx: number) =>
            markers.forEach((m, i) =>
              gsap.to(m, { color: i === idx ? INK : FAINT, duration: 0.3 })
            );

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * (total - 1),
              pin: true,
              scrub: 0.6,
              snap: {
                snapTo: gsap.utils.snap(1 / (total - 1)),
                duration: 0.3,
                ease: "power1.inOut",
              },
            },
          });

          for (let i = 1; i < total; i++) {
            tl.to(
              cards[i - 1],
              { autoAlpha: 0, yPercent: -8, duration: 0.4 },
              i
            )
              .to(cards[i], { autoAlpha: 1, yPercent: 0, duration: 0.4 }, i)
              .call(setActive, [i], i);
          }

          gsap.fromTo(
            "[data-spine-fill]",
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: pinRef.current,
                start: "top top",
                end: () => "+=" + window.innerHeight * (total - 1),
                scrub: true,
              },
            }
          );
        }
      );
    },
    { scope: ref }
  );

  return (
    <section id="process" ref={ref} className="border-t border-line bg-bone">
      <div className="mx-auto w-full max-w-[1320px] px-6 pt-24 sm:pt-32">
        <Reveal className="max-w-2xl">
          <Eyebrow index="04">Process</Eyebrow>
          <SplitReveal
            as="h2"
            className="mt-6 font-display text-[40px] font-semibold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[56px]"
          >
            From first call to live site in a month.
          </SplitReveal>
          <p className="mt-6 max-w-xl text-[18px] leading-[1.5] text-muted">
            A transparent process with no surprises. You always know what
            we&apos;re working on, what&apos;s next, and when you&apos;ll see
            it.
          </p>
        </Reveal>
      </div>

      {/* Desktop: pinned scrub */}
      <div
        ref={pinRef}
        className="mt-16 hidden h-screen items-center motion-safe:lg:flex"
      >
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-12 items-center gap-16 px-6">
          <div className="col-span-5">
            <div className="relative flex gap-6">
              <div className="relative mt-2 w-[3px] shrink-0 rounded-full bg-line">
                <div
                  data-spine-fill
                  className="absolute inset-0 origin-top rounded-full bg-electric"
                />
              </div>
              <ul className="flex flex-col gap-8">
                {STEPS.map((s) => (
                  <li
                    key={s.n}
                    data-marker
                    className="flex items-baseline gap-4 text-faint"
                  >
                    <span className="font-mono text-[13px]">{s.n}</span>
                    <span className="font-display text-[34px] font-medium leading-none tracking-tight">
                      {s.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative col-span-7 h-[440px]">
            {STEPS.map((s) => (
              <article
                key={s.n}
                data-step
                className="absolute inset-0 flex flex-col justify-center overflow-hidden border border-ink bg-paper"
              >
                {/* Oversized outlined step numeral — editorial anchor */}
                <span
                  aria-hidden
                  className="text-outline pointer-events-none absolute -right-3 -top-8 select-none font-display text-[200px] font-semibold leading-none opacity-[0.14]"
                >
                  {s.n}
                </span>

                <div className="relative p-10">
                  {/* Duration marker */}
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-electric">
                    {s.duration}
                  </div>

                  <h3 className="mt-6 font-display text-[48px] font-semibold leading-none tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[16px] leading-[1.55] text-muted">
                    {s.body}
                  </p>

                  {/* Deliverables */}
                  <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-line pt-5">
                    {s.deliverables.map((d) => (
                      <li
                        key={d}
                        className="flex items-center gap-2.5 text-[14px] text-ink-soft"
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rotate-45 bg-electric"
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / reduced-motion: stacked */}
      <div className="mx-auto mt-12 w-full max-w-[1320px] px-6 pb-24 motion-safe:lg:hidden">
        <Reveal className="border-t border-line" stagger={0.12}>
          {STEPS.map((s) => (
            <article
              key={s.n}
              className="flex flex-col gap-3 border-b border-line py-8 sm:flex-row sm:gap-10"
            >
              <div className="flex items-baseline gap-4 sm:w-56 sm:shrink-0">
                <span className="font-mono text-[13px] text-electric">
                  {s.n}
                </span>
                <span className="font-display text-[32px] font-semibold tracking-tight text-ink">
                  {s.title}
                </span>
              </div>
              <div className="flex-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                  {s.duration}
                </span>
                <p className="mt-2 text-[16px] leading-[1.55] text-muted">
                  {s.body}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {s.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-center gap-2 text-[13px] text-ink-soft"
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rotate-45 bg-electric"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
