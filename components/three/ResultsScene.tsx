"use client";

import { FloatingCard } from "./FloatingCard";
import { ImagePanel } from "./MediaPanel";
import { MatteCharcoalMaterial } from "./SurfaceMaterials";

export function ResultsScene() {
  return <group>
    <mesh position={[0, -2.25, -378]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[52, 60]} /><MatteCharcoalMaterial color="#141512" roughness={0.78} /></mesh>
    <FloatingCard position={[-7.5, 2.4, -363]} rotation={[0, 0.48, -0.02]} size={[6.1, 4.2]} number="01 / REVENUE" title="$200K+" caption="CREATED BY SMALL TEAMS" />
    <FloatingCard position={[7.2, 0.8, -376]} rotation={[0, -0.42, 0.03]} size={[5.6, 4.4]} number="02 / PRODUCTS" title="275+" caption="LAUNCHED INTO THE WORLD" />
    <ImagePanel src="/images/passage.webp" title="Launch story" meta="Week 01" position={[-7, 4.1, -390]} rotation={[0, 0.42, 0]} size={[6.3, 4]} />
    <FloatingCard position={[6.7, 3.6, -404]} rotation={[0, -0.36, -0.02]} size={[6, 4.5]} number="03 / COMMUNITY" title="500+" caption="BUILDERS MOVING TOGETHER" />
    <FloatingCard position={[-5.2, 3.8, -399]} rotation={[0, 0.3, 0.02]} size={[5.3, 3.8]} number="04 / SPEED" title="7 DAYS" caption="FROM IDEA TO FIRST USERS" />
  </group>;
}
