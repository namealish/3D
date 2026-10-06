"use client";

import { SpatialText } from "./SpatialText";

export function SceneFinal() {
  return (
    <group>
      <mesh position={[0, -2.25, -305]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[38, 54]} /><meshStandardMaterial color="#D8D4CB" roughness={0.9} metalness={0.01} /></mesh>
      <mesh position={[0, 3.5, -317]} receiveShadow><boxGeometry args={[30, 13, 0.8]} /><meshStandardMaterial color="#E8E5DE" roughness={0.95} /></mesh>
      <mesh position={[-8.5, 1.7, -306]} rotation={[0, 0.24, 0]} castShadow><boxGeometry args={[5.7, 7.8, 0.3]} /><meshStandardMaterial color="#151615" roughness={0.68} metalness={0.32} /></mesh>
      <mesh position={[8.5, 1.7, -306]} rotation={[0, -0.24, 0]} castShadow><boxGeometry args={[5.7, 7.8, 0.3]} /><meshStandardMaterial color="#A33B20" roughness={0.46} metalness={0.38} /></mesh>
      <mesh position={[0, 1.3, -308.92]}><boxGeometry args={[0.035, 6.8, 0.035]} /><meshBasicMaterial color="#D65A2F" /></mesh>
      <SpatialText position={[0, 5.7, -315]} size={4.2} color="#A7A39A" roughness={0.88} metalness={0.04} opacity={0.7} outlineWidth={0}>APERTURE</SpatialText>
      <SpatialText position={[-10.6, -0.5, -315]} size={0.3} color="#686964" anchorX="left" outlineWidth={0}>THE NEXT SPACE / YOURS</SpatialText>
    </group>
  );
}
