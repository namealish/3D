"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";

const PARTICLE_COUNT = 420;

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function Atmosphere() {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(PARTICLE_COUNT * 3);
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      data[index * 3] = (seededRandom(index + 1) - 0.5) * 34;
      data[index * 3 + 1] = seededRandom(index + 101) * 12 - 2;
      data[index * 3 + 2] = 12 - seededRandom(index + 211) * 500;
    }
    return data;
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    const progress = scrollStore.getSnapshot().progress;
    points.current.rotation.y = THREE.MathUtils.damp(points.current.rotation.y, progress * 0.035, 2, delta);
    points.current.position.y = Math.sin(progress * Math.PI * 3) * 0.12;
    if (material.current) {
      const inDarkWorld = progress > 0.4 && progress < 0.92;
      const targetOpacity = inDarkWorld ? 0.32 : progress > 0.1 && progress < 0.2 ? 0.2 : 0.025;
      material.current.opacity = THREE.MathUtils.damp(material.current.opacity, targetOpacity, 3, delta);
    }
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={material} color="#C47A58" size={0.026} sizeAttenuation transparent opacity={0.018} depthWrite={false} />
    </points>
  );
}
