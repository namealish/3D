"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import type { Vec3Tuple } from "@/lib/journey";

const FRAMES: Array<{ position: Vec3Tuple; rotation: Vec3Tuple; width: number; height: number; accent?: boolean }> = [
  { position: [0, 1.05, -14], rotation: [0, 0, 0], width: 9.4, height: 7.2, accent: true },
  { position: [-1.8, 1.1, -24], rotation: [0, 0.12, 0], width: 10.5, height: 7.5 },
  { position: [1.9, 1.25, -37], rotation: [0, -0.14, 0], width: 11.5, height: 7.8, accent: true },
  { position: [-1.2, 1.4, -49], rotation: [0, 0.09, 0], width: 10.8, height: 8.1 },
  { position: [1.5, 1.25, -66], rotation: [0, -0.08, 0], width: 11.8, height: 7.8, accent: true },
  { position: [0, 1.45, -83], rotation: [0, 0.06, 0], width: 10.4, height: 8.2 },
  { position: [0, 1.2, -99], rotation: [0, 0, 0], width: 9.6, height: 7.6, accent: true },
];

function FrameUnit({ position, rotation, width, height, accent, index, mobile }: (typeof FRAMES)[number] & { index: number; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const thickness = accent ? 0.095 : 0.055;
  const color = accent ? "#71341f" : "#33332e";

  useFrame((_, delta) => {
    if (!group.current) return;
    const progress = scrollStore.getSnapshot().progress;
    const target = rotation[1] + Math.sin(progress * Math.PI * 2 + index * 0.7) * 0.012;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target, 2.2, delta);
  });

  const frameWidth = mobile ? width * 0.72 : width;

  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh position={[-frameWidth / 2, 0, 0]} castShadow>
        <boxGeometry args={[thickness, height, thickness * 2.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[frameWidth / 2, 0, 0]} castShadow>
        <boxGeometry args={[thickness, height, thickness * 2.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[frameWidth + thickness, thickness, thickness * 2.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[frameWidth + thickness, 0.025, thickness]} />
        <meshBasicMaterial color={accent ? "#b64c2c" : "#55544b"} transparent opacity={0.72} />
      </mesh>
      {accent && (
        <mesh position={[frameWidth / 2 - 0.22, height / 2 - 0.04, 0.13]}>
          <boxGeometry args={[0.38, 0.035, 0.035]} />
          <meshBasicMaterial color="#e07842" />
        </mesh>
      )}
    </group>
  );
}

export function StructuralFrames() {
  const mobile = useThree((state) => state.size.width < 720);
  return (
    <group>
      {FRAMES.map((frame, index) => <FrameUnit key={frame.position[2]} {...frame} index={index} mobile={mobile} />)}
    </group>
  );
}
