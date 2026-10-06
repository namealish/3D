"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";

export function Portal() {
  const ring = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = scrollStore.getSnapshot().progress;
    if (!ring.current) return;
    const local = THREE.MathUtils.smoothstep(p, 0.08, 0.28);
    ring.current.rotation.z = local * 0.12;
    ring.current.scale.setScalar(0.92 + local * 0.15);
  });

  return (
    <group ref={ring} position={[0, 0.25, -5]}>
      <mesh castShadow>
        <torusGeometry args={[3.4, 0.48, 32, 96]} />
        <meshStandardMaterial color="#8e3e24" roughness={0.44} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <ringGeometry args={[2.82, 3.02, 96]} />
        <meshBasicMaterial color="#d9c8aa" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.14]}>
        <ringGeometry args={[2.68, 2.71, 96]} />
        <meshBasicMaterial color="#d76538" transparent opacity={0.68} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -2.7, -0.18]} receiveShadow>
        <cylinderGeometry args={[4.35, 4.7, 0.22, 64]} />
        <meshStandardMaterial color="#171713" roughness={0.82} metalness={0.18} />
      </mesh>
    </group>
  );
}
