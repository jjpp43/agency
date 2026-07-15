import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type LinkProps = ComponentProps<typeof Link>;

/** Solid ink CTA that flips to electric on hover. */
export function PillButton({
  children,
  className = "",
  ...props
}: LinkProps & { children: ReactNode }) {
  return (
    <Link
      {...props}
      data-cursor="Go"
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill bg-ink px-7 py-3.5 text-[15px] font-medium text-paper ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 translate-y-full bg-electric transition-transform duration-300 ease-out group-hover:translate-y-0"
      />
      {children}
    </Link>
  );
}

/** Outline button — hairline on bone, fills ink on hover. */
export function GhostButton({
  children,
  className = "",
  ...props
}: LinkProps & { children: ReactNode }) {
  return (
    <Link
      {...props}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill border border-ink px-7 py-3.5 text-[15px] font-medium text-ink transition-colors duration-300 hover:text-paper ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 translate-y-full bg-ink transition-transform duration-300 ease-out group-hover:translate-y-0"
      />
      {children}
    </Link>
  );
}

export function TextLink({
  children,
  className = "",
  ...props
}: LinkProps & { children: ReactNode }) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center gap-1 text-ink underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-electric ${className}`}
    >
      {children}
    </Link>
  );
}
