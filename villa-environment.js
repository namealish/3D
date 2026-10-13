import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const smooth = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);
const randomSource = (seed) => () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};
// Coherent, deterministic terrain detail: no repeated sine-wave ridgelines.
const terrainNoise = (x, z) => {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const hash = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),u),THREE.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),u),v);
};
const terrainDetail = (x, z) => (terrainNoise(x,z)*.54 + terrainNoise(x*2.03+17,z*2.03-9)*.27 + terrainNoise(x*4.11-5,z*4.11+13)*.13 + terrainNoise(x*8.17+31,z*8.17)*.06);

// Surroundings only: this group never owns or moves any part of the villa.
export class VillaEnvironment {
  constructor(scene, renderer, quality = { tier:'high',mobile:false,vegetation:1,terrainSegments:128,mountainSegments:320,mountainRings:24,anisotropy:8 }) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'Quiet Mediterranean estate surroundings';
    this.garden = new THREE.Group();
    this.garden.name = 'Permanent natural woodland and scrub';
    this.terrain = new THREE.Group();
    this.terrain.name = 'Permanent mountain landscape and construction terrain';
    this.quality = typeof quality === 'boolean' ? { tier:quality?'low':'high',mobile:quality,vegetation:quality?.4:1,terrainSegments:quality?64:128,mountainSegments:quality?160:320,mountainRings:quality?14:24,anisotropy:quality?2:8 } : quality;
    this.mobile = this.quality.mobile;
    this.sunDirection = new THREE.Vector3(.74, .38, -.67).normalize();
    this.sky = this.createSky();
    const ground = this.createGround();
    this.terrain.add(ground);
    this.createSiteSurface();
    this.root.add(this.sky, this.terrain);
    this.createHills();
    this.createGarden();
    this.createLandscapePlate(renderer);
    this.root.add(this.garden);
    this.freezeStatic(this.root);
    scene.add(this.root);

    // Capture the actual surrounding terrain and trees, not just a flat sky.
    // A single prefiltered capture keeps glass reflections inexpensive.
    const capture = new THREE.Scene();
    capture.add(this.root.clone(true));
    capture.fog = scene.fog.clone();
    capture.add(new THREE.HemisphereLight(0xb6cee4, 0x998469, 1.15));
    const sun = new THREE.DirectionalLight(0xffebd0, 2.4);
    sun.position.copy(this.sunDirection).multiplyScalar(60);
    capture.add(sun);
    const generator = new THREE.PMREMGenerator(renderer);
    this.environmentTarget = generator.fromScene(capture, .015, .1, 300, { position: new THREE.Vector3(0, 3.5, 5) });
    // One location and one daylight environment at every construction progress.
    scene.environment = this.environmentTarget.texture;
    scene.environmentIntensity = .55;
    generator.dispose();
  }

  freezeStatic(root) {
    root.traverse(object=>{
      if(!object.isMesh) return;
      object.updateMatrix();
      object.matrixAutoUpdate=false;
    });
  }

  disposeObject(root,disposeMaterials=true) {
    const geometries=new Set(),materials=new Set();
    root.traverse(object=>{
      if(object.geometry) geometries.add(object.geometry);
      if(object.material) (Array.isArray(object.material)?object.material:[object.material]).forEach(material=>materials.add(material));
    });
    geometries.forEach(geometry=>geometry.dispose());
    if(disposeMaterials) materials.forEach(material=>material.dispose());
  }

  createSky() {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        zenith: { value: new THREE.Color(0x548aba) },
        skyMiddle: { value: new THREE.Color(0xa6bfd2) },
        horizon: { value: new THREE.Color(0xe0d7bc) },
        sunDirection: { value: this.sunDirection }
      },
      vertexShader: `
        varying vec3 vDirection;
        void main() {
          vDirection = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 zenith;
        uniform vec3 skyMiddle;
        uniform vec3 horizon;
        uniform vec3 sunDirection;
        varying vec3 vDirection;
        void main() {
          vec3 direction = normalize(vDirection);
          float height = max(direction.y, 0.0);
          vec3 color = mix(horizon, skyMiddle, smoothstep(0.0, 0.115, height));
          color = mix(color, zenith, smoothstep(0.045, 0.30, height));
          float sun = max(dot(direction, sunDirection), 0.0);
          // Subtle daylight warmth, consistent with the photographic sky.
          color += vec3(0.12, 0.095, 0.055) * pow(sun, 18.0);
          color = mix(color, horizon, (1.0 - smoothstep(0.0, 0.035, height)) * 0.12);
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(205, 48, 24), material);
    sky.name = 'Permanent natural late-afternoon sky';
    return sky;
  }

  groundHeight(x, z) {
    // Grade the natural site up to the existing benches, hiding their box edges.
    // This stays below the villa, pool shell and Stage 04 lawn surfaces.
    const outside = Math.max(Math.abs(x) - 20, -z - 12, z - 29);
    const grading = -.425 + (terrainNoise(x*.6,z*.6)-.5)*.018;
    const villaCut = Math.max(Math.abs(x)-11.58,Math.abs(z)-6.48);
    const poolCut = Math.max(Math.abs(x+.5)-8.84,Math.abs(z-13)-3.04);
    const shoulders = 1-smooth(0,.8,Math.min(villaCut,poolCut));
    const site = THREE.MathUtils.lerp(grading,-.284,shoulders);
    // The plot sits on a gentle shoulder above the wooded valley. Falling
    // terrain keeps the real tree belt visible from the high Stage 01 camera.
    return site + smooth(0,30,outside)*(.35+terrainDetail(x*.045,z*.045)*3.2+(terrainNoise(x*.18,z*.18)-.5)*.55) - smooth(0,60,outside)*18;
  }

  mountainHeight(x,z,layer) {
    const angle = Math.atan2(z,x);
    const drift = Math.sin(angle*3+layer.seed)*7 + Math.cos(angle*7-layer.seed)*2.5;
    const across = (Math.hypot(x,z)-layer.radius-drift)/layer.depth+.5;
    if(across<=0 || across>=1) return -.8;
    const profile = Math.pow(Math.sin(across*Math.PI),.95);
    const relief = terrainDetail(x*.043+layer.seed*7,z*.043-layer.seed*4);
    const crest = layer.height*(.63+relief*.66+Math.sin(angle*5+layer.seed)*.1);
    const folds = (terrainDetail(x*.14,z*.14)-.5)*layer.height*.4;
    return -.8+profile*(crest+folds);
  }

  landscapeHeight(x,z) {
    return Math.max(this.groundHeight(x,z),...this.mountainLayers.map(layer=>this.mountainHeight(x,z,layer)));
  }

  mountainMaterial() {
    const material = new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false});
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = 'varying vec3 vTerrainPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTerrainPoint = position;');
      shader.fragmentShader = `
        varying vec3 vTerrainPoint;
        float landHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float landNoise(vec2 p) {
          vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(landHash(i),landHash(i+vec2(1.0,0.0)),f.x),mix(landHash(i+vec2(0.0,1.0)),landHash(i+1.0),f.x),f.y);
        }
      `+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        // Fine mottled vegetation and rock, subordinate to the large landforms.
        float detail=landNoise(vTerrainPoint.xz*0.65)*0.55+landNoise(vTerrainPoint.xz*2.3)*0.3+landNoise(vTerrainPoint.xz*6.7)*0.15;
        diffuseColor.rgb *= 0.86+detail*0.28;
      `);
    };
    return material;
  }

  createLandscapePlate(renderer) {
    // A photographic, world-space distant environment. The villa, pool and
    // foreground remain live geometry; this curved plate also reflects in water.
    const geometry=new THREE.CylinderGeometry(80,80,157,96,2,true,1.45,2.4);
    const uv=geometry.attributes.uv;
    for(let index=0;index<uv.count;index+=1) {
      const row=uv.getY(index);
      uv.setX(index,1-uv.getX(index));
      // Extend the photograph's clear upper sky to the zenith. Sampling the
      // same edge color avoids a gray procedural-sky seam in portrait views.
      uv.setY(index,Math.min(1,row*2));
      geometry.attributes.position.setY(index,row===1 ? 130 : row===.5 ? 33 : -27);
    }
    geometry.computeBoundingSphere();
    const material=new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,toneMapped:false,transparent:true,depthWrite:false});
    material.userData.landscapePlate=true;
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        // Low-pass the clear sky edge so magnifying its last pixel row cannot
        // turn photographic grain into vertical streaks above the panorama.
        if (vMapUv.y > 0.94) {
          vec3 clearSky = vec3(0.0);
          for (int tap = -4; tap <= 4; tap++) {
            float weight = 5.0-abs(float(tap));
            clearSky += texture2D(map,vec2(vMapUv.x+float(tap)*0.008,vMapUv.y)).rgb*weight;
          }
          diffuseColor.rgb = mix(diffuseColor.rgb,clearSky/25.0,smoothstep(0.94,1.0,vMapUv.y));
        }
        // Blend only the ground edge; the sky remains continuous above the photo.
        diffuseColor.a *= smoothstep(0.0,0.14,vMapUv.y);
      `);
    };
    this.landscapePlate=new THREE.Mesh(geometry,material);
    this.landscapePlate.name='Permanent photographic daylight mountain woodland';
    this.landscapePlate.visible=false;
    this.terrain.add(this.landscapePlate);
    const loadLandscape=()=>new THREE.TextureLoader().load('/public/arken-landscape-v2.png',texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(this.quality.anisotropy,renderer.capabilities.getMaxAnisotropy());
      material.map=texture;
      material.needsUpdate=true;
      this.landscapePlate.visible=true;
      this.ridges.visible=false;
      // The photographic midground replaces the sparse background grove only.
      for(const name of ['Fine-leaved background olive grove','Irregular branching olive silhouettes']) {
        const object=this.garden.getObjectByName(name);
        if(object) object.visible=false;
      }
      this.backgroundReady=true;
      this.captureLandscapeEnvironment(renderer);
      // Once the photograph is captured, release hidden procedural duplicates.
      this.disposeObject(this.ridges);
      for(const name of ['Fine-leaved background olive grove','Irregular branching olive silhouettes']) {
        const object=this.garden.getObjectByName(name);
        if(object) this.disposeObject(object,false);
      }
      this.applyReflections();
      const controller=window.arkenConstructionScene;
      if(controller) {
        controller.environmentTarget=this.environmentTarget;
        controller.lastChange=performance.now();
        if(controller.active && !controller.frame) controller.render();
      }
    },undefined,error=>console.warn('Landscape plate unavailable; retaining procedural surroundings.',error));
    // A new Image started during document loading delays window.load, which
    // owns the site's existing intro. Keep the optional backdrop off that path.
    if(document.readyState==='complete') loadLandscape();
    else window.addEventListener('load',loadLandscape,{once:true});
  }

  captureLandscapeEnvironment(renderer) {
    const capture=new THREE.Scene();
    const surroundings=this.root.clone(true);
    const clonedMaterials=[];
    surroundings.traverse(object=>{
      if(object.name===this.terrain.name || object.name===this.garden.name) object.visible=true;
      if(object.material) {
        const original=object.material;
        object.material=original.clone();
        object.material.onBeforeCompile=original.onBeforeCompile;
        object.material.opacity=1;
        object.material.transparent=!!original.userData.landscapePlate;
        clonedMaterials.push(object.material);
      }
    });
    capture.add(surroundings);
    capture.fog=this.scene.fog.clone();
    capture.add(new THREE.HemisphereLight(0xb6cee4,0x998469,1.15));
    const key=new THREE.DirectionalLight(0xffebd0,2.4);
    key.position.copy(this.sunDirection).multiplyScalar(60);
    capture.add(key);
    const generator=new THREE.PMREMGenerator(renderer);
    const previous=this.environmentTarget;
    this.environmentTarget=generator.fromScene(capture,.015,.1,300,{position:new THREE.Vector3(0,3.5,5)});
    generator.dispose();
    clonedMaterials.forEach(material=>material.dispose());
    previous.dispose();
  }

  createTerrainMaterial(vertexColors = true) {
    const material = new THREE.MeshStandardMaterial({ color: vertexColors ? 0xffffff : 0x9c8064, vertexColors, roughness: 1, fog: false });
    // World-scale soil grain, mottling and shallow tire impressions. These are
    // part of the terrain, not construction objects or a second animation queue.
    material.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 vGroundPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvGroundPoint = position;');
      shader.fragmentShader = `
        varying vec3 vGroundPoint;
        float soilHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float soilNoise(vec2 p) {
          vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(soilHash(i),soilHash(i+vec2(1.0,0.0)),f.x),mix(soilHash(i+vec2(0.0,1.0)),soilHash(i+1.0),f.x),f.y);
        }
      ` + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec2 site = vGroundPoint.xz;
        float grain = soilNoise(site*8.0)*0.5 + soilNoise(site*31.0)*0.3 + soilNoise(site*83.0)*0.2;
        float mottling = soilNoise(site*0.8)*0.6 + soilNoise(site*2.7)*0.4;
        diffuseColor.rgb *= 0.71 + grain*0.39 + mottling*0.24;
        float accessCenter = -16.0 - 7.5*(1.0-smoothstep(-34.0,8.0,site.y));
        float access = (1.0-smoothstep(1.7,2.5,abs(site.x-accessCenter))) * smoothstep(-48.0,-35.0,site.y) * (1.0-smoothstep(14.0,21.0,site.y));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.32,0.245,0.17)*(0.8+grain*0.45), access*0.6);
        float wheelDistance = abs(abs(site.x-accessCenter)-0.82);
        float ruts = (1.0-smoothstep(0.11,0.27,wheelDistance))*access;
        float tread = (1.0-smoothstep(0.11,0.22,abs(fract(site.y*3.8+abs(site.x-accessCenter)*1.6)-0.5)))*ruts;
        diffuseColor.rgb *= 1.0-ruts*0.17-tread*0.18;
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        // Fine soil relief at a stable physical scale, without a tiled bitmap.
        vec3 soilPoint = vGroundPoint;
        float soilBump = soilNoise(soilPoint.xz*8.0)*0.010 + soilNoise(soilPoint.xz*31.0)*0.003;
        vec3 soilDx = dFdx(vViewPosition), soilDy = dFdy(vViewPosition);
        vec3 soilR1 = cross(soilDy,normal), soilR2 = cross(normal,soilDx);
        float soilDet = dot(soilDx,soilR1);
        vec3 soilGradient = sign(soilDet)*(dFdx(soilBump)*soilR1+dFdy(soilBump)*soilR2);
        normal = normalize(abs(soilDet)*normal-soilGradient);
      `);
    };
    return material;
  }

  createSiteSurface() {
    this.siteSurface = new THREE.Group();
    this.siteSurface.name = 'Permanent cleared earth, access tracks and gravel';
    this.terrain.add(this.siteSurface);
    const soil = this.createTerrainMaterial(false);
    // Surface dressing only: the original animated excavation and foundation
    // meshes remain intact. The completed slab and pool naturally cover this.
    [[23.18,12.98,0,-.277,0],[17.68,6.08,-.5,-.282,13]].forEach(([w,d,x,y,z]) => {
      const geometry = new THREE.PlaneGeometry(w,d,1,1);
      geometry.rotateX(-Math.PI/2);
      geometry.translate(x,y,z);
      const mesh = new THREE.Mesh(geometry,soil);
      mesh.name = 'Compacted excavation subgrade';
      mesh.receiveShadow = true;
      this.siteSurface.add(mesh);
    });
    const random = randomSource(1207);
    const count = Math.round(780*this.quality.vegetation);
    const gravel = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0xa69b86,roughness:1}),count);
    gravel.name = 'Scattered access gravel and disturbed soil aggregate';
    const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion(), euler = new THREE.Euler();
    const scale = new THREE.Vector3(), position = new THREE.Vector3();
    for(let index=0;index<count;index+=1) {
      const z = -38+random()*59;
      const center = -16-7.5*(1-smooth(-34,8,z));
      const x = center+(random()-.5)*5.1;
      const size = .025+Math.pow(random(),2)*.11;
      position.set(x,this.groundHeight(x,z)+size*.18,z);
      scale.set(size*(.8+random()),size*.4,size*(.7+random()));
      rotation.setFromEuler(euler.set(random(),random()*6.28,random()));
      matrix.compose(position,rotation,scale);
      gravel.setMatrixAt(index,matrix);
      gravel.setColorAt(index,new THREE.Color(0x776552).lerp(new THREE.Color(0xb7ac94),random()));
    }
    gravel.receiveShadow = true;
    gravel.castShadow = false;
    this.siteSurface.add(gravel);
  }

  createGround() {
    const segments=this.quality.terrainSegments;
    const geometry = new THREE.PlaneGeometry(370,370,segments,segments);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const colors = [];
    const dark = new THREE.Color(0x445538);
    const light = new THREE.Color(0x7e8657);
    const dry = new THREE.Color(0x958364);
    const soilDark = new THREE.Color(0x80654e), soilLight = new THREE.Color(0xb69b78);
    for (let index = 0; index < positions.count; index += 1) {
      // Concentrate vertices around the cleared site, not the far horizon.
      const x = Math.sign(positions.getX(index))*Math.pow(Math.abs(positions.getX(index))/185,1.45)*185;
      const z = Math.sign(positions.getZ(index))*Math.pow(Math.abs(positions.getZ(index))/185,1.45)*185;
      positions.setX(index,x);
      positions.setZ(index,z);
      positions.setY(index, this.groundHeight(x, z));
      const variation = terrainDetail(x*.095,z*.095);
      const color = dark.clone().lerp(light, variation).lerp(dry,.15+smooth(.25,.75,terrainNoise(x*.067+3,z*.067))*.65);
      const border = Math.max(Math.abs(x)-19.3,Math.abs(z-7)-20) + (terrainNoise(x*.25,z*.25)-.5)*2.2;
      const clearing = 1-smooth(-1.5,3.5,border);
      const accessCenter = -16-7.5*(1-smooth(-34,8,z));
      const access = (1-smooth(1.7,3,Math.abs(x-accessCenter)))*smooth(-48,-35,z)*(1-smooth(14,21,z));
      color.lerp(soilDark.clone().lerp(soilLight,terrainDetail(x*.32,z*.32)),Math.max(clearing,access));
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    // Distant haze lives in the landscape plate. Avoid a pale fog band across
    // the physical terrain where it joins the photographic woodland.
    const ground = new THREE.Mesh(geometry, this.createTerrainMaterial());
    ground.name = 'Gently contoured estate grounds';
    ground.receiveShadow = true;
    return ground;
  }

  createHills() {
    this.ridges = new THREE.Group();
    this.ridges.name = 'Procedural distant terrain fallback';
    this.terrain.add(this.ridges);
    // Three actual ridged landforms, with shaded folds and different relief.
    // Their air perspective is baked per layer; scene fog otherwise bleaches
    // every distant ridge to the same pale band at this camera distance.
    const layers = this.mountainLayers = [
      { radius: 161, depth: 43, height: 26, color: 0x365c7c, haze: .32, seed: .5 },
      { radius: 122, depth: 42, height: 18, color: 0x315967, haze: .17, seed: 2.2 },
      { radius: 83, depth: 34, height: 8, color: 0x345845, haze: .055, seed: 4.7 }
    ];
    layers.forEach((layer, layerIndex) => {
      const positions = [], colors = [], indices = [];
      const segments=this.quality.mountainSegments,rings=this.quality.mountainRings;
      const base = new THREE.Color(layer.color);
      const haze = new THREE.Color(0x8299ac);
      const stone = new THREE.Color(layerIndex===2 ? 0x777555 : 0x718085);
      for (let ring = 0; ring <= rings; ring += 1) {
        const across = ring / rings;
        for (let segment = 0; segment <= segments; segment += 1) {
          const angle = segment / segments * Math.PI * 2;
          const drift = Math.sin(angle * 3 + layer.seed) * 7 + Math.cos(angle * 7 - layer.seed) * 2.5;
          const radius = layer.radius + (across - .5) * layer.depth + drift;
          const x = Math.cos(angle)*radius, z = Math.sin(angle)*radius;
          const relief = terrainDetail(x*.043+layer.seed*7,z*.043-layer.seed*4);
          const y = this.mountainHeight(x,z,layer);
          positions.push(x, y, z);
          const color = base.clone().lerp(stone,smooth(.47,.75,relief)*.26).multiplyScalar(.85+relief*.3);
          colors.push(color.r, color.g, color.b);
          if (ring < rings && segment < segments) {
            const a = ring * (segments + 1) + segment, b = a + segments + 1;
            indices.push(a, b, a + 1, a + 1, b, b + 1);
          }
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const normals = geometry.attributes.normal;
      const vertexColors = geometry.attributes.color;
      for (let index = 0; index < normals.count; index += 1) {
        const slope = .62 + Math.max(0,normals.getX(index)*.67+Math.abs(normals.getY(index))*.48-normals.getZ(index)*.57)*.7;
        const height = positions[index*3+1];
        const air = layer.haze + (1-smooth(1,layer.height*.72,height))*.14;
        const color = new THREE.Color().fromBufferAttribute(vertexColors,index).multiplyScalar(slope).lerp(haze,air);
        vertexColors.setXYZ(index,color.r,color.g,color.b);
      }
      const material = this.mountainMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `Layered mountain terrain ${layerIndex + 1}`;
      this.ridges.add(mesh);
    });
  }

  createLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, 64, 64);
    context.fillStyle = '#fff';
    context.beginPath();
    context.ellipse(32, 32, 11, 28, -.2, 0, Math.PI * 2);
    context.fill();
    return new THREE.CanvasTexture(canvas);
  }

  createGarden() {
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true, roughness: .96,
      alphaMap: this.createLeafTexture(), alphaTest: .35, side: THREE.DoubleSide
    });
    const bark = new THREE.MeshStandardMaterial({ color: 0x5e5747, roughness: 1 });
    const leaves = [], branches = [];
    // A loose, sparse grove behind the plot. Nothing crosses the house footprint.
    const trees = [
      [-16, -24, 6.7, 3.7], [-13, -34, 7.1, 3.9],
      [28, -.5, 6.9, 3.4], [37, -4, 7.6, 3.9], [50, -12, 7.1, 3.7],
      [30, 28, 6.3, 3.4], [-27, 29, 5.3, 2.8]
    ];
    trees.forEach(([x, z, height, radius], index) => {
      this.appendTree(leaves, branches, x, z, height, radius, 31 + index * 37);
    });
    const foliage = new THREE.Mesh(this.leafGeometry(leaves), leafMaterial);
    foliage.name = 'Fine-leaved background olive grove';
    this.garden.add(foliage);
    const branchGeometry = mergeGeometries(branches, false);
    branches.forEach((geometry) => geometry.dispose());
    const trunks = new THREE.Mesh(branchGeometry, bark);
    trunks.name = 'Irregular branching olive silhouettes';
    this.garden.add(trunks);

    // Low Mediterranean planting softens the edge of the existing lawn benches.
    const shrubLeaves = [];
    const random = randomSource(713);
    for (let index = 0; index < 85; index += 1) {
      const side = index % 3;
      const x = side === 0 ? -19.9 - random() * 2.6 : side === 1 ? 21 + random() * 3 : -22 + random() * 46;
      const z = side === 2 ? -13.5 - random() * 3.5 : -10 + random() * 36;
      const y = this.groundHeight(x, z) + .4;
      const radius = .45 + random() * .65;
      for (let leaf = 0; leaf < Math.max(55,Math.round(145*this.quality.vegetation)); leaf += 1) {
        const angle = random() * Math.PI * 2;
        const distance = Math.sqrt(random()) * radius;
        shrubLeaves.push({ x: x + Math.cos(angle) * distance, y: y + Math.sqrt(Math.max(0, 1 - distance / radius)) * .55 + random() * .16, z: z + Math.sin(angle) * distance, size: .085 + random() * .06, angle: random() * Math.PI * 2, tilt: random() * 1.7 - .85, shade: .55 + random() * .25 });
      }
    }
    const shrubs = new THREE.Mesh(this.leafGeometry(shrubLeaves), leafMaterial);
    shrubs.name = 'Layered perimeter mastic and silver-leaf planting';
    this.garden.add(shrubs);
    this.createMeadow();
  }


  appendTree(leaves, branches, x, z, height, radius, seed) {
    const random = randomSource(seed);
    const floor = this.landscapeHeight(x, z);
    const lean = (random() - .5) * .65;
    const base = new THREE.Vector3(x, floor, z);
    const fork = new THREE.Vector3(x + lean, floor + height * .48, z + .18);
    branches.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      base, new THREE.Vector3(x - .13, floor + height * .23, z + .07), fork
    ]), 10, .085, 6, false));
    const clusters = [];
    for (let branch = 0; branch < 9; branch += 1) {
      const angle = branch * 2.399 + random() * .5;
      const reach = radius * (.35 + random() * .46);
      const center = new THREE.Vector3(x + Math.cos(angle) * reach, floor + height * (.63 + random() * .32), z + Math.sin(angle) * reach);
      clusters.push(center);
      const midpoint = fork.clone().lerp(center, .52);
      midpoint.y -= .16;
      midpoint.x += (random() - .5) * .48;
      midpoint.z += (random() - .5) * .48;
      branches.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([fork, midpoint, center]), 6, .026 + random() * .012, 5, false));
      for (let twig = 0; twig < 3; twig += 1) {
        const tip = center.clone().add(new THREE.Vector3((random() - .5) * 1.5, random() * .6, (random() - .5) * 1.5));
        branches.push(new THREE.TubeGeometry(new THREE.LineCurve3(midpoint, tip), 1, .011, 4, false));
      }
    }
    const count = Math.max(2200,Math.round(6200*this.quality.vegetation));
    for (let index = 0; index < count; index += 1) {
      const center = clusters[index % clusters.length];
      const angle = random() * Math.PI * 2;
      const heightAngle = Math.acos(2 * random() - 1);
      const distance = Math.cbrt(random());
      const spread = radius * (.38 + (index % 3) * .04);
      leaves.push({
        x: center.x + Math.cos(angle) * Math.sin(heightAngle) * distance * spread,
        y: center.y + Math.cos(heightAngle) * distance * spread * .58,
        z: center.z + Math.sin(angle) * Math.sin(heightAngle) * distance * spread,
        size: (this.quality.tier==='low' ? .13 : .09) + random() * .08, angle: random() * Math.PI * 2,
        tilt: random() * 2.4 - 1.2, shade: .5 + random() * .42
      });
    }
  }

  leafGeometry(leaves, lowColor = 0x384e42, highColor = 0x8d997a) {
    const positions = [], normals = [], uvs = [], colors = [], indices = [];
    const low = new THREE.Color(lowColor), high = new THREE.Color(highColor);
    const up = new THREE.Vector3(), across = new THREE.Vector3(), normal = new THREE.Vector3();
    leaves.forEach((leaf, index) => {
      up.set(Math.sin(leaf.angle) * Math.sin(leaf.tilt), Math.cos(leaf.tilt), Math.cos(leaf.angle) * Math.sin(leaf.tilt));
      across.set(Math.cos(leaf.angle), 0, -Math.sin(leaf.angle));
      normal.crossVectors(across, up).normalize();
      const color = low.clone().lerp(high, leaf.shade);
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([u,v]) => {
        positions.push(leaf.x + across.x * leaf.size * u * .55 + up.x * leaf.size * v, leaf.y + up.y * leaf.size * v, leaf.z + across.z * leaf.size * u * .55 + up.z * leaf.size * v);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push((u + 1) / 2, (v + 1) / 2);
        colors.push(color.r, color.g, color.b);
      });
      const offset = index * 4;
      indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    return geometry;
  }

  createMeadow() {
    const random = randomSource(419);
    const positions = [], colors = [];
    const green = new THREE.Color(0x616f53), straw = new THREE.Color(0x999078);
    const count = Math.max(2600,Math.round(8500*this.quality.vegetation));
    for (let index = 0; index < count; index += 1) {
      const x = -52 + random() * 112, z = -39 + random() * 82;
      if (Math.abs(x) < 20.5 && z > -13 && z < 30) continue;
      const y = this.groundHeight(x, z), height = .14 + random() * .34;
      const angle = random() * Math.PI * 2, width = .025;
      const dx = Math.cos(angle) * width, dz = Math.sin(angle) * width;
      positions.push(x - dx, y, z - dz, x + dx, y, z + dz, x + Math.sin(angle) * .09, y + height, z + Math.cos(angle) * .09);
      const color = green.clone().lerp(straw, random() * .65);
      for (let vertex = 0; vertex < 3; vertex += 1) colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const meadow = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 }));
    meadow.name = 'Restrained grasses beyond the manicured garden';
    this.garden.add(meadow);
  }

  connectReflections(house) {
    // Reflection response only. No geometry, transparency animation, or stage edits.
    this.glazing = [];
    house.windowsGroup.traverse((object) => {
      if (object.material?.transmission > 0) this.glazing.push(object.material);
    });
    const water = house.poolWater?.material;
    this.water = water;
    this.applyReflections();
  }

  applyReflections() {
    if(!this.environmentTarget) return;
    const map=this.environmentTarget.texture;
    this.scene.environment=map;
    this.scene.environmentIntensity=.55;
    this.glazing?.forEach(material=>{
      if(material.envMap!==map) { material.envMap=map; material.needsUpdate=true; }
      material.envMapIntensity=1.3;
    });
    if(this.water) {
      if(this.water.envMap!==map) { this.water.envMap=map; this.water.needsUpdate=true; }
      this.water.envMapIntensity=1.75;
      if(this.water.uniforms.environmentBlend) this.water.uniforms.environmentBlend.value=1;
      this.water.uniforms.distortionScale.value=.62;
    }
  }

  setProgress(progress) {
    // Compatibility with the existing controller; progress never controls the
    // distant setting. Only HouseModel owns the Stage 04 ornamental garden.
    this.progress = progress;
  }
}
