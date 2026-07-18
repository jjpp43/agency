"use client";

import { useEffect, useRef } from "react";
import {
  buildGlobe,
  buildLaptop,
  easeInOut,
  loopProgress,
} from "./shape";

/**
 * The hero point-cloud for small screens: the same laptop ⇄ globe morph as the
 * lg+ WebGL version, drawn on a 2D canvas. Same shape, same loop timing, same
 * palette (ink dots, electric while they're in flight) — a few KB instead of
 * three.js, and no WebGL context on a phone.
 *
 * The projection mirrors the vertex shader: mix by a cubic ease, blow the
 * points apart on a sine of progress, drift gently at rest, and spin slowly on
 * Y. Dots are batched into three depth buckets so the whole frame costs three
 * fills rather than one per dot. Decorative — aria-hidden.
 */

const COUNT = 3200;
const CAM_Z = 6.2; // matches the R3F camera
const SCALE = 0.8; // matches the <points> scale
const TILT = 0.2; // matches the <points> rotation.x
const SPIN = 0.14; // rad/sec, matches the desktop rotation.y

const INK = [20, 19, 16] as const;
const ELECTRIC = [43, 43, 245] as const;
// Depth buckets: nearer dots read stronger, which gives the cloud its volume.
// Weighted to match the lg+ cloud, which is near-solid ink on bone.
const BUCKET_ALPHA = [0.55, 0.8, 1];

export function HeroDots({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;

    const laptop = buildLaptop(COUNT);
    const globe = buildGlobe(COUNT);
    // per-dot scatter direction (normalised) + a size/phase seed
    const rand = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      const len = Math.hypot(x, y, z) || 1;
      rand[i * 3] = x / len;
      rand[i * 3 + 1] = y / len;
      rand[i * 3 + 2] = z / len;
    }

    let ctx: CanvasRenderingContext2D | null = null;
    let lastW = 0;
    let lastH = 0;
    let spin = 0;

    const draw = (p: number, t: number) => {
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      if (W < 20 || H < 20) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (W !== lastW || H !== lastH) {
        cv.width = W * dpr;
        cv.height = H * dpr;
        ctx = cv.getContext("2d");
        ctx?.scale(dpr, dpr);
        lastW = W;
        lastH = H;
      }
      const c = ctx;
      if (!c) return;
      c.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      // Focal length from the smaller axis so the cloud keeps its scale in a
      // short wide band as well as a tall column.
      const focal = Math.min(W, H) * 1.35;

      const eased = easeInOut(Math.min(1, Math.max(0, p)));
      const scatter = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
      const kick = scatter;

      const mix = scatter * 0.9;
      const col = INK.map((a, i) => Math.round(a + (ELECTRIC[i] - a) * mix));
      const rgb = `${col[0]},${col[1]},${col[2]}`;

      const sinS = Math.sin(spin);
      const cosS = Math.cos(spin);
      const sinT = Math.sin(TILT);
      const cosT = Math.cos(TILT);

      const buckets: Path2D[] = [new Path2D(), new Path2D(), new Path2D()];

      for (let i = 0; i < COUNT; i++) {
        const j = i * 3;
        let x = laptop[j] + (globe[j] - laptop[j]) * eased;
        let y = laptop[j + 1] + (globe[j + 1] - laptop[j + 1]) * eased;
        let z = laptop[j + 2] + (globe[j + 2] - laptop[j + 2]) * eased;

        // blow apart through the middle of the morph
        const push = kick * (1.3 + rand[j] * 0.6);
        x += rand[j] * push;
        y += rand[j + 1] * push;
        z += rand[j + 2] * push;

        // gentle idle drift so the assembled shapes never feel frozen
        x += 0.03 * Math.sin(t * 0.5 + rand[j + 1] * 6);
        y += 0.03 * Math.cos(t * 0.4 + rand[j + 2] * 6);
        z += 0.03 * Math.sin(t * 0.6 + rand[j] * 6);

        // spin on Y, then the fixed X tilt
        const rx = x * cosS + z * sinS;
        const rz = -x * sinS + z * cosS;
        const ry = y * cosT - rz * sinT;
        const rz2 = y * sinT + rz * cosT;

        const depth = CAM_Z - rz2 * SCALE;
        if (depth < 0.4) continue;
        const k = focal / depth;
        const sx = cx + rx * SCALE * k;
        const sy = cy - ry * SCALE * k;
        const r = (0.5 + rand[j + 2] * 0.45) * k * 0.0135;
        if (r < 0.15) continue;

        // nearer dots land in a stronger bucket
        const b = rz2 > 0.7 ? 2 : rz2 > -0.7 ? 1 : 0;
        buckets[b].moveTo(sx + r, sy);
        buckets[b].arc(sx, sy, r, 0, Math.PI * 2);
      }

      for (let b = 0; b < 3; b++) {
        c.fillStyle = `rgba(${rgb},${BUCKET_ALPHA[b]})`;
        c.fill(buckets[b]);
      }
    };

    // Reduced motion: paint the assembled globe once (and on resize), no loop.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const paint = () => draw(1, 0);
      paint();
      const ro = new ResizeObserver(paint);
      ro.observe(cv);
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spin += dt * SPIN;
      const t = now / 1000;
      draw(loopProgress(t), t);
      raf = requestAnimationFrame(loop);
    };

    // Only animate while the hero is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(cv);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
