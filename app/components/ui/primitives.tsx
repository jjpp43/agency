import type { ReactNode } from "react";

/**
 * Editorial eyebrow — monospace, indexed. Renders as `[ index ] LABEL`.
 */
export function Eyebrow({
  index,
  children,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink ${className}`}
    >
      {index && (
        <span className="inline-flex items-center gap-1 text-electric">
          <span className="text-faint">[</span>
          {index}
          <span className="text-faint">]</span>
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
