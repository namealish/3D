"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type ModelProps = ThreeElements["group"] & { src: string };

/** Reusable GLB/GLTF loader. Draco-compressed files are decoded automatically. */
export function Model({ src, ...props }: ModelProps) {
  const { scene } = useGLTF(src, true);
  return <primitive object={scene.clone()} {...props} />;
}
