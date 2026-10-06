"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";
import { SpatialText } from "./SpatialText";
import { AnodizedMaterial, BrushedAluminumMaterial, BurntMetalMaterial, PlasterMaterial, ScreenGlassMaterial, SmokedGlassMaterial, StoneFloorMaterial } from "./SurfaceMaterials";

export function HeroScene() {
  return <group>
    <mesh position={[0, -2.2, -7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[34, 68]} /><StoneFloorMaterial /></mesh>
    <mesh position={[0, 8, -7]} receiveShadow><boxGeometry args={[34, 0.35, 68]} /><PlasterMaterial color="#C8C4BC" roughness={0.88} /></mesh>
    <mesh position={[12.5, 2.8, -7]} receiveShadow><boxGeometry args={[0.4, 10, 68]} /><PlasterMaterial color="#D9D5CC" /></mesh>
    {[-7.5, 0, 7.5].map((x) => <mesh key={x} position={[x, 7.76, -12]}><boxGeometry args={[3.8, 0.04, 46]} /><meshStandardMaterial color="#EAE7E0" emissive="#D7C8B7" emissiveIntensity={0.18} roughness={0.36} /></mesh>)}
    {[-7.5, 0, 7.5].map((x) => <mesh key={`warm-${x}`} position={[x, 7.72, -12]}><boxGeometry args={[0.06, 0.05, 46]} /><meshStandardMaterial color="#A53D24" emissive="#A53D24" emissiveIntensity={0.32} roughness={0.42} metalness={0.68} /></mesh>)}
    <mesh position={[12.24, 2.8, -17]}><boxGeometry args={[0.03, 8.8, 18]} /><SmokedGlassMaterial opacity={0.28} transmission={0.2} /></mesh>
    {[-21, -15, -9].map((z) => <mesh key={z} position={[12.2, 2.8, z]} castShadow><boxGeometry args={[0.08, 9, 0.08]} /><BrushedAluminumMaterial /></mesh>)}
    <RoundedBox position={[1.8, -1.3, -18]} args={[8.6, 1.4, 4.5]} radius={0.09} smoothness={4} castShadow receiveShadow><BrushedAluminumMaterial color="#B5B2AB" roughness={0.44} /></RoundedBox>
    {[-1, 1].map((side) => <RoundedBox key={side} position={[side * 4.8 + 1.8, -1.9, -18]} args={[0.28, 1.4, 3.6]} radius={0.035} smoothness={3} castShadow><AnodizedMaterial color="#6E6D68" /></RoundedBox>)}
    <RoundedBox position={[1.8, -0.55, -18]} args={[7.8, 0.1, 3.8]} radius={0.025} smoothness={3} castShadow><AnodizedMaterial /></RoundedBox>
    <mesh position={[1.1, -0.47, -17.6]}><boxGeometry args={[4.6, 0.035, 1.3]} /><BrushedAluminumMaterial color="#8B8984" roughness={0.4} /></mesh>
    {[-1.55, -0.78, 0, 0.78, 1.55].map((x) => <mesh key={x} position={[x + 1.1, -0.445, -17.6]}><boxGeometry args={[0.035, 0.02, 1.05]} /><meshStandardMaterial color="#373936" roughness={0.55} metalness={0.62} /></mesh>)}
    <RoundedBox position={[4.6, -0.44, -17.25]} args={[1.05, 0.035, 0.75]} radius={0.018} smoothness={3}><AnodizedMaterial color="#2A2B29" /></RoundedBox>
    <group position={[1.8, 1.15, -22.8]}>
      <RoundedBox args={[7.4, 4.55, 0.32]} radius={0.18} smoothness={5} castShadow><AnodizedMaterial /></RoundedBox>
      <mesh position={[0, 0, 0.18]}><planeGeometry args={[6.95, 4.08]} /><meshStandardMaterial color="#151614" emissive="#5A2012" emissiveIntensity={0.1} roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.205]}><planeGeometry args={[6.5, 3.62]} /><meshStandardMaterial color="#D8D5CE" emissive="#C5BCAE" emissiveIntensity={0.045} roughness={0.5} /></mesh>
      <mesh position={[-2.55, 1.35, 0.225]}><boxGeometry args={[0.9, 0.06, 0.02]} /><meshStandardMaterial color="#C74C29" emissive="#C74C29" emissiveIntensity={0.35} roughness={0.4} /></mesh>
      <mesh position={[-1.25, 0.4, 0.225]}><boxGeometry args={[3.55, 0.08, 0.02]} /><meshStandardMaterial color="#242523" roughness={0.7} /></mesh>
      <mesh position={[-1.8, 0.05, 0.225]}><boxGeometry args={[2.45, 0.08, 0.02]} /><meshStandardMaterial color="#242523" roughness={0.7} /></mesh>
      <mesh position={[0, 0, 0.24]}><planeGeometry args={[6.72, 3.84]} /><ScreenGlassMaterial opacity={0.18} transmission={0.06} emissiveIntensity={0} /></mesh>
      <mesh position={[0, -2.36, -0.08]} rotation={[0.6, 0, 0]} castShadow><cylinderGeometry args={[0.12, 0.12, 6.5, 24]} /><AnodizedMaterial /></mesh>
    </group>
    <RoundedBox position={[-6.5, -1.15, -11]} args={[3.6, 2.1, 3.6]} radius={0.08} smoothness={4} castShadow><BurntMetalMaterial /></RoundedBox>
    <mesh position={[-6.5, 0.02, -11]}><boxGeometry args={[3.48, 0.045, 3.48]} /><BrushedAluminumMaterial color="#C9C5BD" /></mesh>
    <SpatialText position={[-6.5, -1.12, -9.16]} size={0.34} color="#EAE7E0" outlineWidth={0}>A+ / 01</SpatialText>
    <mesh position={[-9.6, 2.5, -28]} castShadow><boxGeometry args={[0.08, 9.5, 0.08]} /><BurntMetalMaterial /></mesh>
    <SpatialText position={[8.4, 5.2, -26]} size={0.38} color="#6B6B70" anchorX="right" outlineWidth={0}>01 / BUILD SPACE</SpatialText>
    <ContactShadows position={[0, -2.17, -18]} opacity={0.28} scale={25} blur={2.8} far={9} frames={1} color="#3A2B24" />
  </group>;
}
