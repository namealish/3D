"use client";

import { SpatialText } from "./SpatialText";
import { FloatingCard } from "./FloatingCard";
import { BurntMetalMaterial, PlasterMaterial, StoneFloorMaterial } from "./SurfaceMaterials";

export function BuildersScene() {
  return <group>
    <mesh position={[0, -2.25, -437]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[46, 58]} /><StoneFloorMaterial color="#D0CCC3" roughness={0.64} /></mesh>
    <mesh position={[0, 3.2, -451]} receiveShadow><boxGeometry args={[32, 14, 0.5]} /><PlasterMaterial color="#DCD8CF" /></mesh>
    <SpatialText position={[0, 3.2, -444]} size={4.6} color="#AAA69E" roughness={0.56} metalness={0.32} outlineWidth={0} depth={0.08} sideColor="#77736C">AI BUILDERS</SpatialText>
    <FloatingCard position={[-8, 0.4, -438]} rotation={[0, 0.3, -0.04]} size={[4.6, 3.1]} number="NOW" title="SMALL TEAMS" caption="UNUSUAL REACH" light />
    <FloatingCard position={[8, 1.2, -441]} rotation={[0, -0.32, 0.04]} size={[4.7, 3.2]} number="NEXT" title="REAL WORK" caption="SHIPPED FAST" light />
    <mesh position={[0, 6.6, -446]} castShadow><boxGeometry args={[26, 0.08, 0.08]} /><BurntMetalMaterial /></mesh>
  </group>;
}
