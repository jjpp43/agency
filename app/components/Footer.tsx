import Link from "next/link";

const COLS = [
  {
    title: "Studio",
    links: [
      ["Work", "#work"],
      ["Services", "#services"],
      // ["Process", "#process"],
      ["Pricing", "/payment"],
      ["FAQ", "#faq"],
    ],
  },
  {
    title: "Contact",
    links: [
      ["hello@footnote.agency", "mailto:hello@footnote.agency"],
      ["Let's talk", "#contact"],
      ["Instagram", "#"],
      ["LinkedIn", "#"],
    ],
  },
];

export function Footer() {
  return (
    <footer data-cursor-dark className="bg-ink text-paper">
      <div className="mx-auto w-full max-w-[1320px] px-6 pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="max-w-sm font-display text-[24px] font-medium leading-[1.2] tracking-tight text-paper">
              A design &amp; development studio for businesses that refuse to
              look vibe-coded.
            </p>
            <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.1em] text-paper/50">
              Working worldwide
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title} className="md:col-span-3">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/40">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[15px] text-paper/80 transition-colors hover:text-electric"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Oversized wordmark */}
        <div className="mt-16 overflow-hidden">
          {/* <div className="flex items-end justify-between border-t border-paper/15 pt-6">
            <span className="font-display text-[8vw] font-semibold leading-[0.9] tracking-[-0.03em] text-paper">
              Footnote
              <span className="text-electric">[1]</span>
            </span>
          </div> */}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6 font-mono text-[12px] text-paper/50">
          <span>© {new Date().getFullYear()} Footnote Studio LLC</span>
          <span className="flex items-center gap-5">
            <Link href="#" className="transition-colors hover:text-paper">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-paper">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
