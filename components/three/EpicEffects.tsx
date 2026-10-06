"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";

const ACCENT = "#A53D24";

function seededRandom(seed: number) {
  const value = Math.sin(seed * 91.719) * 43758.5453;
  return value - Math.floor(value);
}

function windowWeight(value: number, start: number, end: number, feather = 0.045) {
  const enter = THREE.MathUtils.smoothstep(value, start - feather, start + feather);
  const exit = 1 - THREE.MathUtils.smoothstep(value, end - feather, end + feather);
  return enter * exit;
}

function VelocityField() {
  const lines = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.LineBasicMaterial>(null);
  const positions = useMemo(() => {
    const count = 20;
    const data = new Float32Array(count * 6);
    for (let index = 0; index < count; index += 1) {
      const x = (seededRandom(index + 4) - 0.5) * 30;
      const y = seededRandom(index + 71) * 11 - 2;
      const z = -170 - seededRandom(index + 149) * 248;
      const length = 0.8 + seededRandom(index + 213) * 5.5;
      data[index * 6] = x;
      data[index * 6 + 1] = y;
      data[index * 6 + 2] = z;
      data[index * 6 + 3] = x;
      data[index * 6 + 4] = y;
      data[index * 6 + 5] = z - length;
    }
    return data;
  }, []);

  useFrame(({ clock }, delta) => {
    const { progress, velocity } = scrollStore.getSnapshot();
    if (lines.current) {
      lines.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.09;
      lines.current.rotation.z = THREE.MathUtils.damp(lines.current.rotation.z, THREE.MathUtils.clamp(velocity * -0.00002, -0.012, 0.012), 3, delta);
    }
    if (material.current) {
      const energy = windowWeight(progress, 0.38, 0.92);
      material.current.opacity = THREE.MathUtils.damp(material.current.opacity, energy * (0.045 + Math.min(Math.abs(velocity) * 0.00006, 0.09)), 4, delta);
    }
  });

  return <lineSegments ref={lines} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <lineBasicMaterial ref={material} color="#C47A58" transparent opacity={0} depthWrite={false} />
  </lineSegments>;
}

function TransitionCore() {
  const group = useRef<THREE.Group>(null);
  const materials = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(({ clock }) => {
    const progress = scrollStore.getSnapshot().progress;
    const energy = windowWeight(progress, 0.37, 0.49, 0.035);
    if (group.current) {
      group.current.rotation.z = clock.elapsedTime * 0.09;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.12;
      group.current.scale.setScalar(0.92 + energy * 0.08);
      group.current.visible = energy > 0.01;
    }
    materials.current.forEach((material, index) => { material.opacity = energy * (0.18 + index * 0.07); });
  });

  return <group ref={group} position={[0, 2, -174]}>
    {[3.1, 4.7, 6.6].map((radius, index) => <mesh key={radius} rotation={[0.1 + index * 0.17, index * 0.12, 0]}>
      <torusGeometry args={[radius, 0.035 + index * 0.012, 8, 128]} />
      <meshStandardMaterial ref={(node) => { if (node) materials.current[index] = node; }} color={index === 1 ? "#8A857C" : ACCENT} emissive={index === 1 ? "#211E1A" : "#4A160D"} emissiveIntensity={0.12} roughness={0.42} metalness={0.72} transparent opacity={0} depthWrite={false} />
    </mesh>)}
    <mesh rotation={[0.2, 0.45, 0.18]} castShadow><icosahedronGeometry args={[1.15, 2]} /><meshStandardMaterial color="#A53D24" roughness={0.36} metalness={0.78} /></mesh>
  </group>;
}

function LaunchHalo() {
  const group = useRef<THREE.Group>(null);
  const blue = useRef<THREE.MeshStandardMaterial>(null);
  const white = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const progress = scrollStore.getSnapshot().progress;
    const energy = windowWeight(progress, 0.72, 0.84, 0.035);
    if (group.current) {
      group.current.rotation.z = -clock.elapsedTime * 0.045;
      group.current.scale.setScalar(0.94 + energy * 0.08);
      group.current.visible = energy > 0.01;
    }
    if (blue.current) blue.current.opacity = energy * 0.72;
    if (white.current) white.current.opacity = energy * 0.3;
  });

  return <group ref={group} position={[0, 2.35, -345]}>
    <mesh rotation={[0, 0, 0.08]} castShadow><torusGeometry args={[9.8, 0.075, 12, 160]} /><meshStandardMaterial ref={blue} color="#A53D24" emissive="#4B170D" emissiveIntensity={0.16} roughness={0.4} metalness={0.74} transparent opacity={0} depthWrite={false} /></mesh>
    <mesh rotation={[0.08, 0.14, -0.12]} castShadow><torusGeometry args={[7.7, 0.035, 10, 160]} /><meshStandardMaterial ref={white} color="#9A958C" roughness={0.38} metalness={0.82} transparent opacity={0} depthWrite={false} /></mesh>
    {Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      return <mesh key={index} position={[Math.cos(angle) * 8.75, Math.sin(angle) * 8.75, 0]} rotation={[0, 0, angle]}>
        <boxGeometry args={[0.045, index % 3 === 0 ? 0.9 : 0.38, 0.04]} />
        <meshStandardMaterial color={index % 3 === 0 ? "#B8B3AA" : ACCENT} roughness={0.4} metalness={0.72} transparent opacity={0.62} />
      </mesh>;
    })}
  </group>;
}

function PortalBeams() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const progress = scrollStore.getSnapshot().progress;
    const energy = windowWeight(progress, 0.07, 0.21, 0.03);
    group.current.visible = energy > 0.01;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.008;
  });
  return <group ref={group} position={[0, 1.2, -47]}>
    {[-7.8, -3.2, 3.2, 7.8].map((x, index) => <group key={x} rotation={[0, 0, index % 2 ? 0.006 : -0.006]}>
      {[-5.12, 5.12].map((y) => <mesh key={y} position={[x, y, 0]} castShadow>
        <boxGeometry args={[0.045, 0.06, 36]} />
        <meshStandardMaterial color={index % 2 ? "#A53D24" : "#6F6A62"} emissive={index % 2 ? "#5A1B0F" : "#201F1B"} emissiveIntensity={0.16} roughness={0.42} metalness={0.74} />
      </mesh>)}
    </group>)}
  </group>;
}

export function EpicEffects() {
  return <>
    <PortalBeams />
    <TransitionCore />
    <VelocityField />
    <LaunchHalo />
  </>;
}
