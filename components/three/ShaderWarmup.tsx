"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type Renderable = THREE.Object3D & { frustumCulled: boolean };

export function ShaderWarmup() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      const state: Array<[THREE.Object3D, boolean, boolean]> = [];
      scene.traverse((object) => {
        const renderable = object as Renderable;
        state.push([object, object.visible, renderable.frustumCulled]);
        object.visible = true;
        renderable.frustumCulled = false;
      });
      try {
        gl.compile(scene, camera);
      } finally {
        state.forEach(([object, visible, frustumCulled]) => {
          object.visible = visible;
          (object as Renderable).frustumCulled = frustumCulled;
        });
        gl.shadowMap.needsUpdate = true;
      }
    };
    const first = window.setTimeout(warm, 500);
    const textReady = window.setTimeout(warm, 2100);
    return () => {
      cancelled = true;
      window.clearTimeout(first);
      window.clearTimeout(textReady);
    };
  }, [camera, gl, scene]);

  return null;
}
