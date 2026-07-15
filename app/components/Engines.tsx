const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Figma",
  "Tailwind",
  "GSAP",
  "Sanity",
  "Webflow",
  "Vercel",
];

export function Engines() {
  return (
    <section className="border-b border-line bg-bone py-8">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-6 md:flex-row md:items-center md:justify-between">
        <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
          Built on the modern web stack
        </p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {STACK.map((tool) => (
            <li
              key={tool}
              className="font-display text-[17px] font-medium tracking-tight text-ink-soft"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
