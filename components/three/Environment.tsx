"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment as StudioRoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { scrollStore } from "@/lib/scroll-store";
import type { GraphicsQuality } from "@/lib/graphics-quality";

const STOPS = [
  { at: 0, color: new THREE.Color("#E2DED5") },
  { at: 0.085, color: new THREE.Color("#D8D5CE") },
  { at: 0.115, color: new THREE.Color("#151614") },
  { at: 0.19, color: new THREE.Color("#0D0E0D") },
  { at: 0.215, color: new THREE.Color("#EAE7E0") },
  { at: 0.39, color: new THREE.Color("#D8D5CE") },
  { at: 0.47, color: new THREE.Color("#131412") },
  { at: 0.9, color: new THREE.Color("#10110F") },
  { at: 0.94, color: new THREE.Color("#D6D2CA") },
  { at: 1, color: new THREE.Color("#EAE7E0") },
];
const sampled = new THREE.Color();

function colorAt(progress: number) {
  let start = STOPS[0];
  let end = STOPS.at(-1)!;
  for (let i = 0; i < STOPS.length - 1; i += 1) if (progress >= STOPS[i].at && progress <= STOPS[i + 1].at) { start = STOPS[i]; end = STOPS[i + 1]; break; }
  return sampled.copy(start.color).lerp(end.color, THREE.MathUtils.smoothstep(progress, start.at, end.at));
}

function weight(value: number, center: number, radius: number) { return Math.max(0, 1 - Math.abs(value - center) / radius); }
function setLightEnergy(light: THREE.Light | null, intensity: number) {
  if (!light) return;
  light.intensity = intensity;
}

export function Environment({ quality }: { quality: GraphicsQuality }) {
  const { gl, scene } = useThree();
  const ambient = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const hero = useRef<THREE.PointLight>(null);
  const portal = useRef<THREE.PointLight>(null);
  const idea = useRef<THREE.PointLight>(null);
  const process = useRef<THREE.PointLight>(null);
  const community = useRef<THREE.PointLight>(null);
  const results = useRef<THREE.PointLight>(null);
  const final = useRef<THREE.PointLight>(null);
  const roomKey = useRef<THREE.RectAreaLight>(null);
  const portalKey = useRef<THREE.RectAreaLight>(null);
  const ideaKey = useRef<THREE.RectAreaLight>(null);
  const buildKey = useRef<THREE.RectAreaLight>(null);
  const launchKey = useRef<THREE.RectAreaLight>(null);
  const galleryKey = useRef<THREE.RectAreaLight>(null);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const room = new StudioRoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.42;
    return () => {
      scene.environment = null;
      environment.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useFrame(({ scene }, delta) => {
    const progress = scrollStore.getSnapshot().progress;
    const background = colorAt(progress);
    if (scene.background instanceof THREE.Color) scene.background.lerp(background, 1 - Math.exp(-delta * 4));
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(background, 1 - Math.exp(-delta * 4));
      scene.fog.near = THREE.MathUtils.damp(scene.fog.near, progress > 0.4 && progress < 0.91 ? 14 : 22, 3, delta);
      scene.fog.far = THREE.MathUtils.damp(scene.fog.far, progress > 0.4 && progress < 0.91 ? 62 : 78, 3, delta);
    }
    const lightWorld = progress < 0.1 || (progress > 0.2 && progress < 0.4) || progress > 0.91;
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.damp(ambient.current.intensity, lightWorld ? 0.46 : 0.2, 3, delta);
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.damp(hemi.current.intensity, lightWorld ? 0.68 : 0.3, 3, delta);
    setLightEnergy(hero.current, 13 * weight(progress, 0.04, 0.1));
    setLightEnergy(portal.current, 18 * weight(progress, 0.15, 0.1));
    setLightEnergy(idea.current, 14 * weight(progress, 0.29, 0.14));
    setLightEnergy(process.current, 13 * weight(progress, 0.56, 0.17));
    setLightEnergy(community.current, 12 * weight(progress, 0.7, 0.14));
    setLightEnergy(results.current, 14 * weight(progress, 0.86, 0.12));
    setLightEnergy(final.current, 13 * weight(progress, 0.96, 0.09));
    setLightEnergy(roomKey.current, 7 * weight(progress, 0.04, 0.1));
    setLightEnergy(portalKey.current, 10 * weight(progress, 0.15, 0.1));
    setLightEnergy(ideaKey.current, 8 * weight(progress, 0.29, 0.14));
    setLightEnergy(buildKey.current, 8 * weight(progress, 0.61, 0.23));
    setLightEnergy(launchKey.current, 7.5 * weight(progress, 0.79, 0.1));
    setLightEnergy(galleryKey.current, 7 * weight(progress, 0.96, 0.1));
  });

  return <>
    <ambientLight ref={ambient} color="#EAE2D5" intensity={0.46} />
    <hemisphereLight ref={hemi} args={["#E9E1D4", "#24231F", 0.68]} />
    <directionalLight position={[-8, 13, 8]} color="#F1E8DA" intensity={2.25} castShadow shadow-mapSize={[quality === "high" ? 2048 : 1024, quality === "high" ? 2048 : 1024]} shadow-radius={5} shadow-bias={-0.00018} />
    <directionalLight position={[11, 6, -12]} color="#A53D24" intensity={0.32} />
    <pointLight ref={hero} position={[-5, 7, -12]} color="#F1E5D4" intensity={13} distance={44} decay={2} />
    <pointLight ref={portal} position={[0, 2, -46]} color="#E06738" intensity={0} distance={42} decay={2} />
    <pointLight ref={idea} position={[4, 7, -122]} color="#E6D9C8" intensity={0} distance={62} decay={2} />
    <pointLight ref={process} position={[-4, 6, -230]} color="#C74C29" intensity={0} distance={60} decay={2} />
    <pointLight ref={community} position={[5, 7, -290]} color="#B8613C" intensity={0} distance={66} decay={2} />
    <pointLight ref={results} position={[-4, 7, -388]} color="#C74C29" intensity={0} distance={70} decay={2} />
    <pointLight ref={final} position={[0, 8, -452]} color="#E8DED0" intensity={0} distance={64} decay={2} />
    <rectAreaLight ref={roomKey} position={[-3, 7.2, -14]} rotation={[-Math.PI / 2, 0, 0]} color="#F2E9DA" intensity={0} width={11} height={5} />
    <rectAreaLight ref={portalKey} position={[0, 5.8, -49]} rotation={[-Math.PI / 2, 0, 0]} color="#E06738" intensity={0} width={9} height={4} />
    <rectAreaLight ref={ideaKey} position={[3, 7, -113]} rotation={[-Math.PI / 2, 0, 0]} color="#D8C6B2" intensity={0} width={12} height={7} />
    <rectAreaLight ref={buildKey} position={[-2, 7, -264]} rotation={[-Math.PI / 2, 0, 0]} color="#C9825F" intensity={0} width={13} height={7} />
    <rectAreaLight ref={launchKey} position={[0, 7, -349]} rotation={[-Math.PI / 2, 0, 0]} color="#E06738" intensity={0} width={16} height={8} />
    <rectAreaLight ref={galleryKey} position={[0, 8, -462]} rotation={[-Math.PI / 2, 0, 0]} color="#E9DFD0" intensity={0} width={15} height={8} />
  </>;
}
