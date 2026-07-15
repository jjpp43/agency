import { Reveal } from "./gsap/Reveal";
import { SplitReveal } from "./gsap/SplitReveal";
import { BookingButton } from "./booking/BookingButton";

export function CTASection() {
  return (
    <section
      id="contact"
      data-cursor-dark
      className="relative overflow-hidden bg-ink text-paper"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.15] [--tw-bg-opacity:1]" />
      <div className="relative mx-auto w-full max-w-[1320px] px-6 py-28 sm:py-40">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-paper/60">
            <span className="text-electric">[→]</span> New projects
          </span>
        </Reveal>

        <SplitReveal
          as="h2"
          className="mt-8 font-display font-semibold uppercase leading-[0.9] tracking-[-0.04em]"
        >
          <span
            className="block"
            style={{ fontSize: "clamp(44px, 9vw, 132px)" }}
          >
            Let&apos;s build
          </span>
          <span
            className="block"
            style={{ fontSize: "clamp(44px, 9vw, 132px)" }}
          >
            something worth
          </span>
          <span
            className="block"
            style={{ fontSize: "clamp(44px, 9vw, 132px)" }}
          >
            visiting<span className="text-electric">.</span>
          </span>
        </SplitReveal>

        <Reveal className="mt-12 flex flex-col gap-8 border-t border-paper/15 pt-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-[18px] leading-[1.5] text-paper/70">
            Tell us what you want. We&apos;ll come back with a free 30-minute
            call, an honest take on scope, and a fixed price. No pressure, no
            jargon.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <BookingButton variant="light">
              Let&apos;s talk
            </BookingButton>
            <a
              href="mailto:hello@footnote.agency"
              data-cursor="Email"
              className="font-mono text-[13px] uppercase tracking-wide text-paper/70 underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-electric"
            >
              hello@footnote.agency
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
