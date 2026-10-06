"use client";

import { FloatingCard } from "./FloatingCard";
import { SpatialText } from "./SpatialText";
import { BurntMetalMaterial, MatteCharcoalMaterial } from "./SurfaceMaterials";

export function ProcessScene() {
  return <group>
    <mesh position={[0, -2.25, -228]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[42, 76]} /><MatteCharcoalMaterial color="#151614" roughness={0.76} /></mesh>
    <FloatingCard position={[-5.2, 1.1, -211]} rotation={[0, 0.28, -0.03]} number="01" title="PICK YOUR IDEA" caption="FIND THE SIGNAL WITH ENERGY" />
    <FloatingCard position={[4.2, 1.6, -232]} rotation={[0, -0.25, 0.025]} number="02" title="BUILD" caption="MAKE THE FIRST VERSION REAL" />
    <FloatingCard position={[-3.7, 2.2, -253]} rotation={[0, 0.22, -0.02]} number="03" title="LAUNCH" caption="RELEASE / LISTEN / GROW" />
    <SpatialText position={[8.5, 5.5, -242]} size={0.28} anchorX="right" color="#C74C29" outlineWidth={0}>PROCESS / 01—03</SpatialText>
    {[-214, -226, -238, -250].map((z) => <mesh key={z} position={[0, 5.8, z]} castShadow><boxGeometry args={[18, 0.04, 0.04]} /><BurntMetalMaterial transparent opacity={0.34} /></mesh>)}
  </group>;
}
