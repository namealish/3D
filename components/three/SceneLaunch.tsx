"use client";

import { SpatialText } from "./SpatialText";
import { StatMonument } from "./StatMonument";

const PAPER = "#E8E5DE";
const BLACK = "#090A09";
const OXIDE = "#A33B20";

function LaunchTower({ position, height, accent = false }: { position: [number, number, number]; height: number; accent?: boolean }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[2.4, height, 2.4]} />
      <meshStandardMaterial color={accent ? OXIDE : "#C9C5BB"} roughness={accent ? 0.42 : 0.8} metalness={accent ? 0.38 : 0.08} />
    </mesh>
  );
}

export function SceneLaunch() {
  return (
    <group>
      <mesh position={[0, -2.25, -236]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[52, 92]} /><meshStandardMaterial color="#20211E" roughness={0.84} metalness={0.16} /></mesh>
      <group position={[0, 1, -207]}>
        <mesh position={[-11, 0, 0]} castShadow><boxGeometry args={[0.2, 10, 0.5]} /><meshStandardMaterial color={OXIDE} roughness={0.43} metalness={0.44} /></mesh>
        <mesh position={[11, 0, 0]} castShadow><boxGeometry args={[0.2, 10, 0.5]} /><meshStandardMaterial color={OXIDE} roughness={0.43} metalness={0.44} /></mesh>
        <mesh position={[0, 5, 0]} castShadow><boxGeometry args={[22.2, 0.2, 0.5]} /><meshStandardMaterial color={OXIDE} roughness={0.43} metalness={0.44} /></mesh>
      </group>
      <LaunchTower position={[-12, 2.6, -220]} height={9.6} />
      <LaunchTower position={[12, 4.3, -226]} height={13} accent />
      <LaunchTower position={[-15, 5.5, -248]} height={15.4} accent />
      <LaunchTower position={[15, 3.2, -254]} height={10.8} />
      <mesh position={[0, 4.2, -277]}><planeGeometry args={[31, 16]} /><meshStandardMaterial color="#DAD6CC" emissive="#E8E5DE" emissiveIntensity={0.36} roughness={0.9} /></mesh>
      <mesh position={[0, 3.9, -276.7]}><planeGeometry args={[9, 11]} /><meshBasicMaterial color="#F3EFE6" transparent opacity={0.42} /></mesh>
      <StatMonument value="500+" label="builders in motion" position={[-7.5, 1.1, -226]} />
      <StatMonument value="100+" label="projects launched" position={[7, 2.6, -243]} />
      <StatMonument value="21" label="days to momentum" position={[-4.5, 4.2, -258]} />
      <SpatialText position={[0, 8, -270]} scale={[1.28, 1, 1]} size={5.8} color={PAPER} roughness={0.58} metalness={0.2} outlineWidth={0.006} outlineColor={BLACK}>LAUNCH</SpatialText>
      <SpatialText position={[0, 1.2, -274]} size={1.25} color={OXIDE} outlineWidth={0}>OPEN / SCALE / MOVE</SpatialText>
      <SpatialText position={[10.8, -0.4, -266]} size={0.28} color="#8C8A83" anchorX="right" outlineWidth={0}>HALL 03 / FIELD OF RELEASE</SpatialText>
    </group>
  );
}
