import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PillButton } from "../components/Buttons";
import { Reveal } from "../components/gsap/Reveal";
import { SplitReveal } from "../components/gsap/SplitReveal";
import { Eyebrow } from "../components/ui/primitives";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  // NOTE: env keys are legacy identifiers — they map to the three Polar
  // products (slot 1 / 2 / 3), regardless of the display name.
  productEnvKey:
    | "NEXT_PUBLIC_POLAR_AUDIT_PRODUCT_ID"
    | "NEXT_PUBLIC_POLAR_PILOT_PRODUCT_ID"
    | "NEXT_PUBLIC_POLAR_FULLSTACK_PRODUCT_ID";
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Landing",
    price: "$2,500",
    cadence: "one-time",
    blurb:
      "A single, high-converting page. Designed, built, and shipped in about two weeks.",
    features: [
      "Custom one-page design",
      "Built in Next.js, deployed on Vercel",
      "Responsive + accessible",
      "Basic analytics wired up",
      "~2 week turnaround",
    ],
    productEnvKey: "NEXT_PUBLIC_POLAR_AUDIT_PRODUCT_ID",
  },
  {
    name: "Marketing Site",
    price: "$6,000",
    cadence: "per project",
    blurb:
      "A full multi-page site with a CMS your team can run. Our most popular engagement.",
    features: [
      "5–8 custom-designed pages",
      "Headless CMS (Sanity) or Webflow",
      "Motion & micro-interactions",
      "Performance-tuned (90+ Lighthouse)",
      "Handover walkthrough + docs",
      "~4–6 week turnaround",
    ],
    productEnvKey: "NEXT_PUBLIC_POLAR_PILOT_PRODUCT_ID",
    highlight: true,
  },
  {
    name: "Custom Build",
    price: "$15k+",
    cadence: "per project",
    blurb:
      "Bespoke design and development for larger sites, web apps, and full rebrands.",
    features: [
      "Unlimited custom pages",
      "Web app features & integrations",
      "Brand & identity work included",
      "Advanced motion / interaction",
      "Dedicated project lead",
      "Ongoing care plan available",
    ],
    productEnvKey: "NEXT_PUBLIC_POLAR_FULLSTACK_PRODUCT_ID",
  },
];

export default function PaymentPage() {
  return (
    <>
      <Header />
      <main className="w-full min-w-0 flex-1 overflow-x-clip">
        <section className="relative overflow-hidden border-b border-line pt-32 pb-24 sm:pt-40 sm:pb-32">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto w-full max-w-[1320px] px-6">
            <div className="max-w-3xl">
              <Eyebrow index="$">Pricing</Eyebrow>
              <SplitReveal
                as="h1"
                scroll={false}
                className="mt-6 font-display font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-ink"
              >
                <span
                  className="block"
                  style={{ fontSize: "clamp(44px, 8vw, 104px)" }}
                >
                  Straightforward
                </span>
                <span
                  className="block"
                  style={{ fontSize: "clamp(44px, 8vw, 104px)" }}
                >
                  pricing<span className="text-electric">.</span>
                </span>
              </SplitReveal>
              <p className="mt-6 max-w-xl text-[18px] leading-[1.5] text-muted">
                Fixed fees, scoped up front, no surprise invoices.
              </p>
            </div>

            <Reveal
              className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              stagger={0.1}
            >
              {TIERS.map((t) => (
                <TierCard key={t.name} tier={t} />
              ))}
            </Reveal>

            <Reveal className="mt-14">
              <p className="text-[15px] text-muted">
                Something bigger or bespoke?{" "}
                <a
                  href="mailto:hello@footnote.agency"
                  className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-electric"
                >
                  Email us
                </a>{" "}
                and we&apos;ll scope enterprise and multi-site work
                individually.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const productId = process.env[tier.productEnvKey];
  const checkoutHref = productId
    ? `/api/checkout?products=${productId}`
    : "/payment#missing-config";
  const isConfigured = Boolean(productId);

  return (
    <div
      {...(tier.highlight ? { "data-cursor-dark": "" } : {})}
      className={`group relative flex h-full flex-col p-8 transition-colors duration-300 sm:p-9 ${
        tier.highlight
          ? "bg-ink text-paper"
          : "border border-ink bg-paper text-ink"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[26px] font-semibold tracking-tight">
          {tier.name}
        </h2>
        {tier.highlight && (
          <span className="border border-paper/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-electric">
            Popular
          </span>
        )}
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-[46px] font-semibold leading-none tracking-tight">
          {tier.price}
        </span>
        <span
          className={`text-[14px] ${
            tier.highlight ? "text-paper/60" : "text-muted"
          }`}
        >
          {tier.cadence}
        </span>
      </div>
      <p
        className={`mt-4 text-[15px] leading-[1.55] ${
          tier.highlight ? "text-paper/70" : "text-muted"
        }`}
      >
        {tier.blurb}
      </p>
      <ul
        className={`mt-6 space-y-3 border-t pt-6 text-[14px] ${
          tier.highlight ? "border-paper/15" : "border-line"
        }`}
      >
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rotate-45 bg-electric"
            />
            <span
              className={tier.highlight ? "text-paper/85" : "text-ink-soft"}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {isConfigured ? (
          tier.highlight ? (
            <Link
              href={checkoutHref}
              prefetch={false}
              data-cursor="Go"
              className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-pill bg-paper px-7 py-3.5 text-[15px] font-medium text-ink"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 translate-y-full bg-electric transition-transform duration-300 ease-out group-hover/btn:translate-y-0"
              />
              Choose {tier.name}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              >
                →
              </span>
            </Link>
          ) : (
            <PillButton href={checkoutHref} prefetch={false} className="w-full">
              Choose {tier.name}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </PillButton>
          )
        ) : (
          <span
            id="missing-config"
            className={`flex w-full cursor-not-allowed items-center justify-center rounded-pill border px-6 py-3.5 text-[15px] opacity-70 ${
              tier.highlight
                ? "border-paper/30 text-paper/70"
                : "border-line text-muted"
            }`}
          >
            Configure product ID
          </span>
        )}
      </div>
    </div>
  );
}
