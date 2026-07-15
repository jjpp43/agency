"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "./gsap/Reveal";
import { SplitReveal } from "./gsap/SplitReveal";
import { Eyebrow } from "./ui/primitives";

type Service = {
  tag: string;
  /**
   * The whole of the card's prose, opening sentence included. There is no
   * separate title on purpose: the section header is the only headline here,
   * and giving the card one too made it read as a second section header
   * instead of as apparatus belonging to the selected row.
   *
   * `^n` keys footnote n to the word it follows, so the marker has to sit on
   * the noun that `notes[n - 1]` actually names — if you edit one, edit the
   * other.
   */
  body: string;
  notes: string[];
};

const SERVICES: Service[] = [
  {
    tag: "Design",
    body: "Web design with a point of view. We start from your brand, not a template. The art direction^1 is drawn for you: every layout, type choice, and interaction. Then it's built out in Figma^2 and handed over as a system^3 you can keep working in.",
    notes: [
      "Art direction & visual language",
      "High-fidelity design in Figma",
      "Reusable design systems",
    ],
  },
  {
    tag: "Development",
    body: "Engineered front to back. Production-grade front-ends^1 in Next.js and React: fast, accessible, and easy to edit. We wire them to a CMS^2 your team will actually use, and sweat the Core Web Vitals^3 so the site loads before anyone notices.",
    notes: [
      "Next.js / React front-ends",
      "Headless CMS integration",
      "Performance & accessibility",
    ],
  },
  {
    tag: "SEO & Performance",
    body: "Fast sites that get found. A beautiful site is worth nothing if it loads slowly or never surfaces in search. We tune the technical foundations^1, chase down the Core Web Vitals^2, and wire up the reporting^3 so you can watch it work.",
    notes: [
      "Technical SEO & metadata",
      "Core Web Vitals tuning",
      "Analytics & search setup",
    ],
  },
  {
    tag: "Brand",
    body: "A look that's unmistakably yours. Need the identity^1 too? We shape the logo, the palette and type^2, and the guidelines^3 that carry it all from the site into everything else you make.",
    notes: [
      "Logo & visual identity",
      "Color, type & brand systems",
      "Guidelines & asset kits",
    ],
  },
];

/**
 * Sets the `^n` markers in body copy as references, matching the `Footnote[1]`
 * wordmark exactly — it is the same device, which is the whole point.
 */
function annotate(body: string) {
  return body.split(/\^(\d+)/).map((part, i) =>
    i % 2 ? (
      <sup
        key={i}
        className="ml-[1px] font-mono text-[10px] font-medium text-electric"
      >
        [{part}]
      </sup>
    ) : (
      part
    ),
  );
}

export function Services() {
  const [active, setActive] = useState(0);
  const current = SERVICES[active];

  return (
    <section id="services" className="relative overflow-hidden bg-bone py-24 sm:py-32">
      <div className="relative mx-auto w-full max-w-[1320px] px-6">
        <Reveal className="max-w-2xl">
          <Eyebrow index="01">Services</Eyebrow>
          <SplitReveal
            as="h2"
            className="mt-6 font-display text-[40px] font-semibold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[56px]"
          >
            Everything your website needs, under one roof.
          </SplitReveal>
          <p className="mt-6 max-w-xl text-[18px] leading-[1.5] text-muted">
            Design, development, SEO, and brand, all handled by one small team.
            Take the whole project or just the part you&apos;re missing.
          </p>
        </Reveal>

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
                  {/* No headline and no eyebrow. The section header is the
                      only headline in this section; the row on the left names
                      the service. Anything more here just restates one of
                      those and turns the card into a second header. */}
                  <p className="max-w-[46ch] text-[20px] leading-[1.5] tracking-[-0.01em] text-ink-soft">
                    {annotate(current.body)}
                  </p>
                  {/* The footnote separator: a printer's short rule, set to a
                      fraction of the measure. A full-width divider would just
                      be a border again. */}
                  <div aria-hidden className="mt-10 h-px w-24 bg-line-strong" />
                  <ul className="mt-5 space-y-2.5">
                    {current.notes.map((n, i) => (
                      <li
                        key={n}
                        className="flex items-baseline gap-3 text-[14px] leading-[1.5] text-muted"
                      >
                        <span className="shrink-0 font-mono text-[11px] text-electric">
                          [{i + 1}]
                        </span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
