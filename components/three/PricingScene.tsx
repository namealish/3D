"use client";

import { SpatialText } from "./SpatialText";
import { BrushedAluminumMaterial, BurntMetalMaterial, PlasterMaterial, StoneFloorMaterial } from "./SurfaceMaterials";

export function PricingScene() {
  return <group>
    <mesh position={[0, -2.25, -463]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[42, 42]} /><StoneFloorMaterial color="#D5D1C8" roughness={0.66} /></mesh>
    <mesh position={[0, 3.3, -474]} receiveShadow><boxGeometry args={[30, 14, 0.5]} /><PlasterMaterial color="#E0DCD3" /></mesh>
    <SpatialText position={[0, 6.3, -471]} size={0.34} color="#A53D24" outlineWidth={0}>APERTURE AI / PLANS 2026</SpatialText>
    <mesh position={[-4.2, -1.4, -465]} castShadow><boxGeometry args={[7.2, 1.2, 4.6]} /><BrushedAluminumMaterial color="#BDB9B0" roughness={0.48} /></mesh>
    <mesh position={[4.2, -1.4, -465]} castShadow><boxGeometry args={[7.2, 1.2, 4.6]} /><BurntMetalMaterial /></mesh>
    <mesh position={[0, -0.73, -465]} castShadow><boxGeometry args={[16.2, 0.04, 5]} /><BurntMetalMaterial /></mesh>
    <mesh position={[0, 6.9, -471]}><boxGeometry args={[18, 0.035, 0.035]} /><meshStandardMaterial color="#242523" transparent opacity={0.3} roughness={0.72} /></mesh>
  </group>;
}
