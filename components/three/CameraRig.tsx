"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_POSES_DESKTOP, CAMERA_POSES_MOBILE, type CameraPose } from "@/lib/journey";
import { scrollStore } from "@/lib/scroll-store";

const poseEndPosition = new THREE.Vector3();
const poseEndTarget = new THREE.Vector3();

function samplePose(poses: CameraPose[], progress: number, position: THREE.Vector3, target: THREE.Vector3) {
  let start = poses[0];
  let end = poses[poses.length - 1];
  for (let index = 0; index < poses.length - 1; index += 1) {
    if (progress >= poses[index].at && progress <= poses[index + 1].at) {
      start = poses[index];
      end = poses[index + 1];
      break;
    }
  }
  const range = Math.max(0.0001, end.at - start.at);
  const raw = THREE.MathUtils.clamp((progress - start.at) / range, 0, 1);
  const eased = raw * raw * (3 - 2 * raw);
  position.set(...start.position).lerp(poseEndPosition.set(...end.position), eased);
  target.set(...start.target).lerp(poseEndTarget.set(...end.target), eased);
  return THREE.MathUtils.lerp(start.fov, end.fov, eased);
}

export function CameraRig() {
  const { camera, size } = useThree();
  const desired = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(...CAMERA_POSES_DESKTOP[0].target), []);
  const smoothedTarget = useMemo(() => new THREE.Vector3(...CAMERA_POSES_DESKTOP[0].target), []);

  useFrame((state, delta) => {
    const { progress, velocity } = scrollStore.getSnapshot();
    const poses = size.width < 720 ? CAMERA_POSES_MOBILE : CAMERA_POSES_DESKTOP;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextFov = samplePose(poses, progress, desired, desiredTarget);
    const damping = reduced ? 30 : 3.6;
    camera.position.lerp(desired, 1 - Math.exp(-delta * damping));
    if (!reduced) {
      desiredTarget.x += state.pointer.x * 0.035;
      desiredTarget.y += state.pointer.y * 0.022;
    }
    smoothedTarget.lerp(desiredTarget, 1 - Math.exp(-delta * damping * 1.15));
    camera.lookAt(smoothedTarget);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.rotation.z = THREE.MathUtils.damp(
      perspective.rotation.z,
      reduced ? 0 : THREE.MathUtils.clamp(-velocity * 0.000025, -0.008, 0.008),
      4,
      delta,
    );
    perspective.fov = THREE.MathUtils.damp(perspective.fov, nextFov, 4, delta);
    perspective.updateProjectionMatrix();
    const exposure = progress < 0.1 ? 0.82 : progress < 0.2 ? 0.76 : progress < 0.4 ? 0.86 : progress < 0.91 ? 0.8 : 0.86;
    state.gl.toneMappingExposure = THREE.MathUtils.damp(state.gl.toneMappingExposure, exposure, 3, delta);
  });

  return null;
}
