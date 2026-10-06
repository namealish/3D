"use client";

import { Text } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type SpatialTextProps = ThreeElements["group"] & {
  children: string;
  size?: number;
  color?: string;
  anchorX?: "left" | "center" | "right";
  roughness?: number;
  metalness?: number;
  opacity?: number;
  outlineWidth?: number;
  outlineColor?: string;
  depth?: number;
  sideColor?: string;
};

export function SpatialText({
  children,
  size = 2,
  color = "#E8E5DE",
  anchorX = "center",
  roughness = 0.72,
  metalness = 0.1,
  opacity = 1,
  outlineWidth = 0.004,
  outlineColor = "#090A09",
  depth = 0,
  sideColor = "#242523",
  ...props
}: SpatialTextProps) {
  return (
    <group {...props}>
      {depth > 0 && Array.from({ length: 3 }, (_, index) => <Text key={index} position={[0, 0, -depth * ((index + 1) / 3)]} fontSize={size} anchorX={anchorX} anchorY="middle" color={sideColor} letterSpacing={-0.055} castShadow receiveShadow>
        {children}
        <meshStandardMaterial color={sideColor} roughness={0.62} metalness={0.42} />
      </Text>)}
      <Text fontSize={size} anchorX={anchorX} anchorY="middle" color={color} letterSpacing={-0.055} outlineWidth={outlineWidth} outlineColor={outlineColor} castShadow receiveShadow>
        {children}
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} transparent={opacity < 1} opacity={opacity} />
      </Text>
    </group>
  );
}
