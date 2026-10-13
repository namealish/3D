import * as THREE from '/node_modules/three/build/three.module.min.js';
import { RectAreaLightUniformsLib } from '/node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { HouseModel } from '/villa-model.js?v=performance-pass-2';
import { VillaEnvironment } from '/villa-environment.js?v=performance-pass-2';

RectAreaLightUniformsLib.init();

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const detectQuality = () => {
  const coarse=window.matchMedia('(pointer:coarse)').matches;
  const mobile=window.innerWidth<=680||coarse;
  const cores=navigator.hardwareConcurrency||4;
  const memory=navigator.deviceMemory;
  const constrained=cores<=4||(memory!=null&&memory<=4);
  const tier=mobile?'low':constrained||window.innerWidth<1280?'medium':'high';
  const settings={
    high:{dpr:1.5,shadows:true,shadowMap:2048,vegetation:1,terrainSegments:128,mountainSegments:320,mountainRings:24,anisotropy:8,waterTexture:512,waterFPS:60,reflectionFPS:24},
    medium:{dpr:1.25,shadows:true,shadowMap:1024,vegetation:.72,terrainSegments:96,mountainSegments:240,mountainRings:18,anisotropy:4,waterTexture:384,waterFPS:45,reflectionFPS:18},
    low:{dpr:1,shadows:false,shadowMap:512,vegetation:.38,terrainSegments:64,mountainSegments:160,mountainRings:14,anisotropy:2,waterTexture:256,waterFPS:30,reflectionFPS:12}
  }[tier];
  return {tier,mobile,...settings};
};

class ConstructionScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.wrap = canvas.closest('.timeline-canvas-wrap');
    this.quality=detectQuality();
    this.qualityTier=this.quality.tier;
    this.mobile=this.quality.mobile;
    this.constructionProgress = clamp(Number(window.constructionProgress) || 0);
    this.pointer = new THREE.Vector2();
    this.currentPointer = new THREE.Vector2();
    this.active = true;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.lastFrameTime = performance.now();
    this.cameraGoal = new THREE.Vector3(-20,10,31);
    this.lookGoal = new THREE.Vector3(0,1.2,5);
    this.lookCurrent = this.lookGoal.clone();
    this.renderTarget = this.lookGoal.clone();
    this.cameraKeys = [
      { at:0,position:new THREE.Vector3(-20,10,31),target:new THREE.Vector3(0,1.2,5) },
      { at:.4,position:new THREE.Vector3(-19,8.1,30),target:new THREE.Vector3(0,2.9,4.5) },
      { at:.76,position:new THREE.Vector3(-16.5,6.2,32.5),target:new THREE.Vector3(0,3.5,5.2) },
      { at:1,position:new THREE.Vector3(-16,6.4,36.8),target:new THREE.Vector3(.25,3.3,5.8) }
    ];
    this.lastWaterRender=0;
    this.lastChange = performance.now();
    this.initialize();
  }

  initialize() {
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas,antialias:true,alpha:false,powerPreference:'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.quality.dpr));
      this.renderer.shadowMap.enabled=this.quality.shadows;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate=false;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = .9;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.scene = new THREE.Scene();
      this.scene.name = 'ARKEN mountain estate construction visualization';
      this.scene.background = new THREE.Color(0x829aaf);
      this.scene.fog = new THREE.Fog(0xb0b7c1,this.mobile?115:58,this.mobile?285:205);
      this.camera = new THREE.PerspectiveCamera(this.mobile?48:37,1,.1,300);
      this.camera.name = 'Architectural photography camera';
      this.camera.position.copy(this.cameraGoal);
      this.addEnvironment();
      this.house = new HouseModel(this.scene,this.quality);
      this.environment.connectReflections(this.house);
      this.environment.setProgress(this.constructionProgress);
      this.house.setConstructionProgress(this.constructionProgress);
      this.updateCameraGoal(true);
      this.resize();
      this.camera.position.copy(this.cameraGoal);
      this.camera.lookAt(this.lookGoal);
      if(this.renderer.shadowMap.enabled) this.renderer.shadowMap.needsUpdate=true;
      this.renderer.render(this.scene,this.camera);
      this.wrap.classList.add('is-ready');
      this.bindEvents();
      this.render();
      window.arkenConstructionScene = this;
      window.dispatchEvent(new Event('arken:scene-ready'));
      window.arkenConstructionDebug = { houseUUID:this.house.root.uuid,groupCounts:this.house.getGroupCounts(),renderer:'Three.js WebGLRenderer',cameraFov:this.camera.fov,qualityTier:this.qualityTier,dpr:this.renderer.getPixelRatio() };
      if (new URLSearchParams(window.location.search).has('debug3d')) {
        console.table(window.arkenConstructionDebug.groupCounts);
        document.documentElement.dataset.constructionCounts = JSON.stringify(window.arkenConstructionDebug.groupCounts);
      }
    } catch (error) {
      console.error('ARKEN WebGL scene could not initialize.',error);
      this.wrap.classList.add('is-error');
    }
  }

  addEnvironment() {
    this.environment = new VillaEnvironment(this.scene,this.renderer,this.quality);
    this.environmentTarget = this.environment.environmentTarget;
    const sunDirection = this.environment.sunDirection;

    const hemisphere = new THREE.HemisphereLight(0xb6cee4,0x998469,1.15);
    hemisphere.name = 'Soft natural daylight skylight';
    this.scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xffebd0,2.4);
    key.name = 'Warm late-afternoon architectural sunlight';
    key.position.copy(sunDirection).multiplyScalar(60);
    key.target.position.set(0,1,6);
    key.castShadow=this.quality.shadows;
    key.shadow.mapSize.set(this.quality.shadowMap,this.quality.shadowMap);
    key.shadow.camera.left=-22;
    key.shadow.camera.right=22;
    key.shadow.camera.top=18;
    key.shadow.camera.bottom=-18;
    key.shadow.camera.near = .5;
    key.shadow.camera.far = 100;
    key.shadow.bias = -.00018;
    key.shadow.normalBias = .035;
    key.shadow.radius = 3;
    this.scene.add(key,key.target);
    const fill = new THREE.DirectionalLight(0xb0c9de,.52);
    fill.name = 'Soft camera-side daylight fill';
    fill.position.set(-15,12,26);
    this.scene.add(fill);
  }

  bindEvents() {
    this.resizeObserver = new ResizeObserver(() => {
      if(this.resizeFrame) return;
      this.resizeFrame=requestAnimationFrame(()=>{
        this.resizeFrame=null;
        this.resize();
        this.lastChange=performance.now();
        if(this.active&&!this.frame) this.render();
      });
    });
    this.resizeObserver.observe(this.wrap);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.active = entry.isIntersecting;
      if (this.active && !this.frame) this.render();
    },{ rootMargin:'35% 0px' });
    this.intersectionObserver.observe(this.wrap);
    this.visibilityHandler=() => {
      this.lastFrameTime = performance.now();
      if (!document.hidden && this.active && !this.frame) this.render();
    };
    document.addEventListener('visibilitychange',this.visibilityHandler);
    this.motionHandler=() => {
      if(this.active && !this.frame) this.render();
    };
    this.reducedMotion.addEventListener('change',this.motionHandler);
    if (window.matchMedia('(pointer:fine)').matches) {
      this.pointerHandler=(event) => {
        this.pointer.x = (event.clientX/window.innerWidth-.5)*.16;
        this.pointer.y = (event.clientY/window.innerHeight-.5)*.08;
        this.lastChange = performance.now();
        if (this.active && !this.frame) this.render();
      };
      window.addEventListener('pointermove',this.pointerHandler,{ passive:true });
    }
    this.contextLossHandler=(event) => {
      event.preventDefault();
      this.wrap.classList.add('is-error');
    };
    this.canvas.addEventListener('webglcontextlost',this.contextLossHandler);
    this.pageHideHandler=event=>{if(!event.persisted) this.dispose();};
    window.addEventListener('pagehide',this.pageHideHandler,{once:true});
  }

  setConstructionProgress(progress) {
    const next = clamp(Number(progress) || 0);
    if (next === this.constructionProgress) return;
    this.constructionProgress = next;
    const bounds=this.wrap.getBoundingClientRect();
    if(bounds.bottom>-innerHeight*.35&&bounds.top<innerHeight*1.35) this.active=true;
    this.house.setConstructionProgress(next);
    this.environment.setProgress(next);
    this.updateCameraGoal();
    if(this.renderer.shadowMap.enabled) this.renderer.shadowMap.needsUpdate=true;
    this.lastChange = performance.now();
    if (!this.frame) this.render();
  }

  updateCameraGoal(initial=false) {
    const keys=this.cameraKeys;
    let left=keys[0];
    let right=keys[1];
    for (let index=1; index<keys.length; index+=1) {
      if (this.constructionProgress<=keys[index].at) { left=keys[index-1]; right=keys[index]; break; }
    }
    if (this.constructionProgress>=1) { left=keys[keys.length-2]; right=keys[keys.length-1]; }
    const t = smooth((this.constructionProgress-left.at)/Math.max(.001,right.at-left.at));
    this.cameraGoal.lerpVectors(left.position,right.position,t);
    this.lookGoal.lerpVectors(left.target,right.target,t);
    if (this.mobile) {
      this.cameraGoal.sub(this.lookGoal).multiplyScalar(2.15).add(this.lookGoal);
      this.lookGoal.y -= .55;
    }
    if (initial) this.lookCurrent.copy(this.lookGoal);
  }

  resize() {
    if (!this.renderer) return;
    const rect = this.wrap.getBoundingClientRect();
    const width = Math.max(1,Math.round(rect.width));
    const height = Math.max(1,Math.round(rect.height));
    this.renderer.setSize(width,height,false);
    this.camera.aspect = width/height;
    this.camera.updateProjectionMatrix();
  }

  render = () => {
    this.frame = null;
    if (!this.renderer) return;
    this.currentPointer.lerp(this.pointer,.055);
    this.camera.position.lerp(this.cameraGoal,.07);
    const target=this.renderTarget.copy(this.lookGoal);
    target.x+=this.currentPointer.x;
    target.y-=this.currentPointer.y;
    this.lookCurrent.lerp(target,.07);
    this.camera.lookAt(this.lookCurrent);
    const now = performance.now();
    const animateWater = this.active && !document.hidden && !this.reducedMotion.matches && this.house.poolWater.visible;
    const waterDue=animateWater&&(now-this.lastWaterRender>=1000/this.quality.waterFPS);
    if(waterDue) {
      this.house.updateWater(Math.min(.06,(now-this.lastFrameTime)/1000));
      this.lastWaterRender=now;
    }
    this.lastFrameTime = now;
    const moving = this.camera.position.distanceToSquared(this.cameraGoal)>.00002 || this.lookCurrent.distanceToSquared(target)>.00001 || this.currentPointer.distanceToSquared(this.pointer)>.00001;
    if(moving||now-this.lastChange<560||waterDue) this.renderer.render(this.scene,this.camera);
    if (this.active && !document.hidden && (moving || now-this.lastChange<560 || animateWater)) this.frame=requestAnimationFrame(this.render);
  };

  dispose() {
    if(this.disposed) return;
    this.disposed=true;
    cancelAnimationFrame(this.frame);
    cancelAnimationFrame(this.resizeFrame);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange',this.visibilityHandler);
    this.reducedMotion.removeEventListener('change',this.motionHandler);
    if(this.pointerHandler) window.removeEventListener('pointermove',this.pointerHandler);
    this.canvas.removeEventListener('webglcontextlost',this.contextLossHandler);
    const geometries=new Set(),materials=new Set(),textures=new Set();
    this.scene.traverse(object=>{
      if(object.geometry) geometries.add(object.geometry);
      if(object.material) (Array.isArray(object.material)?object.material:[object.material]).forEach(material=>materials.add(material));
    });
    materials.forEach(material=>{
      Object.values(material).forEach(value=>{if(value?.isTexture) textures.add(value);});
      material.dispose();
    });
    textures.forEach(texture=>texture.dispose());
    geometries.forEach(geometry=>geometry.dispose());
    this.environment?.environmentTarget?.dispose();
    this.renderer.dispose();
  }
}

const canvas = document.querySelector('#construction-canvas');
if (canvas) new ConstructionScene(canvas);
