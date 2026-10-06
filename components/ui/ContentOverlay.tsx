import type { CHAPTERS } from "@/lib/journey";

type Chapter = (typeof CHAPTERS)[number];

function PricingCards() {
  return <div className="pricing-cards">
    <article><span>01 / START</span><h2>Launch Sprint</h2><strong>$2,400</strong><p>Direction, prototype and a focused first release.</p><ul><li>7-day direction</li><li>Interactive prototype</li><li>Launch playbook</li></ul><a data-cursor="OPEN" href="mailto:studio@aperture.example?subject=Launch%20Sprint">Choose sprint <i>↗</i></a></article>
    <article className="featured"><span>02 / SCALE <b>POPULAR</b></span><h2>Build System</h2><strong>$6,800</strong><p>Product, launch system and support through first users.</p><ul><li>Product system</li><li>Production build</li><li>30-day support</li></ul><a data-cursor="OPEN" href="mailto:studio@aperture.example?subject=Build%20System">Choose system <i>↗</i></a></article>
  </div>;
}

export function ContentOverlay({ chapter, initialActive, elementRef }: { chapter: Chapter; initialActive: boolean; elementRef: (element: HTMLElement | null) => void }) {
  return <section ref={elementRef} className={`content-overlay chapter-${chapter.id}`} style={{ opacity: initialActive ? 1 : 0 }} aria-hidden={!initialActive} data-index={chapter.index}>
    <div className="eyebrow"><span>{chapter.index}</span>{chapter.eyebrow}</div>
    <h1>{chapter.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
    {chapter.id !== "pricing" && <p>{chapter.body}</p>}
    {chapter.id === "hero" && <button className="hero-cta" data-cursor="GO" onClick={() => window.scrollTo({ top: innerHeight * 2.1, behavior: "smooth" })}>Explore the system <i>↗</i></button>}
    {chapter.id === "pricing" && <PricingCards />}
    <div className="chapter-meta"><span>{chapter.meta}</span><i /></div>
  </section>;
}
