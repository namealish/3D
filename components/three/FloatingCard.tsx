"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { SpatialText } from "./SpatialText";
import type { Vec3Tuple } from "@/lib/journey";
import { AnodizedMaterial, BrushedAluminumMaterial, BurntMetalMaterial, MatteCharcoalMaterial, PlasterMaterial } from "./SurfaceMaterials";

export function FloatingCard({ position, rotation = [0, 0, 0], size = [7, 4.5], number, title, caption, light = false }: { position: Vec3Tuple; rotation?: Vec3Tuple; size?: [number, number]; number: string; title: string; caption: string; light?: boolean }) {
  const body = useRef<THREE.Group>(null);
  const ink = light ? "#111211" : "#EAE7E0";
  const shadow = light ? "#B7B2A9" : "#080908";
  const titleSize = title.length > 14 ? 0.5 : title.length > 9 ? 0.6 : 0.76;
  const phase = Math.abs(position[0] * 0.73 + position[2] * 0.11);

  useFrame(({ clock, camera }) => {
    if (!body.current) return;
    if (Math.abs(camera.position.z - position[2]) > 72) return;
    const wave = clock.elapsedTime * 0.42 + phase;
    body.current.position.y = Math.sin(wave) * 0.045;
    body.current.rotation.z = Math.sin(wave * 0.63) * 0.004;
  });

  return <group position={position} rotation={rotation}>
    <group ref={body}>
      <RoundedBox position={[0.16, -0.18, -0.16]} args={[size[0], size[1], 0.2]} radius={0.12} smoothness={4} castShadow>{light ? <BrushedAluminumMaterial color={shadow} roughness={0.54} /> : <AnodizedMaterial color={shadow} roughness={0.58} />}</RoundedBox>
      <RoundedBox args={[size[0], size[1], 0.24]} radius={0.12} smoothness={4} castShadow receiveShadow>{light ? <PlasterMaterial color="#D8D5CE" roughness={0.76} /> : <MatteCharcoalMaterial color="#151614" roughness={0.68} />}</RoundedBox>
      <mesh position={[-size[0] / 2 + 0.06, 0, 0.14]} castShadow><boxGeometry args={[0.08, size[1] - 0.35, 0.025]} /><BurntMetalMaterial /></mesh>
      <mesh position={[0, size[1] / 2 - 0.12, 0.14]} castShadow><boxGeometry args={[size[0] - 0.42, 0.035, 0.02]} /><BurntMetalMaterial /></mesh>
      <mesh position={[0, -size[1] / 2 + 0.92, 0.14]}><boxGeometry args={[size[0] - 0.82, 0.018, 0.02]} /><meshStandardMaterial color={ink} transparent opacity={0.18} roughness={0.72} /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * (size[0] / 2 - 0.24), size[1] / 2 - 0.34, 0.15]}><circleGeometry args={[0.055, 16]} /><meshStandardMaterial color={side < 0 ? "#C74C29" : ink} roughness={0.44} metalness={0.58} /></mesh>)}
      <SpatialText position={[-size[0] / 2 + 0.48, size[1] / 2 - 0.58, 0.16]} size={0.25} anchorX="left" color="#C74C29" outlineWidth={0}>{number}</SpatialText>
      <SpatialText position={[-size[0] / 2 + 0.48, 0.23, 0.16]} size={titleSize} anchorX="left" color={ink} outlineWidth={0}>{title}</SpatialText>
      <SpatialText position={[-size[0] / 2 + 0.48, -size[1] / 2 + 0.48, 0.16]} size={0.18} anchorX="left" color={light ? "#55555C" : "#A6A6B0"} outlineWidth={0}>{caption}</SpatialText>
    </group>
  </group>;
}
