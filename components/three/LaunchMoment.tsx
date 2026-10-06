"use client";

import { SpatialText } from "./SpatialText";
import { ContactShadows } from "@react-three/drei";
import { BrushedAluminumMaterial, BurntMetalMaterial, MatteCharcoalMaterial } from "./SurfaceMaterials";

export function LaunchMoment() {
  return <group>
    <mesh position={[0, -2.25, -338]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[46, 50]} /><MatteCharcoalMaterial color="#121310" roughness={0.8} /></mesh>
    <mesh position={[0, 3.5, -350]} receiveShadow><boxGeometry args={[30, 13, 0.5]} /><MatteCharcoalMaterial color="#0E0F0D" roughness={0.82} /></mesh>
    <SpatialText position={[0, 2.6, -341]} size={7.2} color="#C9C5BD" roughness={0.36} metalness={0.78} outlineWidth={0} depth={0.2} sideColor="#4A4741">LAUNCH</SpatialText>
    <SpatialText position={[0, -0.4, -340.8]} size={0.48} color="#C74C29" roughness={0.42} metalness={0.52} outlineWidth={0}>NOW IT HAPPENS.</SpatialText>
    <mesh position={[0, 6.3, -344]} castShadow><boxGeometry args={[24, 0.08, 0.08]} /><BurntMetalMaterial /></mesh>
    <mesh position={[-10.5, 2.2, -344]} castShadow><boxGeometry args={[0.06, 8.2, 0.06]} /><BurntMetalMaterial /></mesh>
    <mesh position={[10.5, 2.2, -344]} castShadow><boxGeometry args={[0.06, 8.2, 0.06]} /><BrushedAluminumMaterial color="#77736C" transparent opacity={0.52} /></mesh>
    {[-7, -3.5, 0, 3.5, 7].map((x) => <mesh key={x} position={[x, -1.85, -343.9]} castShadow><boxGeometry args={[0.04, 0.5, 0.04]} /><BurntMetalMaterial /></mesh>)}
    <ContactShadows position={[0, -2.17, -341]} opacity={0.3} scale={28} blur={2.6} far={8} frames={1} color="#080908" />
  </group>;
}
