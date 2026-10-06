"use client";

import { SpatialText } from "./SpatialText";

export function StatMonument({ value, label, position }: { value: string; label: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -1.7, 0]} castShadow>
        <boxGeometry args={[4.8, 0.22, 1.6]} />
        <meshStandardMaterial color="#A33B20" roughness={0.46} metalness={0.38} />
      </mesh>
      <mesh position={[0, -1.5, 0]}><boxGeometry args={[4.4, 0.025, 1.25]} /><meshBasicMaterial color="#D65A2F" transparent opacity={0.4} /></mesh>
      <SpatialText size={3.15} color="#E8E5DE" roughness={0.48} metalness={0.34} outlineWidth={0.006} outlineColor="#090A09">{value}</SpatialText>
      <SpatialText position={[0, -1.12, 0.05]} size={0.24} color="#C4C0B6" outlineWidth={0}>{label.toUpperCase()}</SpatialText>
    </group>
  );
}
