"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "./gsap/Reveal";
import { SplitReveal } from "./gsap/SplitReveal";
import { Eyebrow } from "./ui/primitives";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What kind of websites do you build?",
    a: "Marketing sites, landing pages, portfolios, and small web apps for startups, agencies, and established brands. Most are custom builds in Next.js or React; when a project calls for it, we'll also build in Webflow so your team can manage it hands-on.",
  },
  {
    q: "How long does a project take?",
    a: "A landing page runs 2–3 weeks; a full marketing site is typically 4–6 weeks; larger custom builds run longer. We'll give you a firm timeline after the discovery call, and we hit the dates we set.",
  },
  {
    q: "What does a website cost?",
    a: "Landing pages start at $1,000, multi-page marketing sites around $4,000, and custom builds from $15,000 depending on scope. Every project is fixed-fee and scoped up front. No surprise invoices.",
  },
  {
    q: "Do you use templates or themes?",
    a: "No. Every site is designed from scratch around your brand. That's the whole point. You shouldn't launch a site that a hundred other companies are already running.",
  },
  {
    q: "Can we edit the site ourselves after launch?",
    a: "Yes. We wire up a headless CMS (usually Sanity) or Webflow so your team can update copy, images, and pages without touching code. We include a handover walkthrough and documentation.",
  },
  {
    q: "Do you maintain the site after it's live?",
    a: "If you'd like us to. We offer monthly care plans for updates, new pages, performance monitoring, and iteration. Otherwise we hand it off cleanly and you take it from there.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-start justify-between gap-6 py-6 text-left"
      >
        <span className="flex items-baseline gap-4">
          <span className="font-mono text-[13px] leading-none text-electric">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-display text-[21px] font-medium leading-snug tracking-tight text-ink transition-colors group-hover:text-electric sm:text-[24px]">
            {q}
          </span>
        </span>
        <span
          aria-hidden
          className={`mt-1 text-[22px] leading-none text-ink transition-transform duration-300 ${
            open ? "rotate-45 text-electric" : ""
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 pl-[34px] text-[15px] leading-[1.65] text-muted">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="bg-bone py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[1320px] px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow index="05">FAQ</Eyebrow>
            <SplitReveal
              as="h2"
              className="mt-6 font-display text-[40px] font-semibold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[52px]"
            >
              Good questions, straight answers.
            </SplitReveal>
            <p className="mt-6 text-[16px] leading-[1.6] text-muted">
              Still curious? Email{" "}
              <a
                className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-electric"
                href="mailto:hello@footnote.agency"
              >
                hello@footnote.agency
              </a>
              .
            </p>
          </Reveal>

          <div className="lg:col-span-8">
            <div className="border-t border-line">
              {FAQS.map((f, i) => (
                <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
