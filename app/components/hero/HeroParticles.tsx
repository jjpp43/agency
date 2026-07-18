"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LAPTOP, buildGlobe, loopProgress } from "./shape";

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
  buildGlobe(COUNT, globe);

  // Laptop — a base slab + a screen slab tilted back, merged and then
  // surface-sampled so the dots sit on the shell of the shape. Dimensions come
  // from ./shape so the 2D mobile renderer draws the same object.
  const baseGeo = new THREE.BoxGeometry(...LAPTOP.base.size);
  baseGeo.translate(...LAPTOP.base.pos);
  const screenGeo = new THREE.BoxGeometry(...LAPTOP.screen.size);
  screenGeo.rotateX(LAPTOP.screen.rotX);
  screenGeo.translate(...LAPTOP.screen.pos);
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

    mat.uniforms.uProgress.value = loopProgress(t);

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

/**
 * Can this browser actually give us a context? WebGL can be switched off,
 * blocklisted on old GPUs, or simply exhausted if a page holds too many
 * contexts. Mounting <Canvas> anyway makes three throw where nothing catches
 * it, which surfaces as an unhandled rejection and takes the hero with it.
 * Probe first, and hand the context straight back.
 */
function canRenderWebGL() {
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ??
      (probe.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function HeroParticles() {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Mount after first paint (client-only) so three never blocks the LCP
  // headline, and read the motion preference once we're in the browser.
  //
  // Only rendered on lg+ — Hero gates this at the call site, because the width
  // check has to happen *before* next/dynamic fetches the chunk. Small screens
  // get the 2D <HeroDots> instead.
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!canRenderWebGL()) return;
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // No context, no dot cloud.
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
