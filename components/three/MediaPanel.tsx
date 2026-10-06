"use client";

import { RoundedBox, useTexture, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Vec3Tuple } from "@/lib/journey";
import { AnodizedMaterial, BrushedAluminumMaterial, BurntMetalMaterial, ScreenGlassMaterial } from "./SurfaceMaterials";
import { SpatialText } from "./SpatialText";

type PanelProps = { position: Vec3Tuple; rotation?: Vec3Tuple; size?: [number, number]; title: string; meta: string };

export function ImagePanel({ src, position, rotation = [0, 0, 0], size = [6, 3.6], title, meta }: PanelProps & { src: string }) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return <Panel texture={texture} position={position} rotation={rotation} size={size} title={title} meta={meta} />;
}

export function VideoPanel({ src, ...props }: PanelProps & { src: string }) {
  const texture = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  return <Panel texture={texture} {...props} />;
}

function Panel({ texture, position, rotation = [0, 0, 0], size = [6, 3.6], title, meta }: PanelProps & { texture: THREE.Texture }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[size[0] + 0.34, size[1] + 0.34, 0.24]} radius={0.08} smoothness={4} castShadow receiveShadow><AnodizedMaterial /></RoundedBox>
      <mesh position={[0, 0, 0.125]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} toneMapped={false} color="#EAE7E0" />
      </mesh>
      <mesh position={[0, 0, 0.145]}>
        <planeGeometry args={[size[0] - 0.04, size[1] - 0.04]} />
        <ScreenGlassMaterial opacity={0.13} transmission={0.05} emissiveIntensity={0} depthWrite={false} />
      </mesh>
      <mesh position={[-size[0] / 2 - 0.2, 0, -0.05]} castShadow><boxGeometry args={[0.1, size[1] + 0.8, 0.12]} /><BurntMetalMaterial emissive="#5C1E11" emissiveIntensity={0.14} /></mesh>
      <mesh position={[size[0] / 2 + 0.2, 0, -0.05]} castShadow><boxGeometry args={[0.1, size[1] + 0.8, 0.12]} /><BrushedAluminumMaterial color="#6E6C67" /></mesh>
      <mesh position={[0, size[1] / 2 + 0.2, 0.14]} castShadow><boxGeometry args={[size[0] + 0.8, 0.055, 0.04]} /><BurntMetalMaterial /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * (size[0] / 2 + 0.2), size[1] / 2 + 0.38, 0.02]}><sphereGeometry args={[0.075, 16, 16]} />{side < 0 ? <BrushedAluminumMaterial color="#D8D5CE" /> : <BurntMetalMaterial />}</mesh>)}
      <mesh position={[0, -size[1] / 2 - 0.31, 0.02]}>
        <boxGeometry args={[size[0], 0.34, 0.035]} />
        <AnodizedMaterial color="#10110F" roughness={0.62} />
      </mesh>
      <SpatialText position={[-size[0] / 2 + 0.16, -size[1] / 2 - 0.31, 0.045]} size={0.14} anchorX="left" color="#EAE7E0" outlineWidth={0}>{title.toUpperCase()}</SpatialText>
      <SpatialText position={[size[0] / 2 - 0.16, -size[1] / 2 - 0.31, 0.045]} size={0.12} anchorX="right" color="#C74C29" outlineWidth={0}>{meta.toUpperCase()}</SpatialText>
    </group>
  );
}
