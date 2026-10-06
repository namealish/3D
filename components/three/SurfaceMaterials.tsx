"use client";

import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

function makeNoiseTexture(size: number, directional = false) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const seed = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453;
      const random = seed - Math.floor(seed);
      const grain = directional ? 0.62 * random + 0.38 * (Math.sin(y * 0.72) * 0.5 + 0.5) : random;
      // Keep the variation just strong enough to catch grazing light. The
      // material should read as stone or brushed metal, never as visible noise.
      const value = Math.round(124 + grain * 20);
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(directional ? 7 : 5, directional ? 18 : 5);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

const plasterNoise = makeNoiseTexture(128);
const brushedNoise = makeNoiseTexture(128, true);

type StandardProps = ThreeElements["meshStandardMaterial"];
type PhysicalProps = ThreeElements["meshPhysicalMaterial"];

export function PlasterMaterial(props: StandardProps) {
  return <meshStandardMaterial color="#D8D5CE" roughness={0.84} metalness={0.015} roughnessMap={plasterNoise} bumpMap={plasterNoise} bumpScale={0.006} {...props} />;
}

export function StoneFloorMaterial(props: PhysicalProps) {
  return <meshPhysicalMaterial color="#CBC7BE" roughness={0.58} metalness={0.03} roughnessMap={plasterNoise} bumpMap={plasterNoise} bumpScale={0.004} clearcoat={0.16} clearcoatRoughness={0.64} {...props} />;
}

export function BrushedAluminumMaterial(props: PhysicalProps) {
  return <meshPhysicalMaterial color="#AAA8A2" roughness={0.38} metalness={0.92} roughnessMap={brushedNoise} bumpMap={brushedNoise} bumpScale={0.0025} clearcoat={0.12} clearcoatRoughness={0.48} {...props} />;
}

export function AnodizedMaterial(props: PhysicalProps) {
  return <meshPhysicalMaterial color="#181A18" roughness={0.46} metalness={0.86} roughnessMap={brushedNoise} bumpMap={brushedNoise} bumpScale={0.002} clearcoat={0.18} clearcoatRoughness={0.42} {...props} />;
}

export function BurntMetalMaterial(props: PhysicalProps) {
  return <meshPhysicalMaterial color="#A53D24" roughness={0.42} metalness={0.76} roughnessMap={brushedNoise} bumpMap={brushedNoise} bumpScale={0.0025} clearcoat={0.14} clearcoatRoughness={0.48} {...props} />;
}

export function MatteCharcoalMaterial(props: StandardProps) {
  return <meshStandardMaterial color="#111211" roughness={0.78} metalness={0.12} roughnessMap={plasterNoise} bumpMap={plasterNoise} bumpScale={0.003} {...props} />;
}

export function SmokedGlassMaterial(props: PhysicalProps) {
  return <meshPhysicalMaterial color="#242523" roughness={0.16} metalness={0.08} transmission={0.12} thickness={0.18} transparent opacity={0.78} clearcoat={0.72} clearcoatRoughness={0.14} {...props} />;
}

export function ScreenGlassMaterial(props: PhysicalProps) {
  return <meshPhysicalMaterial color="#171816" emissive="#3A160C" emissiveIntensity={0.16} roughness={0.12} metalness={0.06} transparent opacity={0.92} clearcoat={0.86} clearcoatRoughness={0.1} {...props} />;
}
