"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpatialText } from "./SpatialText";
import { scrollStore } from "@/lib/scroll-store";

const OFF_WHITE = "#E8E5DE";
const BLACK = "#090A09";
const GRAPHITE = "#252624";
const OXIDE = "#A33B20";

function PortalScreen() {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const edge = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const progress = scrollStore.getSnapshot().progress;
    const activation = THREE.MathUtils.smoothstep(progress, 0.12, 0.26);
    const reveal = 1 - THREE.MathUtils.smoothstep(progress, 0.285, 0.315);
    if (material.current) {
      material.current.opacity = (0.04 + activation * 0.92) * reveal;
      material.current.emissiveIntensity = 0.15 + activation * 7;
    }
    if (edge.current) edge.current.emissiveIntensity = 0.25 + activation * 5;
    if (light.current) light.current.intensity = activation * reveal * 34;
  });

  return (
    <group position={[2, 1.05, -21.2]}>
      <mesh position={[0, 0, -0.42]} castShadow><boxGeometry args={[7.2, 4.8, 0.72]} /><meshStandardMaterial color={BLACK} roughness={0.52} metalness={0.48} /></mesh>
      <mesh position={[-3.28, 0, 0]} castShadow><boxGeometry args={[0.7, 4.25, 1.15]} /><meshStandardMaterial color="#151615" roughness={0.42} metalness={0.58} /></mesh>
      <mesh position={[3.28, 0, 0]} castShadow><boxGeometry args={[0.7, 4.25, 1.15]} /><meshStandardMaterial color="#151615" roughness={0.42} metalness={0.58} /></mesh>
      <mesh position={[0, 2.03, 0]} castShadow><boxGeometry args={[7.25, 0.22, 1.15]} /><meshStandardMaterial color={GRAPHITE} roughness={0.38} metalness={0.62} /></mesh>
      <mesh position={[0, -2.03, 0]} castShadow><boxGeometry args={[7.25, 0.22, 1.15]} /><meshStandardMaterial color={GRAPHITE} roughness={0.38} metalness={0.62} /></mesh>
      <mesh position={[0, 0, 0.2]}>
        <planeGeometry args={[5.9, 3.58]} />
        <meshStandardMaterial ref={material} color="#1A120F" emissive="#D65A2F" emissiveIntensity={0.15} transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.23]}>
        <planeGeometry args={[6.03, 3.71]} />
        <meshStandardMaterial ref={edge} color={OXIDE} emissive={OXIDE} emissiveIntensity={0.25} wireframe transparent opacity={0.72} />
      </mesh>
      <pointLight ref={light} position={[0, 0, 2.2]} color="#D65A2F" intensity={0} distance={22} decay={2} />
    </group>
  );
}

function WallSeams() {
  return (
    <group>
      {[-8.5, -3.5, 1.5, 6.5].map((x) => <mesh key={x} position={[x, 2.2, -21.67]}><boxGeometry args={[0.018, 8.8, 0.018]} /><meshBasicMaterial color="#9F9C94" transparent opacity={0.32} /></mesh>)}
      {[0.4, 3.1, 5.8].map((y) => <mesh key={y} position={[-5.35, y, -21.67]}><boxGeometry args={[10.9, 0.018, 0.018]} /><meshBasicMaterial color="#9F9C94" transparent opacity={0.22} /></mesh>)}
    </group>
  );
}

export function SceneRoom() {
  return (
    <group>
      <mesh position={[0, -2.25, -7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[28, 52]} /><meshStandardMaterial color="#D8D4CB" roughness={0.88} metalness={0.01} /></mesh>
      <mesh position={[-11.5, 2.3, -7]} receiveShadow><boxGeometry args={[0.5, 9.2, 52]} /><meshStandardMaterial color={OFF_WHITE} roughness={0.94} /></mesh>
      <mesh position={[11.5, 2.3, -7]} receiveShadow><boxGeometry args={[0.5, 9.2, 52]} /><meshStandardMaterial color="#DEDAD1" roughness={0.94} /></mesh>
      <mesh position={[0, 7.05, -7]} receiveShadow><boxGeometry args={[23.5, 0.45, 52]} /><meshStandardMaterial color="#F0EDE6" roughness={0.97} /></mesh>
      <mesh position={[-5.35, 2.2, -22]} castShadow receiveShadow><boxGeometry args={[11.2, 9, 0.55]} /><meshStandardMaterial color="#DCD8CF" roughness={0.93} /></mesh>
      <mesh position={[8.05, 2.2, -22]} castShadow receiveShadow><boxGeometry args={[6.4, 9, 0.55]} /><meshStandardMaterial color="#D2CEC5" roughness={0.93} /></mesh>
      <mesh position={[2, 5.55, -22]} castShadow receiveShadow><boxGeometry args={[5.6, 2.3, 0.55]} /><meshStandardMaterial color="#E7E3DA" roughness={0.93} /></mesh>
      <WallSeams />
      <mesh position={[2, -1.52, -16.4]} castShadow receiveShadow><boxGeometry args={[8.4, 1.32, 4.2]} /><meshStandardMaterial color="#C9C5BB" roughness={0.78} metalness={0.05} /></mesh>
      <mesh position={[2, -0.82, -16.4]} castShadow><boxGeometry args={[7.4, 0.16, 3.45]} /><meshStandardMaterial color={BLACK} roughness={0.39} metalness={0.61} /></mesh>
      <mesh position={[2, -0.65, -16.4]} castShadow><boxGeometry args={[6.85, 0.09, 3.05]} /><meshPhysicalMaterial color="#343431" roughness={0.18} metalness={0.35} transparent opacity={0.78} /></mesh>
      <mesh position={[-5.5, -1.3, -10]} castShadow receiveShadow><boxGeometry args={[3.5, 1.8, 4.2]} /><meshStandardMaterial color="#B7B3AA" roughness={0.9} /></mesh>
      <mesh position={[-7.2, 1.4, -15]} castShadow><boxGeometry args={[0.28, 7.2, 2.4]} /><meshStandardMaterial color={OXIDE} roughness={0.46} metalness={0.34} /></mesh>
      <mesh position={[-7.03, 1.4, -15]}><boxGeometry args={[0.02, 6.7, 2]} /><meshBasicMaterial color="#D65A2F" transparent opacity={0.32} /></mesh>
      <SpatialText position={[-7.8, 4.1, -20.9]} size={2.15} color="#9C9991" anchorX="left" roughness={0.86} metalness={0.04} outlineWidth={0}>APERTURE</SpatialText>
      <SpatialText position={[8.9, -0.4, -20.9]} size={0.28} color="#6A6964" anchorX="right" outlineWidth={0}>GALLERY 01 / THRESHOLD</SpatialText>
      <PortalScreen />
    </group>
  );
}
