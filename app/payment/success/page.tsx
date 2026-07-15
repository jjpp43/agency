import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PillButton } from "../../components/Buttons";

export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <main className="w-full min-w-0 flex-1 overflow-x-clip">
        <section className="relative overflow-hidden pt-32 pb-32 sm:pt-44 sm:pb-40">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto w-full max-w-2xl px-6 text-center">
            <span
              aria-hidden
              className="mx-auto grid h-16 w-16 place-items-center bg-electric text-[26px] text-paper"
            >
              ✓
            </span>
            <h1 className="mt-8 font-display text-[44px] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-ink sm:text-[64px]">
              You&apos;re in<span className="text-electric">.</span>
            </h1>
            <p className="mt-6 text-[18px] leading-[1.55] text-muted">
              Payment confirmed. A welcome email is on its way with kickoff
              dates and your project channel. Expect to hear from your lead
              within one business day.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <PillButton href="/">Back to home</PillButton>
              <a
                href="mailto:hello@footnote.agency"
                className="font-mono text-[13px] uppercase tracking-wide text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-electric"
              >
                email us with questions →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
