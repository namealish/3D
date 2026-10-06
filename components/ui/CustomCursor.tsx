"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const element = cursor.current;
    const text = label.current;
    if (!element || !text) return;

    const move = (event: PointerEvent) => {
      element.style.setProperty("--cursor-x", `${event.clientX}px`);
      element.style.setProperty("--cursor-y", `${event.clientY}px`);
    };
    const hover = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("a, button, [data-cursor]") : null;
      const value = target?.dataset.cursor ?? (target ? "OPEN" : "");
      element.classList.toggle("is-active", Boolean(target));
      text.textContent = value;
    };
    const leave = () => element.classList.remove("is-visible");
    const enter = () => element.classList.add("is-visible");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", hover, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    element.classList.add("is-visible");
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  return <div ref={cursor} className="custom-cursor" aria-hidden="true"><span ref={label} /></div>;
}
