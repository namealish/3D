export type Vec3Tuple = [number, number, number];
export type CameraPose = { at: number; position: Vec3Tuple; target: Vec3Tuple; fov: number };

export const CHAPTERS = [
  { id: "hero", index: "01", from: 0, to: 0.09, eyebrow: "Aperture AI / 2026", title: "BUILD\nYOUR\nIDEA.", body: "From first thought to a product people can use, share and grow.", meta: "Scroll to begin", theme: "light" },
  { id: "portal", index: "02", from: 0.09, to: 0.2, eyebrow: "Enter the system", title: "GO\nTHROUGH.", body: "The screen becomes the path. Keep moving.", meta: "Portal / Live", theme: "dark" },
  { id: "idea", index: "03", from: 0.2, to: 0.28, eyebrow: "Every launch starts here", title: "IDEA", body: "One clear thought can reorganize everything around it.", meta: "Origin / 001", theme: "light" },
  { id: "universe", index: "04", from: 0.28, to: 0.4, eyebrow: "Idea universe", title: "MAKE IT\nVISIBLE.", body: "Research, references, diagrams and prototypes become one shared field.", meta: "Signals / 024", theme: "light" },
  { id: "dark-world", index: "05", from: 0.4, to: 0.49, eyebrow: "Crossing the line", title: "FROM\nTHOUGHT\nTO SYSTEM.", body: "The field resolves into a direction you can build.", meta: "Depth / 108", theme: "dark" },
  { id: "process", index: "06", from: 0.49, to: 0.64, eyebrow: "Three decisive moves", title: "PICK.\nBUILD.\nLAUNCH.", body: "A focused sequence for turning intent into momentum.", meta: "Process / 03", theme: "dark" },
  { id: "community", index: "07", from: 0.64, to: 0.74, eyebrow: "Built in public", title: "YOU ARE\nNOT ALONE.", body: "Feedback, proof and community move alongside the product.", meta: "Network / Live", theme: "dark" },
  { id: "launch", index: "08", from: 0.74, to: 0.82, eyebrow: "Now it happens", title: "LAUNCH", body: "Release the work. Let the world answer.", meta: "Release / 001", theme: "dark" },
  { id: "results", index: "09", from: 0.82, to: 0.91, eyebrow: "Proof in motion", title: "REAL\nRESULTS.", body: "Products ship, audiences gather and numbers begin to move.", meta: "Signals / Verified", theme: "dark" },
  { id: "builders", index: "10", from: 0.91, to: 0.965, eyebrow: "A new generation", title: "AI\nBUILDERS", body: "Small teams with the reach to build what used to require institutions.", meta: "Future / Present", theme: "light" },
  { id: "pricing", index: "11", from: 0.965, to: 1.01, eyebrow: "Start building", title: "CHOOSE\nYOUR PLAN.", body: "A focused start or a complete launch system. Choose the pace that fits.", meta: "Plans / 02", theme: "light" },
] as const;

export const CAMERA_POSES_DESKTOP: CameraPose[] = [
  { at: 0, position: [-5.2, 2.9, 16], target: [1.8, 0.8, -20], fov: 43 },
  { at: 0.07, position: [-2.2, 2.1, 2], target: [1.6, 0.9, -22], fov: 41 },
  { at: 0.12, position: [0.7, 1.45, -21], target: [0.5, 1.1, -43], fov: 46 },
  { at: 0.18, position: [0, 1.3, -56], target: [0, 1.2, -78], fov: 54 },
  { at: 0.205, position: [0, 1.8, -76], target: [0, 1.5, -92], fov: 48 },
  { at: 0.26, position: [-5.8, 2.6, -92], target: [0, 1.4, -112], fov: 45 },
  { at: 0.32, position: [5.6, 3.2, -113], target: [0, 1.3, -137], fov: 49 },
  { at: 0.4, position: [-2.5, 2.3, -153], target: [0, 0.6, -178], fov: 50 },
  { at: 0.46, position: [0, 2.0, -181], target: [0, 0.6, -207], fov: 47 },
  { at: 0.52, position: [-6.2, 2.7, -201], target: [-5, 1.6, -216], fov: 44 },
  { at: 0.58, position: [4.8, 2.2, -222], target: [4, 1.5, -236], fov: 43 },
  { at: 0.64, position: [-4.5, 3.0, -245], target: [0, 1.8, -271], fov: 47 },
  { at: 0.7, position: [5.5, 3.4, -282], target: [0, 1.8, -310], fov: 50 },
  { at: 0.76, position: [0, 3.4, -317], target: [0, 2.5, -338], fov: 45 },
  { at: 0.81, position: [0, 2.2, -330], target: [0, 2.4, -349], fov: 52 },
  { at: 0.85, position: [-5.4, 3.3, -356], target: [0, 2.1, -379], fov: 47 },
  { at: 0.9, position: [5.2, 4.1, -395], target: [0, 2.4, -421], fov: 50 },
  { at: 0.94, position: [0, 3.2, -419], target: [0, 2.2, -440], fov: 46 },
  { at: 0.965, position: [0, 2.5, -441], target: [0, 1.8, -460], fov: 46 },
  { at: 1, position: [0, 4.2, -445], target: [0, 1.2, -466], fov: 51 },
];

export const CAMERA_POSES_MOBILE: CameraPose[] = [
  { at: 0, position: [-2.6, 2.4, 17], target: [1.2, 0.8, -20], fov: 56 },
  { at: 0.09, position: [-1, 1.8, -8], target: [0.8, 1, -29], fov: 54 },
  { at: 0.18, position: [0, 1.4, -57], target: [0, 1.2, -79], fov: 61 },
  { at: 0.25, position: [-2.8, 2.2, -91], target: [0, 1.3, -112], fov: 58 },
  { at: 0.34, position: [2.8, 2.6, -124], target: [0, 1.2, -146], fov: 59 },
  { at: 0.46, position: [0, 1.9, -181], target: [0, 0.6, -207], fov: 58 },
  { at: 0.57, position: [2.6, 2.2, -222], target: [2, 1.4, -239], fov: 57 },
  { at: 0.68, position: [-2.8, 2.8, -274], target: [0, 1.7, -302], fov: 60 },
  { at: 0.79, position: [0, 2.4, -328], target: [0, 2.2, -349], fov: 61 },
  { at: 0.88, position: [2.8, 3.3, -387], target: [0, 2.1, -417], fov: 59 },
  { at: 0.95, position: [0, 2.8, -430], target: [0, 2, -451], fov: 58 },
  { at: 1, position: [0, 4, -446], target: [0, 1.2, -466], fov: 62 },
];

export const MEDIA = [
  { src: "/images/monument.webp", title: "Signal 01", meta: "Structure", position: [-5.5, 1.2, -112] as Vec3Tuple, rotation: [0, 0.35, 0] as Vec3Tuple, size: [7, 4.2] as [number, number] },
  { src: "/images/passage.webp", title: "Signal 02", meta: "Passage", position: [5.5, 1.7, -130] as Vec3Tuple, rotation: [0, -0.42, 0] as Vec3Tuple, size: [6.6, 4] as [number, number] },
  { src: "/images/pavilion.webp", title: "Signal 03", meta: "System", position: [-5, 1.5, -148] as Vec3Tuple, rotation: [0, 0.36, 0] as Vec3Tuple, size: [6.8, 4.1] as [number, number] },
] as const;
