"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "./gsap/Reveal";
import { SplitReveal } from "./gsap/SplitReveal";
import { Eyebrow } from "./ui/primitives";
import { ServiceMark } from "./services/ServiceMark";

type Service = {
  tag: string;
  /**
   * The whole of the card's prose, opening sentence included. Two sentences,
   * and keep it there. There is no headline on purpose: the section header is
   * the only headline here, and giving the card one too made it read as a
   * second section header rather than as detail for the selected row.
   */
  body: string;
};

const SERVICES: Service[] = [
  {
    tag: "Design",
    body: "Web design with a point of view. We start from your brand, not a template, and draw every layout, type choice, and interaction for you.",
  },
  {
    tag: "Development",
    body: "Engineered front to back. Production-grade front-ends in Next.js and React: fast, accessible, and easy to edit.",
  },
  {
    tag: "SEO & Performance",
    body: "Fast sites that get found. A beautiful site is worth nothing if it loads slowly or never surfaces in search.",
  },
  {
    tag: "Brand",
    body: "A look that's unmistakably yours. We shape the logo, the palette, and the type that carry it from the site into everything else you make.",
  },
];

export function Services() {
  const [active, setActive] = useState(0);
  const current = SERVICES[active];

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-bone py-24 sm:py-32"
    >
      <div className="relative mx-auto w-full max-w-[1320px] px-6">
        {/* Header row. The mark fills what was dead space to the right of the
            copy, and sits above the detail so both share a column. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <Eyebrow index="01">Services</Eyebrow>
            <SplitReveal
              as="h2"
              className="mt-6 font-display text-[40px] font-semibold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[56px]"
            >
              Everything your website needs, under one roof.
            </SplitReveal>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.5] text-muted">
              Design, development, SEO, and brand, all handled by one small
              team. Take the whole project or just the part you&apos;re missing.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:self-end">
            <ServiceMark active={active} onHover={setActive} />
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Selector */}
          <div className="lg:col-span-6">
            <ul className="border-t border-line">
              {SERVICES.map((s, i) => {
                const isActive = active === i;
                return (
                  <li key={s.tag} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      aria-pressed={isActive}
                      className="group flex w-full items-center gap-5 py-6 text-left"
                    >
                      <span
                        className={`font-mono text-[13px] transition-colors duration-300 ${
                          isActive ? "text-electric" : "text-faint"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[30px] font-medium leading-none tracking-[-0.02em] transition-all duration-300 sm:text-[40px] ${
                          isActive
                            ? "translate-x-2 text-ink"
                            : "text-faint group-hover:translate-x-1 group-hover:text-ink-soft"
                        }`}
                      >
                        {s.tag}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                <motion.article
                  key={current.tag}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <p className="max-w-[46ch] text-[20px] leading-[1.5] tracking-[-0.01em] text-ink-soft">
                    {current.body}
                  </p>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
