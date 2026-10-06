"use client";

import { ImagePanel } from "./MediaPanel";
import { FloatingCard } from "./FloatingCard";
import { SpatialText } from "./SpatialText";
import { MatteCharcoalMaterial } from "./SurfaceMaterials";

export function CommunityScene() {
  return <group>
    <mesh position={[0, -2.25, -287]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[48, 90]} /><MatteCharcoalMaterial color="#131412" roughness={0.8} /></mesh>
    <ImagePanel src="/images/pavilion.webp" title="Community 01" meta="Live build" position={[-8, 3.8, -269]} rotation={[0, 0.48, -0.03]} size={[6.4, 4]} />
    <FloatingCard position={[7.8, 1.2, -279]} rotation={[0, -0.44, 0.03]} size={[5.8, 4.6]} number="LIVE / 28" title="FEEDBACK" caption="BUILDING IN PUBLIC / ASTANA" />
    <ImagePanel src="/images/monument.webp" title="Community 02" meta="Proof" position={[7.2, 4, -298]} rotation={[0, -0.42, 0.02]} size={[6.4, 4]} />
    <FloatingCard position={[-7, 1.5, -309]} rotation={[0, 0.4, -0.02]} size={[6.4, 4.8]} number="QUOTE / 07" title="WE SHIPPED" caption="THE FIRST VERSION IN 7 DAYS" />
    <SpatialText position={[0, 6.3, -315]} size={1.05} color="#D8D5CE" roughness={0.55} metalness={0.3} outlineWidth={0} depth={0.04}>PEOPLE MOVE PRODUCTS FORWARD.</SpatialText>
  </group>;
}
