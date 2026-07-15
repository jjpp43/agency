"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useBookingModal } from "./BookingModalProvider";
import { Magnetic } from "../gsap/Magnetic";

type Variant = "default" | "ghost" | "light";

export function BookingButton({
  children,
  variant = "default",
  className = "",
  magnetic = false,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  magnetic?: boolean;
}) {
  const { open } = useBookingModal();

  const base =
    "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-pill px-7 text-[15px] font-medium tracking-tight";

  const skin =
    variant === "ghost"
      ? "border border-ink text-ink hover:text-paper"
      : variant === "light"
        ? "bg-paper text-ink"
        : "bg-ink text-paper";

  const wash = variant === "ghost" ? "bg-ink" : "bg-electric";

  const button = (
    <button
      type="button"
      onClick={open}
      className={`${base} ${skin} ${className}`}
    >
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 translate-y-full ${wash} transition-transform duration-300 ease-out group-hover:translate-y-0`}
      />
      <span className="relative">{children}</span>
      <ArrowUpRight className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );

  return magnetic ? <Magnetic strength={0.35}>{button}</Magnetic> : button;
}
