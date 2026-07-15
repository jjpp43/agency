"use client";

import { useEffect, useRef } from "react";

/**
 * The mark, drawn the way the hero draws.
 *
 * Same grammar as `hero/HeroParticles`: every dot holds a target per state,
 * the cloud flies apart hardest at the midpoint of a move, and dots flash
 * electric while they're in flight. In 2D canvas rather than WebGL, though —
 * three is the hero's alone (see CLAUDE.md), and a 260px mark has no business
 * opening a second GL context.
 *
 * The shape is the layers a site is actually made of: four flat planes stacked
 * in axonometric, one per service, and the selected one slides out and fills.
 * A fill needs far more dots than an edge does, so changing service makes the
 * electric mass travel bodily up or down the stack to its new layer rather
 * than just recolouring in place.
 */

const FILL_DOTS = 260;
const EDGE_DOTS = 78;
const COUNT = FILL_DOTS + EDGE_DOTS * 3;

const MORPH_MS = 700;
/** How far a dot may stray at the midpoint, px. Mirrors the hero's `dir * scatter * (1.3 + aRand.x * 0.6)`. */
const SCATTER_PX = 26;
/** Idle breathing, so the cloud isn't dead between moves. */
const DRIFT_PX = 0.7;

// 2:1 axonometric. A plane of side w projects to 2*w*COS across and w wide.
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

type Geom = {
  cx: number;
  cy: number;
  /** plane side, world units */
  w: number;
  /** vertical gap between layers, screen px */
  sp: number;
  /** how far the selected layer pulls out of the stack, screen px */
  slide: number;
};

function geometry(size: number): Geom {
  const w = size * 0.28;
  return {
    // nudged right to pay back the leftward slide of the selected layer
    cx: size * 0.57,
    cy: size / 2,
    w,
    // must exceed the plane's projected height (w * SIN) or the layers overlap
    // and the top one swallows every hover
    sp: size * 0.16,
    slide: size * 0.15,
  };
}

/** Height of layer li, screen px. 0 is the bottom of the stack. */
const layerY = (li: number, g: Geom) => (li - 1.5) * g.sp;

/** One target set per service: layer s filled and pulled out, the rest as edges. */
function buildTargets(g: Geom) {
  return Array.from({ length: 4 }, (_, s) => {
    const t = new Float32Array(COUNT * 2);
    let k = 0;
    const place = (li: number, fill: boolean, n: number) => {
      const y = layerY(li, g);
      const slide = li === s ? -g.slide : 0;
      for (let i = 0; i < n; i++) {
        let x: number;
        let z: number;
        if (fill) {
          x = (Math.random() - 0.5) * g.w;
          z = (Math.random() - 0.5) * g.w;
        } else {
          const e = Math.random() * 4;
          const side = Math.floor(e);
          const u = ((e % 1) - 0.5) * g.w;
          if (side === 0) [x, z] = [u, -g.w / 2];
          else if (side === 1) [x, z] = [g.w / 2, u];
          else if (side === 2) [x, z] = [u, g.w / 2];
          else [x, z] = [-g.w / 2, u];
        }
        t[k++] = g.cx + (x - z) * COS + slide;
        t[k++] = g.cy + (x + z) * SIN - y;
      }
    };
    // Order matters: dots 0..FILL_DOTS-1 are the filled layer in every set,
    // which is what keeps the electric block coherent while it travels.
    place(s, true, FILL_DOTS);
    for (let d = 1; d <= 3; d++) place((s + d) % 4, false, EDGE_DOTS);
    return t;
  });
}

/** Which layer is under a point, or -1. Topmost wins, as it would visually. */
function layerAt(px: number, py: number, g: Geom, active: number) {
  for (let li = 3; li >= 0; li--) {
    const sx = px - g.cx - (li === active ? -g.slide : 0);
    const sy = py - g.cy + layerY(li, g);
    // invert the projection: sx = (x - z) * COS, sy = (x + z) * SIN
    const a = sx / COS;
    const b = sy / SIN;
    const x = (a + b) / 2;
    const z = (b - a) / 2;
    if (Math.abs(x) <= g.w / 2 && Math.abs(z) <= g.w / 2) return li;
  }
  return -1;
}

type RGB = [number, number, number];

const hex = (value: string, fallback: string): RGB => {
  const s = (value || fallback).trim().replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
};

const rgb = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

const mix = (a: RGB, b: RGB, t: number) =>
  rgb([
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]);

const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

export function ServiceMark({
  active,
  onHover,
}: {
  active: number;
  onHover: (i: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const morphRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    // muted, not faint: at 1px on bone, faint dots barely register and the
    // unselected layers stop reading as planes
    const RESTING = hex(css.getPropertyValue("--color-muted"), "#6b675e");
    const ELECTRIC = hex(css.getPropertyValue("--color-electric"), "#2b2bf5");
    const electricCss = rgb(ELECTRIC);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let targets: Float32Array[] = [];
    let cur = new Float32Array(COUNT * 2);
    let from = new Float32Array(COUNT * 2);
    let geom: Geom | null = null;
    let started = -1; // -1 = settled
    let size = 0;
    let visible = true;

    // per dot: scatter direction x, y, and a size/phase seed
    const rand = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const m = 0.6 + Math.random() * 0.8;
      rand[i * 3] = Math.cos(a) * m;
      rand[i * 3 + 1] = Math.sin(a) * m;
      rand[i * 3 + 2] = Math.random();
    }

    const layout = () => {
      const next = box.clientWidth;
      if (!next || next === size) return;
      size = next;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geom = geometry(size);
      targets = buildTargets(geom);
      cur = Float32Array.from(targets[activeRef.current]);
      from = Float32Array.from(cur);
      started = -1;
    };
    layout();

    morphRef.current = () => {
      if (!targets.length) return;
      if (reduced) {
        cur = Float32Array.from(targets[activeRef.current]);
        return;
      }
      from = Float32Array.from(cur);
      started = performance.now();
    };

    let raf = requestAnimationFrame(function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible || !targets.length) return;

      const target = targets[activeRef.current];
      let scatter = 0;
      if (started >= 0) {
        const p = Math.min(1, (now - started) / MORPH_MS);
        const e = easeInOutCubic(p);
        scatter = Math.sin(p * Math.PI);
        for (let i = 0; i < COUNT; i++) {
          const j = i * 2;
          cur[j] = from[j] + (target[j] - from[j]) * e;
          cur[j + 1] = from[j + 1] + (target[j + 1] - from[j + 1]) * e;
        }
        if (p >= 1) started = -1;
      }

      ctx.clearRect(0, 0, size, size);

      const draw = (lo: number, hi: number) => {
        for (let i = lo; i < hi; i++) {
          const j = i * 2;
          const seed = rand[i * 3 + 2];
          const drift = reduced
            ? 0
            : Math.sin(now * 0.0009 + seed * 6.283) * DRIFT_PX;
          ctx.beginPath();
          ctx.arc(
            cur[j] + rand[i * 3] * scatter * SCATTER_PX + drift,
            cur[j + 1] + rand[i * 3 + 1] * scatter * SCATTER_PX + drift,
            0.9 + seed * 0.7,
            0,
            6.283185,
          );
          ctx.fill();
        }
      };

      // scatter is global (as it is in the hero's shader), so the whole cloud
      // needs exactly two fills per frame
      ctx.fillStyle = mix(RESTING, ELECTRIC, scatter * 0.9);
      draw(FILL_DOTS, COUNT);
      ctx.fillStyle = electricCss;
      draw(0, FILL_DOTS);
    });

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "200px" },
    );
    io.observe(box);
    const ro = new ResizeObserver(layout);
    ro.observe(box);

    const onMove = (e: MouseEvent) => {
      if (!geom) return;
      const r = canvas.getBoundingClientRect();
      const li = layerAt(
        e.clientX - r.left,
        e.clientY - r.top,
        geom,
        activeRef.current,
      );
      if (li >= 0 && li !== activeRef.current) onHover(li);
    };
    canvas.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      morphRef.current = () => {};
    };
  }, [onHover]);

  const first = useRef(true);
  useEffect(() => {
    activeRef.current = active;
    // don't scatter on mount — there's nowhere to travel from
    if (first.current) {
      first.current = false;
      return;
    }
    morphRef.current();
  }, [active]);

  return (
    // Decorative: the list beside it is the real control and says the same
    // thing in words. Hovering a layer is a mouse-only shortcut to it.
    <div
      ref={boxRef}
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[260px]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
