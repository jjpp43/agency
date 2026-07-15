"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Hero point-cloud: ~7k dots that assemble into a laptop, scatter, then
 * reassemble into a globe — looping. The morph is a clock-driven `uProgress`
 * uniform (0 = laptop, 1 = globe); a sine-of-progress term blows the points
 * apart at the midpoint and tints them electric while they're in flight.
 *
 * Ink dots on bone, one electric flash mid-scatter — matches the palette.
 * Falls back to a static globe under `prefers-reduced-motion`.
 */

const COUNT = 7000;
const RADIUS = 2.1;

const INK = new THREE.Color("#141310");
const ELECTRIC = new THREE.Color("#2b2bf5");

type ParticleData = {
  laptop: Float32Array;
  globe: Float32Array;
  rand: Float32Array;
};

function buildParticleData(): ParticleData {
  const laptop = new Float32Array(COUNT * 3);
  const globe = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT * 3);

  // Globe — fibonacci sphere for an even distribution.
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    globe[i * 3] = Math.cos(theta) * r * RADIUS;
    globe[i * 3 + 1] = y * RADIUS;
    globe[i * 3 + 2] = Math.sin(theta) * r * RADIUS;
  }

  // Laptop — a base slab + a screen slab tilted back, merged and then
  // surface-sampled so the dots sit on the shell of the shape.
  const baseGeo = new THREE.BoxGeometry(3, 0.16, 2.1);
  baseGeo.translate(0, -0.6, 0.25);
  const screenGeo = new THREE.BoxGeometry(3, 2, 0.12);
  screenGeo.rotateX(-0.32);
  screenGeo.translate(0, 0.42, -0.72);
  const merged = BufferGeometryUtils.mergeGeometries([baseGeo, screenGeo]);
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(merged)).build();
  const p = new THREE.Vector3();
  for (let i = 0; i < COUNT; i++) {
    sampler.sample(p);
    laptop[i * 3] = p.x;
    laptop[i * 3 + 1] = p.y;
    laptop[i * 3 + 2] = p.z;
  }

  // Per-particle random: scatter direction (xyz) doubles as size/phase seed.
  for (let i = 0; i < COUNT; i++) {
    rand[i * 3] = Math.random() * 2 - 1;
    rand[i * 3 + 1] = Math.random() * 2 - 1;
    rand[i * 3 + 2] = Math.random() * 2 - 1;
  }

  baseGeo.dispose();
  screenGeo.dispose();
  merged.dispose();

  return { laptop, globe, rand };
}

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  // position (auto-injected by ShaderMaterial) holds the laptop layout;
  // using it directly avoids a redundant buffer + an unused-attribute warning.
  attribute vec3 aGlobe;
  attribute vec3 aRand;
  varying float vScatter;

  // Cubic ease-in-out: sharper than quadratic — dots dwell longer at each
  // shape and snap through the middle more decisively.
  float easeInOut(float t){
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main(){
    float p = easeInOut(clamp(uProgress, 0.0, 1.0));
    vec3 pos = mix(position, aGlobe, p);

    // Blow apart at the midpoint of the morph.
    float scatter = sin(clamp(uProgress, 0.0, 1.0) * 3.14159265);
    vec3 dir = normalize(aRand + 0.001);
    pos += dir * scatter * (1.3 + aRand.x * 0.6);

    // Gentle idle drift so the assembled shapes never feel frozen.
    pos += 0.03 * vec3(
      sin(uTime * 0.5 + aRand.y * 6.0),
      cos(uTime * 0.4 + aRand.z * 6.0),
      sin(uTime * 0.6 + aRand.x * 6.0)
    );

    vScatter = scatter;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.z * 0.5) * uPixelRatio * (1.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vScatter;

  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, d);
    vec3 col = mix(uColorA, uColorB, vScatter * 0.9);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Morph loop timing (seconds): assemble -> hold -> disperse -> hold.
const MORPH = 3.0;
const HOLD = 1.5;
const LOOP = MORPH * 2 + HOLD * 2;

function Particles({ reduced }: { reduced: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { laptop, globe, rand } = useMemo(buildParticleData, []);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: reduced ? 1 : 0 },
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uColorA: { value: INK },
      uColorB: { value: ELECTRIC },
    }),
    [reduced],
  );

  // Drive progress off the render clock, and write to the *live material's*
  // uniforms via ref — not the memoized `uniforms` prop object, whose identity
  // can diverge from what the committed material actually holds (R3F +
  // StrictMode). Easing + scatter are applied in the vertex shader.
  useFrame((state, delta) => {
    const pts = pointsRef.current;
    const mat = materialRef.current;
    if (!pts || !mat) return;
    mat.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    if (reduced) return;

    const t = state.clock.elapsedTime;
    mat.uniforms.uTime.value = t;

    const phase = t % LOOP;
    let p: number;
    if (phase < MORPH) p = phase / MORPH; // laptop -> globe
    else if (phase < MORPH + HOLD) p = 1; // hold globe
    else if (phase < MORPH * 2 + HOLD)
      p = 1 - (phase - MORPH - HOLD) / MORPH; // globe -> laptop
    else p = 0; // hold laptop
    mat.uniforms.uProgress.value = p;

    pts.rotation.y += delta * 0.14;
  });

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
      rotation={[0.2, 0, 0]}
      scale={0.8}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[laptop, 3]} />
        <bufferAttribute attach="attributes-aGlobe" args={[globe, 3]} />
        <bufferAttribute attach="attributes-aRand" args={[rand, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroParticles() {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Mount after first paint (client-only) so three never blocks the LCP
  // headline, and read the motion preference once we're in the browser.
  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!ready) return null;

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 6.2], fov: 45 }}
    >
      <Particles reduced={reduced} />
    </Canvas>
  );
}
