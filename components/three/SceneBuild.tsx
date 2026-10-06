"use client";

import { ImagePanel } from "./MediaPanel";
import { SpatialText } from "./SpatialText";

const BLACK = "#090A09";
const GRAPHITE = "#252624";
const METAL = "#686964";
const OXIDE = "#A33B20";

function CorridorFrame({ z, accent = false }: { z: number; accent?: boolean }) {
  const color = accent ? OXIDE : GRAPHITE;
  return (
    <group position={[0, 1.4, z]}>
      <mesh position={[-8.2, 0, 0]} castShadow><boxGeometry args={[0.16, 7.4, 0.34]} /><meshStandardMaterial color={color} roughness={0.4} metalness={0.6} /></mesh>
      <mesh position={[8.2, 0, 0]} castShadow><boxGeometry args={[0.16, 7.4, 0.34]} /><meshStandardMaterial color={color} roughness={0.4} metalness={0.6} /></mesh>
      <mesh position={[0, 3.7, 0]} castShadow><boxGeometry args={[16.5, 0.16, 0.34]} /><meshStandardMaterial color={color} roughness={0.4} metalness={0.6} /></mesh>
      <mesh position={[0, -3.68, 0]}><boxGeometry args={[16.5, 0.025, 0.12]} /><meshBasicMaterial color={accent ? "#D65A2F" : "#50514C"} transparent opacity={0.65} /></mesh>
    </group>
  );
}

function SuspendedRail({ position, width }: { position: [number, number, number]; width: number }) {
  return <group position={position}>
    <mesh castShadow><boxGeometry args={[width, 0.14, 0.28]} /><meshStandardMaterial color={METAL} roughness={0.38} metalness={0.62} /></mesh>
    <mesh position={[-width / 2 + 0.08, -1.1, 0]}><boxGeometry args={[0.08, 2.2, 0.16]} /><meshStandardMaterial color={BLACK} roughness={0.55} metalness={0.45} /></mesh>
    <mesh position={[width / 2 - 0.08, -1.1, 0]}><boxGeometry args={[0.08, 2.2, 0.16]} /><meshStandardMaterial color={BLACK} roughness={0.55} metalness={0.45} /></mesh>
  </group>;
}

export function SceneBuild() {
  return (
    <group>
      {[-112, -126, -140, -154, -168, -182, -196].map((z, index) => <CorridorFrame key={z} z={z} accent={index === 2 || index === 5} />)}
      <mesh position={[0, -2.25, -154]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[28, 98]} /><meshStandardMaterial color="#10110F" roughness={0.76} metalness={0.24} /></mesh>
      {[-6, 0, 6].map((x) => <mesh key={x} position={[x, -2.22, -154]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.018, 96]} /><meshBasicMaterial color="#585954" transparent opacity={0.28} /></mesh>)}
      <mesh position={[-7.8, 1.6, -126]} rotation={[0, 0.52, 0]} castShadow><boxGeometry args={[0.35, 6.4, 7.2]} /><meshStandardMaterial color={GRAPHITE} roughness={0.42} metalness={0.58} /></mesh>
      <mesh position={[-5.4, 0.7, -132]} rotation={[0, 0.25, 0]} castShadow><boxGeometry args={[3.2, 4.8, 0.18]} /><meshStandardMaterial color={OXIDE} roughness={0.46} metalness={0.44} /></mesh>
      <mesh position={[-2.2, 2.9, -137]} rotation={[0, -0.08, 0]} castShadow><boxGeometry args={[3.7, 5.6, 0.16]} /><meshStandardMaterial color={METAL} roughness={0.54} metalness={0.36} /></mesh>
      <SuspendedRail position={[-6.9, 5.05, -151]} width={7.1} />
      <SuspendedRail position={[6.9, 4.65, -162]} width={7.1} />
      <SuspendedRail position={[-6.4, 5.7, -176]} width={7.3} />
      <ImagePanel src="/images/monument.webp" title="Prototype 01" meta="Structure / Form" position={[-6.9, 1.8, -151]} rotation={[0, 0.55, 0]} size={[6.2, 3.7]} />
      <ImagePanel src="/images/passage.webp" title="Prototype 02" meta="Flow / Interface" position={[6.9, 1.3, -162]} rotation={[0, -0.55, 0]} size={[6.2, 3.7]} />
      <ImagePanel src="/images/pavilion.webp" title="Prototype 03" meta="Launch / System" position={[-6.4, 2.4, -176]} rotation={[0, 0.48, 0]} size={[6.4, 3.8]} />
      <SpatialText position={[-0.8, 3.4, -172]} size={5.8} color="#BEBAB0" roughness={0.34} metalness={0.66} outlineWidth={0.008} outlineColor={BLACK}>BUILD</SpatialText>
      <SpatialText position={[0.4, 3.4, -172.45]} size={5.8} color={BLACK} roughness={0.78} metalness={0.22} opacity={0.46} outlineWidth={0}>BUILD</SpatialText>
      <mesh position={[5.7, 5.1, -188]} rotation={[0, -0.22, 0]} castShadow><boxGeometry args={[7.5, 0.18, 1.4]} /><meshStandardMaterial color={OXIDE} roughness={0.38} metalness={0.52} /></mesh>
      <SpatialText position={[4.8, 4.35, -190]} size={1.25} color="#D5D0C4" outlineWidth={0}>01 / 02 / 03</SpatialText>
      <SpatialText position={[-7.7, -0.7, -187]} size={0.3} color="#8A8983" anchorX="left" outlineWidth={0}>DISCOVER   /   DESIGN   /   BUILD   /   TEST   /   LAUNCH</SpatialText>
    </group>
  );
}
