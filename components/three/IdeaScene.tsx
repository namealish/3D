"use client";

import { SpatialText } from "./SpatialText";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { BrushedAluminumMaterial, BurntMetalMaterial, PlasterMaterial, StoneFloorMaterial } from "./SurfaceMaterials";

export function IdeaScene() {
  return <group>
    <mesh position={[0, -2.2, -91]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[34, 46]} /><StoneFloorMaterial color="#D3CFC6" roughness={0.62} /></mesh>
    <mesh position={[0, 3.4, -101]} receiveShadow><boxGeometry args={[30, 13, 0.5]} /><PlasterMaterial color="#DDD9D0" /></mesh>
    <SpatialText position={[-0.7, 1.4, -92]} size={9.6} color="#181917" roughness={0.66} metalness={0.18} outlineWidth={0} depth={0.18} sideColor="#080908">IDEA</SpatialText>
    <SpatialText position={[7.7, -0.6, -91.8]} size={0.4} anchorX="right" color="#A53D24" outlineWidth={0}>EVERY LAUNCH STARTS HERE.</SpatialText>
    <mesh position={[-7.4, 4.7, -96]} castShadow><boxGeometry args={[0.08, 7.2, 0.08]} /><BurntMetalMaterial /></mesh>
    <RoundedBox position={[7.1, 5.6, -95]} rotation={[0.15, 0.45, 0.08]} args={[1.1, 1.1, 1.1]} radius={0.045} smoothness={4} castShadow><BurntMetalMaterial /></RoundedBox>
    <mesh position={[0, 6.2, -98]}><boxGeometry args={[18, 0.035, 0.035]} /><BrushedAluminumMaterial color="#5E5B55" /></mesh>
    <SpatialText position={[-8.2, 6.15, -97.8]} size={0.24} anchorX="left" color="#A53D24" outlineWidth={0}>ORIGIN / 001</SpatialText>
    <ContactShadows position={[0, -2.17, -92]} opacity={0.24} scale={25} blur={2.6} far={9} frames={1} color="#4A3930" />
  </group>;
}
