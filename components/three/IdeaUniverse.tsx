"use client";

import { ImagePanel } from "./MediaPanel";
import { FloatingCard } from "./FloatingCard";
import { SpatialText } from "./SpatialText";
import { BurntMetalMaterial, StoneFloorMaterial } from "./SurfaceMaterials";

export function IdeaUniverse() {
  return <group>
    <mesh position={[0, -2.2, -130]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[38, 74]} /><StoneFloorMaterial color="#D5D1C8" roughness={0.66} /></mesh>
    <ImagePanel src="/images/monument.webp" title="Reference 01" meta="Structure" position={[-7.4, 2.7, -111]} rotation={[0, 0.42, -0.03]} size={[6.3, 4]} />
    <FloatingCard position={[6.8, 0.8, -119]} rotation={[0, -0.38, 0.04]} size={[5.3, 3.5]} number="A/01" title="WHAT IF?" caption="FIRST PRINCIPLE / OPEN QUESTION" light />
    <ImagePanel src="/images/passage.webp" title="Reference 02" meta="Flow" position={[7.7, 4.1, -134]} rotation={[0, -0.45, 0.02]} size={[6.2, 3.8]} />
    <FloatingCard position={[-6.8, 1.3, -141]} rotation={[0, 0.36, -0.03]} size={[5.8, 4]} number="B/07" title="PROTOTYPE" caption="TEST / LEARN / REPEAT" light />
    <ImagePanel src="/images/pavilion.webp" title="Reference 03" meta="System" position={[-5.8, 4.2, -154]} rotation={[0, 0.35, 0]} size={[6.6, 4]} />
    <SpatialText position={[7.4, -0.5, -150]} size={0.34} anchorX="right" color="#A53D24" outlineWidth={0}>NOTES / WIREFRAMES / SIGNALS / PROOF</SpatialText>
    <mesh position={[0, 6.4, -133]}><boxGeometry args={[24, 0.045, 0.045]} /><BurntMetalMaterial /></mesh>
    <mesh position={[0, -1.92, -133]}><boxGeometry args={[24, 0.035, 0.035]} /><meshStandardMaterial color="#242523" roughness={0.76} metalness={0.28} /></mesh>
    {[-10, 0, 10].map((x) => <mesh key={x} position={[x, 6.4, -133]}><boxGeometry args={[0.08, 0.46, 0.08]} />{x === 0 ? <BurntMetalMaterial /> : <meshStandardMaterial color="#393A36" roughness={0.68} metalness={0.42} />}</mesh>)}
  </group>;
}
