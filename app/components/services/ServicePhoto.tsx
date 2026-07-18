"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A photo slot for the services steps, with a placeholder standing in until a
 * real image exists. Drop a file at the `src` path and it takes over on the
 * next load — no code change — the same load/error pattern the work cards use.
 *
 * The placeholder is deliberately plain: hairline frame, crop corners, and the
 * subject it's waiting for, in the palette's own tokens. It should read as
 * "a photo belongs here", not as a designed element worth keeping.
 */

export type Shot = {
  /** Where to drop the real photo. */
  src: string;
  /** What the frame is waiting for — shown on the placeholder. */
  subject: string;
  /** Alt text once the real photo lands. */
  alt: string;
  /** object-position, when centring the crop wastes the frame. */
  position?: string;
};

export function ServicePhoto({
  shot,
  className = "",
}: {
  shot: Shot;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The <img> is in the server-rendered HTML, so it can finish loading before
  // hydration attaches onLoad — in which case that event never fires and the
  // placeholder would sit on top of a perfectly good photo. Settle it from the
  // element's own state on mount instead of waiting for the event.
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(true);
    else setErrored(true);
  }, []);

  return (
    // hairline stays under the photo too: these frames run high-key, and
    // without an edge they dissolve into the bone page
    <figure
      className={`relative overflow-hidden border border-line bg-bone ${className}`}
    >
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={shot.src}
          alt={shot.alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            objectPosition: shot.position ?? "center",
            // Sit the photo in the bone/ink palette: sepia warms it off neutral
            // grey, and the contrast/brightness pair stops a high-key frame
            // washing out against the bone page. Tuned against a black-and-
            // white source, so there's no grayscale() here — it would be a
            // no-op on one and could flatten a colour photo later.
            filter: "sepia(0.16) contrast(1.14) brightness(0.95) saturate(0.85)",
          }}
        />
      )}

      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col justify-between border border-line p-3"
        >
          {/* crop corners, so the empty frame still reads as a considered space */}
          <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-line-strong" />
          <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-line-strong" />
          <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-line-strong" />
          <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-line-strong" />

          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            Photo
          </span>
          <span className="max-w-[22ch] text-pretty font-mono text-[10px] uppercase leading-[1.5] tracking-[0.08em] text-muted">
            {shot.subject}
          </span>
        </div>
      )}
    </figure>
  );
}
