"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";
import { BrushedAluminumMaterial, BurntMetalMaterial, MatteCharcoalMaterial } from "./SurfaceMaterials";

function PortalFrame({ z, scale, index }: { z: number; scale: number; index: number }) {
  const width = 10 * scale;
  const height = 6.3 * scale;
  const thickness = 0.16 * scale;
  return <group position={[0, 1.2, z]}>
    {[[0, height / 2, width, thickness], [0, -height / 2, width, thickness], [-width / 2, 0, thickness, height], [width / 2, 0, thickness, height]].map(([x, y, w, h], side) => <RoundedBox key={side} position={[x, y, 0]} args={[w, h, 0.28]} radius={Math.max(0.035, thickness / 2)} smoothness={4} castShadow>
      {index % 2 === 0 ? <BrushedAluminumMaterial color="#C6C1B8" emissive="#4A2118" emissiveIntensity={0.08} roughness={0.34} /> : <BurntMetalMaterial emissive="#5A1D10" emissiveIntensity={0.18} />}
    </RoundedBox>)}
    <mesh position={[-width / 2 + 0.42, height / 2 - 0.42, 0.16]}><boxGeometry args={[0.28, 0.28, 0.04]} /><meshStandardMaterial color={index % 2 === 0 ? "#A53D24" : "#D8D5CE"} roughness={0.48} metalness={0.5} /></mesh>
  </group>;
}

export function PortalScene() {
  return <group>
    <mesh position={[0, -4.3, -47]} receiveShadow><boxGeometry args={[22, 0.4, 42]} /><MatteCharcoalMaterial color="#161714" /></mesh>
    <mesh position={[0, 6.7, -47]}><boxGeometry args={[22, 0.4, 42]} /><MatteCharcoalMaterial color="#10110F" /></mesh>
    <mesh position={[-10.8, 1.2, -47]}><boxGeometry args={[0.4, 11.4, 42]} /><MatteCharcoalMaterial color="#131412" /></mesh>
    <mesh position={[10.8, 1.2, -47]}><boxGeometry args={[0.4, 11.4, 42]} /><MatteCharcoalMaterial color="#131412" /></mesh>
    <mesh position={[0, 1.2, -68]} receiveShadow><planeGeometry args={[22, 11]} /><MatteCharcoalMaterial color="#0E0F0D" /></mesh>
    {[[-32, 1.2], [-38, 1.04], [-44, 0.9], [-50, 0.78], [-56, 0.66], [-62, 0.54]].map(([z, scale], index) => <PortalFrame key={z} z={z} scale={scale} index={index} />)}
    <mesh position={[0, -4.02, -47]}><boxGeometry args={[0.06, 0.04, 41]} /><meshStandardMaterial color="#C74C29" emissive="#7A2817" emissiveIntensity={0.45} roughness={0.42} metalness={0.62} /></mesh>
    {[-8, 8].map((x) => <mesh key={x} position={[x, 6.44, -47]}><boxGeometry args={[0.045, 0.04, 41]} /><meshStandardMaterial color="#A53D24" emissive="#6B2012" emissiveIntensity={0.2} roughness={0.46} metalness={0.72} /></mesh>)}
    <ContactShadows position={[0, -4.08, -47]} opacity={0.32} scale={20} blur={2.4} far={8} frames={1} color="#080908" />
  </group>;
}
