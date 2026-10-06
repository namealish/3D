"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Lenis from "lenis";
import { scrollStore } from "@/lib/scroll-store";

export function ScrollEngine() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      autoRaf: false,
      lerp: reduceMotion ? 1 : 0.1,
      smoothWheel: !reduceMotion,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.1,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ({ progress, velocity }: { progress: number; velocity: number }) => {
      scrollStore.set({ progress, velocity });
    });
    const limit = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollStore.set({ progress: window.scrollY / limit, velocity: 0 });

    return () => {
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useFrame(({ clock }) => lenisRef.current?.raf(clock.elapsedTime * 1000), -100);

  return null;
}
