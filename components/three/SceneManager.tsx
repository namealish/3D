"use client";

import { CameraRig } from "./CameraRig";
import { Environment } from "./Environment";
import { World } from "./World";
import { Atmosphere } from "./Atmosphere";
import { EpicEffects } from "./EpicEffects";
import { PostEffects } from "./PostEffects";
import type { GraphicsQuality } from "@/lib/graphics-quality";
import { ShaderWarmup } from "./ShaderWarmup";

export function SceneManager({ quality }: { quality: GraphicsQuality }) {
  return (
    <>
      <color attach="background" args={["#E2DED5"]} />
      <fog attach="fog" args={["#E2DED5", 22, 78]} />
      <Environment quality={quality} />
      <Atmosphere />
      <World />
      <EpicEffects />
      <ShaderWarmup />
      <CameraRig />
      <PostEffects quality={quality} />
    </>
  );
}
