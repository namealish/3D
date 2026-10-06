"use client";

import { Edges } from "@react-three/drei";
import { SpatialText } from "./SpatialText";

const PAPER = "#B6B0A4";
const GRAPHITE = "#252624";
const OXIDE = "#A33B20";

function SketchPanel({ position, rotation = [0, 0, 0], scale = 1, pale = false }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number; pale?: boolean }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow><boxGeometry args={[4.8, 3.1, 0.06]} /><meshStandardMaterial color={pale ? PAPER : GRAPHITE} roughness={0.82} metalness={0.12} transparent opacity={pale ? 0.38 : 0.88} /></mesh>
      <mesh position={[0, 0, 0.04]}><planeGeometry args={[4.55, 2.85]} /><meshBasicMaterial color={pale ? "#E8E5DE" : "#77736B"} transparent opacity={pale ? 0.1 : 0.08} /></mesh>
      {[-1.7, -0.85, 0, 0.85, 1.7].map((x) => <mesh key={x} position={[x, 0, 0.09]}><boxGeometry args={[0.012, 2.45, 0.012]} /><meshBasicMaterial color={OXIDE} transparent opacity={0.58} /></mesh>)}
      {[-0.85, 0, 0.85].map((y) => <mesh key={y} position={[0, y, 0.09]}><boxGeometry args={[4.05, 0.012, 0.012]} /><meshBasicMaterial color="#D0CBC0" transparent opacity={0.34} /></mesh>)}
      <mesh position={[-1.35, 0.35, 0.11]} rotation={[0, 0, -0.22]}><ringGeometry args={[0.5, 0.52, 48]} /><meshBasicMaterial color="#D65A2F" transparent opacity={0.8} /></mesh>
    </group>
  );
}

function ThresholdFrame({ z, width, height, color }: { z: number; width: number; height: number; color: string }) {
  return <group position={[0, 1, z]}>
    <mesh position={[-width / 2, 0, 0]} castShadow><boxGeometry args={[0.08, height, 0.18]} /><meshStandardMaterial color={color} roughness={0.44} metalness={0.56} /></mesh>
    <mesh position={[width / 2, 0, 0]} castShadow><boxGeometry args={[0.08, height, 0.18]} /><meshStandardMaterial color={color} roughness={0.44} metalness={0.56} /></mesh>
    <mesh position={[0, height / 2, 0]} castShadow><boxGeometry args={[width, 0.08, 0.18]} /><meshStandardMaterial color={color} roughness={0.44} metalness={0.56} /></mesh>
  </group>;
}

function WireStudy() {
  return <group position={[4.7, 1.1, -78]} rotation={[0.2, 0.55, -0.08]}>
    <mesh><icosahedronGeometry args={[2.1, 1]} /><meshStandardMaterial color="#151615" transparent opacity={0.04} wireframe /><Edges color="#8A8377" threshold={8} /></mesh>
    <mesh position={[0, -2.25, 0]}><boxGeometry args={[5.6, 0.05, 5.6]} /><meshStandardMaterial color={OXIDE} roughness={0.45} metalness={0.4} /></mesh>
  </group>;
}

export function SceneIdea() {
  return (
    <group>
      <ThresholdFrame z={-41} width={12} height={8} color="#30312D" />
      <ThresholdFrame z={-58} width={17} height={10} color="#5E2B1D" />
      <SketchPanel position={[-7.8, 2.4, -49]} rotation={[0, 0.34, -0.04]} scale={0.92} pale />
      <SketchPanel position={[7.2, 0.2, -62]} rotation={[0, -0.38, 0.03]} scale={1.08} />
      <SketchPanel position={[-6.2, 4.4, -84]} rotation={[0, 0.28, 0]} scale={1.15} pale />
      <SketchPanel position={[6.8, 3.1, -96]} rotation={[0, -0.32, 0]} scale={0.88} />
      <WireStudy />
      <SpatialText position={[-0.8, 1.6, -72]} size={8.9} color="#171815" roughness={0.82} metalness={0.18} outlineWidth={0.018} outlineColor="#6E6A62">IDEA</SpatialText>
      <SpatialText position={[0.25, 1.6, -72.35]} size={8.9} color="#7B776E" roughness={0.48} metalness={0.5} opacity={0.18} outlineWidth={0}>IDEA</SpatialText>
      <SpatialText position={[-9, 6.2, -93]} size={1.15} color="#68635B" anchorX="left" outlineWidth={0}>UNFINISHED / USEFUL / ALIVE</SpatialText>
      <SpatialText position={[8.6, -0.4, -87]} size={0.34} color={OXIDE} anchorX="right" outlineWidth={0}>STUDY 03 / FORM IN PROGRESS</SpatialText>
      <mesh position={[0, -2.25, -76]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[34, 78]} /><meshStandardMaterial color="#151615" roughness={0.94} metalness={0.06} /></mesh>
      <mesh position={[0, 5.5, -103]} castShadow><boxGeometry args={[24, 0.18, 0.8]} /><meshStandardMaterial color={OXIDE} roughness={0.44} metalness={0.42} /></mesh>
      <mesh position={[-9.4, 1.5, -101]}><boxGeometry args={[0.03, 8.5, 0.03]} /><meshBasicMaterial color="#D65A2F" transparent opacity={0.65} /></mesh>
    </group>
  );
}
