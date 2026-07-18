/**
 * The hero shape, in one place. Both renderers draw the same laptop ⇄ globe —
 * three.js on lg+ (`HeroParticles`), a 2D canvas on small screens
 * (`HeroDots`) — so the dimensions live here rather than in either of them.
 * Sampling differs (three uses MeshSurfaceSampler; the 2D path samples box
 * faces analytically, which keeps three off the mobile bundle entirely), but
 * the geometry it samples is identical.
 */

export const RADIUS = 2.1;

/** The laptop: a base slab and a screen slab tilted back on X. */
export const LAPTOP = {
  base: {
    size: [3, 0.16, 2.1] as const,
    pos: [0, -0.6, 0.25] as const,
    rotX: 0,
  },
  screen: {
    size: [3, 2, 0.12] as const,
    pos: [0, 0.42, -0.72] as const,
    rotX: -0.32,
  },
} as const;

type Slab = { size: readonly [number, number, number]; pos: readonly [number, number, number]; rotX: number };

/** Fibonacci sphere — an even distribution, no clustering at the poles. */
export function buildGlobe(count: number, out = new Float32Array(count * 3)) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out[i * 3] = Math.cos(theta) * r * RADIUS;
    out[i * 3 + 1] = y * RADIUS;
    out[i * 3 + 2] = Math.sin(theta) * r * RADIUS;
  }
  return out;
}

/** Area-weighted random point on a box's surface, in the box's local space. */
function sampleBoxSurface(w: number, h: number, d: number, o: number[]) {
  const xy = w * h;
  const xz = w * d;
  const yz = h * d;
  const pick = Math.random() * (xy + xz + yz) * 2;
  const r1 = Math.random() - 0.5;
  const r2 = Math.random() - 0.5;
  const side = Math.random() < 0.5 ? -0.5 : 0.5;
  if (pick < xy * 2) {
    o[0] = r1 * w;
    o[1] = r2 * h;
    o[2] = side * d;
  } else if (pick < (xy + xz) * 2) {
    o[0] = r1 * w;
    o[1] = side * h;
    o[2] = r2 * d;
  } else {
    o[0] = side * w;
    o[1] = r1 * h;
    o[2] = r2 * d;
  }
}

function place(slab: Slab, o: number[]) {
  const [w, h, d] = slab.size;
  sampleBoxSurface(w, h, d, o);
  if (slab.rotX) {
    const c = Math.cos(slab.rotX);
    const s = Math.sin(slab.rotX);
    const y = o[1];
    const z = o[2];
    o[1] = y * c - z * s;
    o[2] = y * s + z * c;
  }
  o[0] += slab.pos[0];
  o[1] += slab.pos[1];
  o[2] += slab.pos[2];
}

/** Surface-sampled laptop, dots split between the slabs by surface area. */
export function buildLaptop(count: number, out = new Float32Array(count * 3)) {
  const area = (s: Slab) => {
    const [w, h, d] = s.size;
    return 2 * (w * h + w * d + h * d);
  };
  const aBase = area(LAPTOP.base);
  const share = aBase / (aBase + area(LAPTOP.screen));
  const o = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    place(Math.random() < share ? LAPTOP.base : LAPTOP.screen, o);
    out[i * 3] = o[0];
    out[i * 3 + 1] = o[1];
    out[i * 3 + 2] = o[2];
  }
  return out;
}

/** Morph loop timing (seconds): assemble → hold → disperse → hold. */
export const MORPH = 3.0;
export const HOLD = 1.5;
export const LOOP = MORPH * 2 + HOLD * 2;

/** Where in the loop are we? 0 = laptop, 1 = globe. */
export function loopProgress(t: number) {
  const phase = t % LOOP;
  if (phase < MORPH) return phase / MORPH;
  if (phase < MORPH + HOLD) return 1;
  if (phase < MORPH * 2 + HOLD) return 1 - (phase - MORPH - HOLD) / MORPH;
  return 0;
}

/** Cubic ease-in-out — matches the vertex shader's `easeInOut`. */
export function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
