"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { BookingButton } from "./booking/BookingButton";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  // { href: "#process", label: "Process" },
  { href: "/payment", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-bone/85 backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-6">
        <Link
          href="/"
          aria-label="Footnote home"
          className="group inline-flex items-baseline font-display text-[21px] font-semibold leading-none tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          Footnote
          <sup className="ml-[1px] font-mono text-[10px] font-medium text-electric">
            [1]
          </sup>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative font-mono text-[12px] uppercase tracking-[0.08em] text-ink"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-electric transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex">
            <BookingButton className="h-10 px-5 text-[13px]">
              Let&apos;s talk
            </BookingButton>
          </span>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-11 w-11 place-items-center text-ink md:hidden"
          >
            <span className="relative block h-3.5 w-6">
              <motion.span
                className="absolute left-0 right-0 top-0 h-[2px] origin-center bg-ink"
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              />
              <motion.span
                className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-ink"
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="absolute left-0 right-0 bottom-0 h-[2px] origin-center bg-ink"
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-line bg-bone md:hidden"
          >
            <nav className="flex flex-col px-6 py-4">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: EASE, delay: 0.04 + i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-line py-4 font-display text-[26px] font-medium tracking-tight text-ink"
                  >
                    {item.label}
                    <span aria-hidden className="text-electric">
                      ↗
                    </span>
                  </Link>
                </motion.div>
              ))}
              <div className="pt-5">
                <BookingButton className="w-full">Let&apos;s talk</BookingButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
