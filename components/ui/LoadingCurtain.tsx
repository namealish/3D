"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export function LoadingCurtain() {
  const { active, progress, total } = useProgress();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (total === 0 || active || progress < 99) return;
    const timer = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(timer);
  }, [active, progress, total]);
  useEffect(() => {
    const fallback = window.setTimeout(() => setReady(true), 4200);
    return () => window.clearTimeout(fallback);
  }, []);
  const value = Math.min(100, Math.max(0, Math.round(progress)));
  return <div className={`loading-curtain${ready ? " is-ready" : ""}`} aria-hidden={ready}>
    <div className="loader-top"><span>APERTURE / DIGITAL SPACE</span><span>EST. 2012</span></div>
    <div className="loader-mark">A<span>°</span></div>
    <div className="loader-status"><span>Constructing space</span><strong>{String(value).padStart(3, "0")}<small>%</small></strong><i><b style={{ transform: `scaleX(${Math.max(0.02, value / 100)})` }} /></i></div>
    <div className="loader-bottom"><span>FORM</span><span>LIGHT</span><span>LIFE</span></div>
  </div>;
}
