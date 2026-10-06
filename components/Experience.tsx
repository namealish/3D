"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { SceneManager } from "@/components/three/SceneManager";
import { Interface } from "@/components/ui/Interface";
import { LoadingCurtain } from "@/components/ui/LoadingCurtain";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ScrollEngine } from "@/hooks/useScrollEngine";
import { lowerQuality, QUALITY_DPR, raiseQuality, type GraphicsQuality } from "@/lib/graphics-quality";

export function Experience() {
  const [quality, setQuality] = useState<GraphicsQuality>("medium");
  const [diagnostics, setDiagnostics] = useState<{ quality: GraphicsQuality | null; shadowsDisabled: boolean }>({ quality: null, shadowsDisabled: false });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("quality");
    setDiagnostics({
      quality: requested === "low" || requested === "medium" || requested === "high" ? requested : null,
      shadowsDisabled: params.get("shadows") === "off",
    });
  }, []);

  const activeQuality = diagnostics.quality ?? quality;

  return (
    <main>
      <a className="skip-link" href="#accessible-story">Skip immersive experience</a>
      <LoadingCurtain />
      <div className="canvas-shell" aria-hidden="true">
        <Canvas
          dpr={QUALITY_DPR[activeQuality]}
          camera={{ position: [0, 1.4, 12], fov: 46, near: 0.08, far: 180 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.86 }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.shadowMap.enabled = !diagnostics.shadowsDisabled;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            gl.shadowMap.autoUpdate = false;
            gl.shadowMap.needsUpdate = true;
          }}
          shadows={!diagnostics.shadowsDisabled}
        >
          <PerformanceMonitor
            flipflops={2}
            onIncline={() => setQuality((value) => raiseQuality(value))}
            onDecline={() => setQuality((value) => lowerQuality(value))}
            onFallback={() => setQuality("low")}
          />
          <ScrollEngine />
          <Suspense fallback={null}>
            <SceneManager quality={activeQuality} />
          </Suspense>
        </Canvas>
      </div>
      <Interface />
      <CustomCursor />
      <div className="scroll-space" aria-hidden="true" />
      <section id="accessible-story" className="sr-story" aria-label="Aperture Studio overview">
        <h1>Aperture — Works in Space</h1>
        <p>Aperture builds quiet monuments for public life, working globally across cultural, civic and residential architecture.</p>
        <h2>Selected works</h2>
        <ul><li>The Ring, Nevada, 2026</li><li>Passage House, Atacama, 2024</li><li>Field Office, Hudson Valley, 2025</li></ul>
        <a href="mailto:studio@aperture.example">Start a project</a>
      </section>
    </main>
  );
}
