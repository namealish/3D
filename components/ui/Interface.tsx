"use client";

import { useEffect, useRef } from "react";
import { CHAPTERS } from "@/lib/journey";
import { scrollStore } from "@/lib/scroll-store";
import { ContentOverlay } from "./ContentOverlay";

export function Interface() {
  const root = useRef<HTMLDivElement>(null);
  const statusIndex = useRef<HTMLSpanElement>(null);
  const progressLabel = useRef<HTMLSpanElement>(null);
  const progressBar = useRef<HTMLElement>(null);
  const progressValue = useRef<HTMLElement>(null);
  const overlays = useRef<Array<HTMLElement | null>>([]);
  const railButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const goTo = (value: number) => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * value, behavior: "smooth" });

  useEffect(() => {
    const lastOpacity: number[] = CHAPTERS.map((_, index) => index === 0 ? 1 : 0);
    let activeIndex = 0;
    let lastPercent = -1;
    let lastLabel = "";
    const smoothstep = (from: number, to: number, value: number) => {
      const amount = Math.max(0, Math.min(1, (value - from) / (to - from)));
      return amount * amount * (3 - 2 * amount);
    };
    const update = () => {
      const { progress } = scrollStore.getSnapshot();
      const found = CHAPTERS.findIndex((chapter) => progress >= chapter.from && progress < chapter.to);
      const nextIndex = found < 0 ? CHAPTERS.length - 1 : found;
      const active = CHAPTERS[nextIndex];
      if (nextIndex !== activeIndex) {
        activeIndex = nextIndex;
        if (root.current) root.current.className = `interface theme-${active.theme} chapter-state-${active.id}`;
        if (statusIndex.current) statusIndex.current.textContent = active.index;
        railButtons.current.forEach((button, index) => button?.classList.toggle("active", index === activeIndex));
        overlays.current.forEach((overlay, index) => overlay?.setAttribute("aria-hidden", String(index !== activeIndex)));
      }
      const blend = 0.012;
      CHAPTERS.forEach((chapter, index) => {
        const enter = index === 0 ? 1 : smoothstep(chapter.from - blend, chapter.from + blend, progress);
        const exit = index === CHAPTERS.length - 1 ? 1 : 1 - smoothstep(chapter.to - blend, chapter.to + blend, progress);
        const opacity = enter * exit;
        if (Math.abs(opacity - lastOpacity[index]) > 0.004) {
          lastOpacity[index] = opacity;
          if (overlays.current[index]) overlays.current[index]!.style.opacity = String(opacity);
        }
      });
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${Math.max(.012, progress)})`;
      const percent = Math.round(progress * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        if (progressValue.current) progressValue.current.textContent = String(percent).padStart(3, "0");
      }
      const label = progress < .03 ? "SCROLL TO ENTER" : active.eyebrow;
      if (label !== lastLabel) {
        lastLabel = label;
        if (progressLabel.current) progressLabel.current.textContent = label;
      }
    };
    update();
    const unsubscribe = scrollStore.subscribe(update);
    return () => { unsubscribe(); };
  }, []);

  return <div ref={root} className="interface theme-light chapter-state-hero">
    <header className="nav">
      <button className="wordmark" data-cursor="TOP" onClick={() => goTo(0)}><b>A<span>+</span></b><span>APERTURE<small>AI BUILD STUDIO</small></span></button>
      <nav className="nav-links"><button onClick={() => goTo(0.28)}>Work</button><button onClick={() => goTo(0.49)}>Process</button><button onClick={() => goTo(0.64)}>Community</button></nav>
      <button className="nav-cta" data-cursor="GO" onClick={() => goTo(0.965)}>Start building <i>↗</i></button>
    </header>
    <div className="viewport-frame" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="system-status" aria-hidden="true"><i /> REALTIME / WEBGL <span ref={statusIndex}>01</span></div>
    <aside className="chapter-rail" aria-label="Journey chapters">{CHAPTERS.map((chapter, index) => <button ref={(element) => { railButtons.current[index] = element; }} key={chapter.id} className={index === 0 ? "active" : ""} onClick={() => goTo(chapter.from)} aria-label={`Go to ${chapter.eyebrow}`}><span>{chapter.index}</span><i /></button>)}</aside>
    {CHAPTERS.map((chapter, index) => <ContentOverlay key={chapter.id} chapter={chapter} initialActive={index === 0} elementRef={(element) => { overlays.current[index] = element; }} />)}
    <div className="scroll-progress"><span ref={progressLabel}>SCROLL TO ENTER</span><i><b ref={progressBar} style={{ transform: "scaleX(.012)" }} /></i><em ref={progressValue}>000</em></div>
  </div>;
}
