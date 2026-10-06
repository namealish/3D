"use client";

const PROJECTS = [
  { number: "01", title: "The Ring", location: "Nevada", year: "2026", type: "Civic landscape", image: "/images/monument.webp", progress: 0.31 },
  { number: "02", title: "Passage House", location: "Atacama", year: "2024", type: "Residential", image: "/images/passage.webp", progress: 0.38 },
  { number: "03", title: "Field Office", location: "Hudson Valley", year: "2025", type: "Workplace", image: "/images/pavilion.webp", progress: 0.46 },
] as const;

export function ProjectIndex({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (progress: number) => void }) {
  return <aside className={`project-index${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Project index" aria-hidden={!open}>
    <div className="index-topline"><span>SELECTED WORKS / 2024—26</span><span>INDEX 03</span></div>
    <button className="index-close" data-cursor="CLOSE" onClick={onClose} aria-label="Close project index"><span>Close</span><i>×</i></button>
    <div className="index-heading"><span>APERTURE ARCHIVE</span><h2>Places made<br />for living.</h2></div>
    <ol className="project-list">{PROJECTS.map((project) => <li key={project.title}><button data-cursor="VIEW" onClick={() => onSelect(project.progress)}><span className="project-number">{project.number}</span><span className="project-thumb"><img src={project.image} alt="" /></span><strong>{project.title}</strong><span className="project-place">{project.location} / {project.year}</span><span className="project-type">{project.type}</span><i aria-hidden="true">↗</i></button></li>)}</ol>
    <div className="index-footer"><span><small>Practice</small>Architecture · Objects · Places</span><span><small>Studios</small>Astana · Copenhagen</span><span><small>Contact</small>studio@aperture.example</span></div>
  </aside>;
}
