"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";
import { PortalScene } from "./PortalScene";
import { IdeaScene } from "./IdeaScene";
import { IdeaUniverse } from "./IdeaUniverse";
import { DarkWorld } from "./DarkWorld";
import { ProcessScene } from "./ProcessScene";
import { CommunityScene } from "./CommunityScene";
import { LaunchMoment } from "./LaunchMoment";
import { ResultsScene } from "./ResultsScene";
import { BuildersScene } from "./BuildersScene";
import { PricingScene } from "./PricingScene";
import { scrollStore } from "@/lib/scroll-store";

const VISIBILITY_WINDOWS: Array<[number, number]> = [
  [-0.02, 0.135],
  [0.035, 0.23],
  [0.15, 0.325],
  [0.22, 0.44],
  [0.34, 0.55],
  [0.43, 0.7],
  [0.56, 0.8],
  [0.67, 0.87],
  [0.76, 0.955],
  [0.84, 1.02],
  [0.9, 1.02],
];

export function World() {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const visibilityMask = useRef(-1);

  useFrame(() => {
    const progress = scrollStore.getSnapshot().progress;
    let nextMask = 0;
    VISIBILITY_WINDOWS.forEach(([start, end], index) => {
      const visible = progress >= start && progress <= end;
      if (visible) nextMask |= 1 << index;
      if (groups.current[index] && groups.current[index]!.visible !== visible) groups.current[index]!.visible = visible;
    });
    if (visibilityMask.current !== nextMask) {
      visibilityMask.current = nextMask;
    }
  }, -50);

  const register = (index: number) => (group: THREE.Group | null) => { groups.current[index] = group; };

  return <group>
    <group ref={register(0)}><HeroScene /></group>
    <group ref={register(1)}><PortalScene /></group>
    <group ref={register(2)}><IdeaScene /></group>
    <group ref={register(3)}><IdeaUniverse /></group>
    <group ref={register(4)}><DarkWorld /></group>
    <group ref={register(5)}><ProcessScene /></group>
    <group ref={register(6)}><CommunityScene /></group>
    <group ref={register(7)}><LaunchMoment /></group>
    <group ref={register(8)}><ResultsScene /></group>
    <group ref={register(9)}><BuildersScene /></group>
    <group ref={register(10)}><PricingScene /></group>
  </group>;
}
