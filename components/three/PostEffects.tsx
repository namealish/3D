"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import type { GraphicsQuality } from "@/lib/graphics-quality";

function rangeWeight(value: number, start: number, end: number, feather = 0.04) {
  const enter = THREE.MathUtils.smoothstep(value, start - feather, start + feather);
  const exit = 1 - THREE.MathUtils.smoothstep(value, end - feather, end + feather);
  return enter * exit;
}

function DirectRenderer() {
  const { gl, scene, camera } = useThree();
  useFrame(() => gl.render(scene, camera), 1);
  return null;
}

function PostProcessor({ quality }: { quality: Exclude<GraphicsQuality, "low"> }) {
  const { gl, scene, camera, size } = useThree();
  const flags = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      ao: params.get("ao") !== "off",
      bloom: params.get("bloom") !== "off",
      fxaa: params.get("fxaa") !== "off",
    };
  }, []);
  const composer = useMemo(() => new EffectComposer(gl), [gl, quality]);
  const bloom = useMemo(() => new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.52, 0.86), []);
  const ssao = useMemo(() => new SSAOPass(scene, camera, 1, 1), [camera, scene]);
  const fxaa = useMemo(() => new ShaderPass(FXAAShader), []);
  const warmupFrames = useMemo(() => ({ count: 0 }), []);

  useEffect(() => {
    composer.renderTarget1.samples = quality === "high" ? 2 : 0;
    composer.renderTarget2.samples = quality === "high" ? 2 : 0;
    composer.addPass(new RenderPass(scene, camera));
    if (quality === "high" && flags.ao) {
      ssao.kernelRadius = 5;
      ssao.minDistance = 0.0015;
      ssao.maxDistance = 0.065;
      composer.addPass(ssao);
    }
    if (flags.bloom) composer.addPass(bloom);
    if (flags.fxaa) composer.addPass(fxaa);
    return () => composer.dispose();
  }, [bloom, camera, composer, flags.ao, flags.bloom, flags.fxaa, fxaa, quality, scene, ssao]);

  useEffect(() => {
    let cancelled = false;
    const warmComposer = () => {
      if (cancelled) return;
      const state: Array<[THREE.Object3D, boolean, boolean]> = [];
      scene.traverse((object) => {
        state.push([object, object.visible, object.frustumCulled]);
        object.visible = true;
        object.frustumCulled = false;
      });
      try {
        composer.render(0);
      } finally {
        state.forEach(([object, visible, frustumCulled]) => {
          object.visible = visible;
          object.frustumCulled = frustumCulled;
        });
        gl.shadowMap.needsUpdate = true;
      }
    };
    const geometryReady = window.setTimeout(warmComposer, 700);
    const textReady = window.setTimeout(warmComposer, 2400);
    return () => {
      cancelled = true;
      window.clearTimeout(geometryReady);
      window.clearTimeout(textReady);
    };
  }, [composer, gl, scene]);

  useEffect(() => {
    const pixelRatio = Math.min(gl.getPixelRatio(), quality === "high" ? 1.5 : 1.25);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(size.width, size.height);
    if (flags.bloom) bloom.setSize(Math.max(1, Math.floor(size.width * 0.55)), Math.max(1, Math.floor(size.height * 0.55)));
    if (quality === "high" && flags.ao) ssao.setSize(Math.max(1, Math.floor(size.width * 0.5)), Math.max(1, Math.floor(size.height * 0.5)));
    if (flags.fxaa) {
      const resolution = fxaa.material.uniforms.resolution.value as THREE.Vector2;
      resolution.set(1 / (size.width * pixelRatio), 1 / (size.height * pixelRatio));
    }
  }, [bloom, composer, flags.ao, flags.bloom, flags.fxaa, fxaa, gl, quality, size.height, size.width, ssao]);

  useFrame(() => {
    const progress = scrollStore.getSnapshot().progress;
    const darkEnergy = Math.max(
      rangeWeight(progress, 0.09, 0.2, 0.025),
      rangeWeight(progress, 0.4, 0.9, 0.03),
    );

    const warming = warmupFrames.count < 2;
    warmupFrames.count += 1;
    if (flags.bloom) {
      bloom.enabled = warming || darkEnergy > 0.025;
      bloom.strength = warming ? 0 : darkEnergy * 0.1;
      bloom.radius = 0.26 + darkEnergy * 0.06;
      bloom.threshold = 1.02;
    }
    composer.render();
  }, 1);

  return null;
}

export function PostEffects({ quality }: { quality: GraphicsQuality }) {
  // Diagnostic escape hatch used by the local performance harness. It leaves
  // the production visual path untouched while allowing an apples-to-apples
  // measurement of the composer cost.
  const disabled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "off";
  return disabled || quality === "low" ? <DirectRenderer /> : <PostProcessor key={quality} quality={quality} />;
}
