"use client";

import { Grid } from "@react-three/drei";
import { SpatialText } from "./SpatialText";
import { MatteCharcoalMaterial } from "./SurfaceMaterials";

export function DarkWorld() {
  return <group>
    <mesh position={[0, -2.25, -185]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[48, 70]} /><MatteCharcoalMaterial color="#151614" roughness={0.8} /></mesh>
    <Grid position={[0, -2.18, -185]} args={[44, 70]} cellSize={1.4} cellThickness={0.12} cellColor="#5B534B" sectionSize={7} sectionThickness={0.28} sectionColor="#A53D24" fadeDistance={48} fadeStrength={1.5} infiniteGrid={false} />
    <SpatialText position={[0, 4.4, -196]} size={5.1} color="#242523" roughness={0.62} metalness={0.44} outlineWidth={0.003} outlineColor="#A53D24" depth={0.1} sideColor="#10110F">SYSTEM</SpatialText>
    <mesh position={[0, 1.2, -166]} receiveShadow><boxGeometry args={[16, 8, 0.12]} /><MatteCharcoalMaterial color="#111211" transparent opacity={0.86} /></mesh>
  </group>;
}
