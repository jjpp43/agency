"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Eyebrow } from "./ui/primitives";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Project = {
  n: string;
  name: string;
  category: string;
  year: string;
  panel: string; // fallback background (shown until a preview loads)
  fg: string; // foreground text color
  /** Live site URL — the card links here and auto-generates a screenshot. */
  url?: string;
  /** Local screenshot, served from /public (e.g. "/work/kiln.jpg"). */
  image?: string;
  /** CSS object-position for the screenshot. Default "top" (page-top shots). */
  imagePosition?: string;
};

// Real work. Drop a screenshot in /public/work and point `image` at it.
// (Take one at ~1280×1600 for the best fit in the portrait card.)
const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Datacenters.world",
    category: "SaaS",
    year: "'26",
    panel: "var(--color-electric)",
    fg: "var(--color-paper)",
    url: "https://datacenters.world",
    image: "/datacenters.jpeg",
    imagePosition: "center",
  },
  {
    n: "02",
    name: "Oval Financial Forum",
    category: "Finance · Newsletter",
    year: "'25",
    panel: "var(--color-ink)",
    fg: "var(--color-paper)",
    url: "https://ovalfinancialforum.com",
    image: "/work/oval.jpg",
  },
  {
    n: "03",
    name: "Field Notes",
    category: "Editorial · Publication",
    year: "'24",
    panel: "var(--color-paper)",
    fg: "var(--color-ink)",
  },
];

function hostOf(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function WorkGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const track = trackRef.current!;
          const distance = () => track.scrollWidth - window.innerWidth + 48;

          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top top",
              end: () => "+=" + distance(),
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        }
      );
    },
    { scope: ref }
  );

  return (
    <section id="work" ref={ref} className="bg-bone">
      {/* Desktop: pinned horizontal scroll */}
      <div ref={pinRef} className="hidden h-screen overflow-hidden md:block">
        <div
          ref={trackRef}
          className="flex h-full w-max items-center gap-6 px-6 lg:gap-8 lg:px-12"
        >
          {/* Intro panel */}
          <div className="flex h-full w-[46vw] max-w-[560px] flex-col justify-center lg:w-[38vw]">
            <Eyebrow index="03">Selected work</Eyebrow>
            <h2 className="mt-6 font-display text-[64px] font-semibold leading-[0.92] tracking-[-0.03em] text-ink lg:text-[88px]">
              Recent
              <br />
              builds<span className="text-electric">.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[17px] leading-[1.5] text-muted">
              Some list of sites we&apos;ve made.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wide text-faint">
              Scroll <span className="text-electric">→→→</span>
            </span>
          </div>

          {PROJECTS.map((p) => (
            <Card key={p.n} p={p} />
          ))}
        </div>
      </div>

      {/* Mobile: swipeable row */}
      <div className="md:hidden">
        <div className="px-6 pt-20">
          <Eyebrow index="03">Selected work</Eyebrow>
          <h2 className="mt-5 font-display text-[52px] font-semibold leading-[0.94] tracking-[-0.03em] text-ink">
            Recent builds<span className="text-electric">.</span>
          </h2>
        </div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-20 [scrollbar-width:none]">
          {PROJECTS.map((p) => (
            <div key={p.n} className="w-[78vw] shrink-0 snap-center">
              <Card p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ p }: { p: Project }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const src = p.image;
  const showImg = Boolean(src) && !errored;
  const external = Boolean(p.url);
  const host = hostOf(p.url) || p.name.toLowerCase().replace(/\s+/g, "");

  // Hairlines/fills derived from the card's own text color so they adapt
  // to light or dark panels automatically.
  const border = "color-mix(in oklab, currentColor 22%, transparent)";
  const soft = "color-mix(in oklab, currentColor 16%, transparent)";
  const dot = "color-mix(in oklab, currentColor 45%, transparent)";

  return (
    <a
      href={p.url || "#contact"}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-cursor={external ? "Visit" : "View"}
      {...(p.fg.includes("paper") ? { "data-cursor-dark": "" } : {})}
      className="group relative flex aspect-[3/4] w-[74vw] max-w-[440px] shrink-0 flex-col overflow-hidden rounded-lg border md:h-[62vh] md:w-[42vw] md:max-w-[520px] lg:w-[36vw]"
      style={{ background: p.panel, color: p.fg, borderColor: border }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: dot }}
            />
          ))}
        </span>
        <span
          className="flex-1 truncate rounded-full px-3 py-1 text-center font-mono text-[11px] opacity-80"
          style={{ background: soft }}
        >
          {host}
        </span>
      </div>

      {/* Preview — bold name as the base layer; screenshot fades in over it */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <span className="font-display text-[40px] font-semibold leading-[0.95] tracking-tight md:text-[52px]">
            {p.name}
          </span>
        </div>
        {showImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`${p.name} website preview`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            style={{
              opacity: loaded ? 1 : 0,
              objectPosition: p.imagePosition ?? "top",
            }}
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}

        {/* Hover overlay */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "color-mix(in oklab, var(--color-ink) 26%, transparent)",
          }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 font-mono text-[12px] uppercase tracking-wide text-ink">
            {external ? "Visit site" : "Get in touch"}
            <span aria-hidden>↗</span>
          </span>
        </div>
      </div>

      {/* Footer meta */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-4"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="min-w-0">
          {loaded && (
            <h3 className="truncate font-display text-[19px] font-medium tracking-tight">
              {p.name}
            </h3>
          )}
          <p
            className={`truncate font-mono text-[11px] uppercase tracking-wide opacity-70 ${
              loaded ? "mt-0.5" : ""
            }`}
          >
            {p.category}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* <span className="font-mono text-[12px] opacity-70">{p.year}</span> */}
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full border transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            style={{ borderColor: border }}
          >
            ↗
          </span>
        </div>
      </div>
    </a>
  );
}
