import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Water } from 'three/addons/objects/Water.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const range = (progress, start, end) => smooth((progress - start) / Math.max(.0001, end - start));
const randomSource = (seed) => () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};

// The model uses the original four animation queues and master progress contract.
// All dimensions below belong to one permanent villa / terrace / pool footprint.
export class HouseModel {
  constructor(scene, quality = { tier:'high',mobile:false,vegetation:1,waterTexture:512 }) {
    this.scene = scene;
    this.quality = typeof quality === 'boolean' ? { tier:quality?'low':'high',mobile:quality,vegetation:quality?.32:1,waterTexture:quality?256:512 } : quality;
    this.mobile = this.quality.mobile;
    this.animations = { foundation: [], structure: [], finishing: [], landscape: [] };
    this.animatedLights = [];
    this.geometryCache = new Map();
    this.animatedMaterialCache = new Map();
    this.instanceBatches = [];
    this.finalBatches = [];
    this.zeroMatrix = new THREE.Matrix4().makeScale(0,0,0);
    this.root = new THREE.Group();
    this.root.name = 'ARKEN — one coastal villa through four construction stages';
    scene.add(this.root);
    this.materials = this.createMaterials();
    this.baseMaterialsByUUID=new Map(Object.values(this.materials).map(material=>[material.uuid,material]));
    this.createGroups();
    this.buildConstructionSite();
    this.buildFoundation();
    this.buildColumns();
    this.buildBeams();
    this.buildFloorSlabs();
    this.buildFraming();
    this.buildRoof();
    this.buildWalls();
    this.buildFacade();
    this.buildWindows();
    this.buildInterior();
    this.buildTerrace();
    this.buildLandscape();
    this.finalizeInstancing();
    // Retime the existing queues, not the scroll controller. Preserve every
    // overlapping assembly/fade while giving structure and finish more room.
    const authored = [0, .175, .44, .72, 1];
    const staged = [0, .2, .5, .8, 1];
    const retime = (value) => {
      if (value == null || value <= 0) return value;
      const match = authored.findIndex((time) => time >= value);
      const index = match < 0 ? 3 : Math.max(0, match - 1);
      return THREE.MathUtils.lerp(staged[index], staged[index + 1], (value - authored[index]) / (authored[index + 1] - authored[index]));
    };
    Object.values(this.animations).flat().forEach((item) => {
      ['start', 'end', 'fadeOutStart', 'fadeOutEnd'].forEach((key) => { item[key] = retime(item[key]); });
    });
    this.animatedLights.filter((item) => item.start >= .78).forEach((item) => {
      item.start = retime(item.start);
      item.end = retime(item.end);
    });
    this.setConstructionProgress(0);
  }

  surfaceTexture(hex, variation, seed, stone = false) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    const image = context.createImageData(size, size);
    const random = randomSource(seed);
    const base = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = (y * size + x) * 4;
        const grain = x * .34 + Math.sin(y * .025) * .8 + Math.sin(x * .065) * 2;
        const vein = stone === 'wood' ? Math.sin(grain) * 6 + Math.sin(grain * 3.1) * 2.5
          : stone ? Math.sin(y * .065 + Math.sin(x * .037) * 1.6) * 2.6 + Math.sin(y * .029) * 1.8 : 0;
        const pore = stone === true && random() > .998 ? -14 : 0;
        const broadVariation = Math.sin(x * .047 + Math.sin(y * .031)) * variation * .12 + Math.cos(y * .081 - x * .024) * variation * .08;
        const noise = (random() - .5) * variation + broadVariation + vein + pore;
        for (let channel = 0; channel < 3; channel += 1) image.data[index + channel] = clamp(base[channel] + noise, 0, 255);
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(stone === 'wood' ? 2 : stone ? 3 : 5, stone === 'wood' ? 1 : stone ? 2 : 5);
    texture.anisotropy = 4;
    return texture;
  }

  createMaterials() {
    const plaster = this.surfaceTexture(0xeae7df, 5, 11);
    const travertine = this.surfaceTexture(0xc9b9a3, 8, 23, true);
    const concrete = this.surfaceTexture(0xa5a29b, 10, 7);
    const oak = this.surfaceTexture(0x82684e, 7, 31, 'wood');
    const floorOak = oak.clone();
    floorOak.repeat.set(12, 3);
    floorOak.needsUpdate = true;
    const soil = this.surfaceTexture(0x514638, 30, 17);
    const lawn = this.surfaceTexture(0x506048, 13, 43);
    const roughness = this.surfaceTexture(0xe3e3e3, 22, 47);
    roughness.colorSpace = THREE.NoColorSpace;
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 64;
    const shadowContext = shadowCanvas.getContext('2d');
    const gradient = shadowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(0,0,0,.36)');
    gradient.addColorStop(.5, 'rgba(0,0,0,.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    shadowContext.fillStyle = gradient;
    shadowContext.fillRect(0, 0, 64, 64);
    const leafCanvas = document.createElement('canvas');
    leafCanvas.width = leafCanvas.height = 64;
    const leafContext = leafCanvas.getContext('2d');
    leafContext.fillStyle = '#000';
    leafContext.fillRect(0, 0, 64, 64);
    leafContext.fillStyle = '#fff';
    leafContext.beginPath();
    leafContext.ellipse(32, 32, 10, 27, -.16, 0, Math.PI * 2);
    leafContext.fill();
    return {
      earth: new THREE.MeshStandardMaterial({ color: 0xffffff, map: soil, roughness: 1 }),
      excavated: new THREE.MeshStandardMaterial({ color: 0x625344, roughness: 1 }),
      trench: new THREE.MeshStandardMaterial({ color: 0x30291f, roughness: 1 }),
      foundation: new THREE.MeshStandardMaterial({ color: 0xffffff, map: concrete, roughness: .84, bumpMap: roughness, bumpScale: .017 }),
      structuralConcrete: new THREE.MeshStandardMaterial({ color: 0xffffff, map: concrete, roughness: .86, roughnessMap: roughness, bumpMap: roughness, bumpScale: .009 }),
      finishedConcrete: new THREE.MeshStandardMaterial({ color: 0xffffff, map: plaster, roughness: .85, roughnessMap: roughness, bumpMap: roughness, bumpScale: .006 }),
      stone: new THREE.MeshStandardMaterial({ color: 0xffffff, map: travertine, roughness: .7, roughnessMap: roughness, bumpMap: roughness, bumpScale: .008 }),
      polishedStone: new THREE.MeshPhysicalMaterial({ color: 0xe1d8c8, map: travertine, roughness: .3, roughnessMap: roughness, clearcoat: .22, clearcoatRoughness: .3, bumpMap: roughness, bumpScale: .003 }),
      stoneJoint: new THREE.MeshStandardMaterial({ color: 0xa69580, roughness: .85 }),
      warmPlaster: new THREE.MeshStandardMaterial({ color: 0xb2a692, map: plaster, roughness: .87, roughnessMap: roughness, bumpMap: roughness, bumpScale: .004 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x424b50, metalness: .7, roughness: .35 }),
      aluminium: new THREE.MeshStandardMaterial({ color: 0x22272b, metalness: .78, roughness: .26, envMapIntensity: .85 }),
      rebar: new THREE.MeshStandardMaterial({ color: 0x603e2c, metalness: .62, roughness: .6 }),
      oak: new THREE.MeshStandardMaterial({ color: 0xffffff, map: oak, roughness: .54, roughnessMap: roughness, bumpMap: oak, bumpScale: .004 }),
      oakDark: new THREE.MeshStandardMaterial({ color: 0x685039, roughness: .64 }),
      floorOak: new THREE.MeshStandardMaterial({ color: 0xb8ad96, map: floorOak, roughness: .48, roughnessMap: roughness, bumpMap: floorOak, bumpScale: .003 }),
      textile: new THREE.MeshStandardMaterial({ color: 0xc5b9a3, roughness: .95, bumpMap: roughness, bumpScale: .008 }),
      cushion: new THREE.MeshStandardMaterial({ color: 0xa69a84, roughness: .98, bumpMap: roughness, bumpScale: .01 }),
      curtain: new THREE.MeshStandardMaterial({ color: 0xd4ccba, roughness: .96, side: THREE.DoubleSide }),
      gravel: new THREE.MeshStandardMaterial({ color: 0x898276, roughness: 1, bumpMap: roughness, bumpScale: .035 }),
      turf: new THREE.MeshStandardMaterial({ color: 0xffffff, map: lawn, roughness: .98 }),
      foliage: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .94, vertexColors: true, side: THREE.DoubleSide, alphaMap: new THREE.CanvasTexture(leafCanvas), alphaTest: .48 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x728065, roughness: .95, side: THREE.DoubleSide }),
      flowers: new THREE.MeshStandardMaterial({ color: 0xa6a18e, roughness: .95 }),
      poolTile: new THREE.MeshStandardMaterial({ color: 0x1f3b42, roughness: .45, metalness: .08 }),
      water: new THREE.MeshPhysicalMaterial({ color: 0x273e45, roughness: .1, metalness: .15, clearcoat: .9 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0xe0e8e9, roughness: .08, transmission: .72, thickness: .14, ior: 1.45, transparent: true, opacity: 1, depthWrite: false, side: THREE.FrontSide, attenuationColor: 0xbed5d4, attenuationDistance: 14 }),
      railingGlass: new THREE.MeshStandardMaterial({ color: 0xdce7e8, roughness: .12, metalness: .04, transparent: true, opacity: .3, depthWrite: false, side: THREE.FrontSide }),
      warmLight: new THREE.MeshStandardMaterial({ color: 0xffdab0, emissive: 0xffbf7a, emissiveIntensity: 2, roughness: .5 }),
      poolLight: new THREE.MeshStandardMaterial({ color: 0xa6c6cc, emissive: 0x719aa6, emissiveIntensity: 1.1 }),
      contactShadow: new THREE.MeshBasicMaterial({ color: 0x000000, map: new THREE.CanvasTexture(shadowCanvas), transparent: true, opacity: .75, depthWrite: false, side: THREE.DoubleSide })
    };
  }

  createGroups() {
    const names = ['foundationGroup','columnsGroup','beamsGroup','framingGroup','floorSlabsGroup','roofGroup','wallsGroup','facadeGroup','windowsGroup','interiorGroup','terraceGroup','landscapeGroup'];
    this.siteGroup = new THREE.Group();
    this.siteGroup.name = 'constructionSiteGroup';
    this.root.add(this.siteGroup);
    names.forEach((name) => {
      this[name] = new THREE.Group();
      this[name].name = name;
      this.root.add(this[name]);
    });
  }

  geometry(key, factory) {
    if (!this.geometryCache.has(key)) this.geometryCache.set(key,factory());
    return this.geometryCache.get(key);
  }

  animatedMaterial(material, animation) {
    // Objects with the same material and fade envelope can safely share one
    // material without changing any construction timing or opacity curve.
    const maxOpacity = animation.maxOpacity ?? material.opacity ?? 1;
    const key = [material.uuid,animation.start??0,animation.end??.12,animation.fadeOutStart??'',animation.fadeOutEnd??'',animation.endOpacity??0,maxOpacity].join('|');
    if (!this.animatedMaterialCache.has(key)) {
      const clone = material.clone();
      clone.transparent = true;
      clone.opacity = 0;
      clone.userData.baseMaterial = material.uuid;
      this.animatedMaterialCache.set(key,clone);
    }
    return this.animatedMaterialCache.get(key);
  }

  addMesh(group, geometry, material, position, animation = {}, name = 'architectural-component') {
    const mesh = new THREE.Mesh(geometry, this.animatedMaterial(material,animation));
    const phase = animation.phase || 'foundation';
    mesh.name = name;
    mesh.position.set(...position);
    if (animation.rotation) mesh.rotation.set(...animation.rotation);
    if (animation.quaternion) mesh.quaternion.copy(animation.quaternion);
    const importantCaster = /earth-bench|foundation|slab|retaining|structural-column|structural-beam|roof|exterior-wall|blade|accent|balcony|canopy|terrace|deck|step|sofa|island|bed|table|olive-trunk|leaf-canopy/.test(name);
    mesh.castShadow = !this.mobile && animation.castShadow !== false && importantCaster;
    const minorReceiver = /rebar|stud|scaffold|mullion|joint|grass|branch|lamp|contact-shadow|light-strip|glass|cable|fixture/.test(name);
    mesh.receiveShadow = animation.receiveShadow !== false && !minorReceiver;
    group.add(mesh);
    this.animations[phase].push({
      object: mesh,
      group,
      finalPosition: new THREE.Vector3(...position),
      finalScale: new THREE.Vector3(...(animation.scale || [1,1,1])),
      fromScale: new THREE.Vector3(...(animation.fromScale || [1,.02,1])),
      fromOffset: new THREE.Vector3(...(animation.fromOffset || [0,-1.2,0])),
      start: animation.start ?? 0,
      end: animation.end ?? .12,
      fadeOutStart: animation.fadeOutStart,
      fadeOutEnd: animation.fadeOutEnd,
      endOpacity: animation.endOpacity ?? 0,
      maxOpacity: animation.maxOpacity ?? material.opacity ?? 1
    });
    return mesh;
  }

  box(group, size, position, material, animation, name) {
    const options = animation || {};
    const scale = options.scale || [1,1,1];
    const fromScale = options.fromScale || [1,.02,1];
    return this.addMesh(group,this.geometry('unit-box',()=>new THREE.BoxGeometry(1,1,1)),material,position,{
      ...options,
      scale:[size[0]*scale[0],size[1]*scale[1],size[2]*scale[2]],
      fromScale:[size[0]*fromScale[0],size[1]*fromScale[1],size[2]*fromScale[2]]
    },name);
  }

  roundedBox(group, size, position, material, animation, name, radius = .018, segments = 2) {
    const edge = Math.min(radius,Math.min(...size)*.4);
    const key = `rounded:${size.join(',')}:${segments}:${edge}`;
    return this.addMesh(group,this.geometry(key,()=>new RoundedBoxGeometry(...size,segments,edge)),material,position,animation,name);
  }

  cylinder(group, radius, height, position, material, animation, radialSegments = 12, name = 'cylinder') {
    const options = animation || {};
    const scale = options.scale || [1,1,1];
    const fromScale = options.fromScale || [1,.02,1];
    const geometry = this.geometry(`unit-cylinder:${radialSegments}`,()=>new THREE.CylinderGeometry(1,1,1,radialSegments));
    return this.addMesh(group,geometry,material,position,{
      ...options,
      scale:[radius*scale[0],height*scale[1],radius*scale[2]],
      fromScale:[radius*fromScale[0],height*fromScale[1],radius*fromScale[2]]
    },name);
  }

  strut(group, from, to, radius, material, animation, name) {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    const options = animation || {};
    const scale = options.scale || [1,1,1];
    const fromScale = options.fromScale || [1,.02,1];
    const geometry = this.geometry('unit-tapered-strut:7',()=>new THREE.CylinderGeometry(.85,1,1,7));
    return this.addMesh(group,geometry,material,start.add(end).multiplyScalar(.5).toArray(),{
      ...options,quaternion,
      scale:[radius*scale[0],length*scale[1],radius*scale[2]],
      fromScale:[radius*fromScale[0],length*fromScale[1],radius*fromScale[2]]
    },name);
  }

  contactShadow(group, size, position, phase = 'finishing', start = .5) {
    return this.addMesh(group,this.geometry('contact-shadow-plane',()=>new THREE.PlaneGeometry(2,2)),this.materials.contactShadow,position,{ phase,start,end:start+.08,fromScale:[.02,.02,.02],scale:[size[0],size[1],1],fromOffset:[0,0,0],rotation:[-Math.PI/2,0,0],castShadow:false,receiveShadow:false },'contact-shadow');
  }

  finalizeInstancing() {
    const candidates = new Map();
    Object.values(this.animations).flat().forEach(item=>{
      const object=item.object;
      if(!object.isMesh || object.material.transmission>0 || /water/.test(object.name)) return;
      const key=[item.group.uuid,object.geometry.uuid,object.material.uuid,object.castShadow,object.receiveShadow,object.renderOrder].join('|');
      if(!candidates.has(key)) candidates.set(key,[]);
      candidates.get(key).push(item);
    });
    candidates.forEach(items=>{
      if(items.length<2) return;
      const first=items[0].object;
      const batch=new THREE.InstancedMesh(first.geometry,first.material,items.length);
      batch.name=`instanced-${first.name}`;
      batch.castShadow=first.castShadow;
      batch.receiveShadow=first.receiveShadow;
      batch.renderOrder=first.renderOrder;
      batch.userData.visibleInstances=0;
      items.forEach((item,index)=>{
        const object=item.object;
        object.position.copy(item.finalPosition);
        object.scale.copy(item.finalScale);
        object.updateMatrix();
        batch.setMatrixAt(index,object.matrix);
        item.batch=batch;
        item.instanceIndex=index;
        object.removeFromParent();
      });
      batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      batch.computeBoundingSphere();
      items[0].group.add(batch);
      batch.userData.sourceItems=items;
      this.instanceBatches.push(batch);
    });
    const finalCandidates=new Map();
    Object.values(this.animations).flat().forEach(item=>{
      const object=item.object;
      if(object.material.transmission>0||/water/.test(object.name)) return;
      if(item.fadeOutStart!=null&&(item.endOpacity??0)===0) return;
      const base=this.baseMaterialsByUUID.get(object.material.userData.baseMaterial);
      if(!base) return;
      const key=[item.group.uuid,object.geometry.uuid,base.uuid,object.castShadow,object.receiveShadow,object.renderOrder].join('|');
      if(!finalCandidates.has(key)) finalCandidates.set(key,{items:[],base});
      finalCandidates.get(key).items.push(item);
    });
    finalCandidates.forEach(({items,base})=>{
      if(items.length<2) return;
      const first=items[0].object;
      const batch=new THREE.InstancedMesh(first.geometry,base,items.length);
      batch.name=`completed-${first.name}`;
      batch.castShadow=first.castShadow;
      batch.receiveShadow=first.receiveShadow;
      batch.renderOrder=first.renderOrder;
      batch.visible=false;
      items.forEach((item,index)=>{
        const object=item.object;
        object.position.copy(item.finalPosition);
        object.scale.copy(item.finalScale);
        object.updateMatrix();
        batch.setMatrixAt(index,object.matrix);
        item.finalBatch=batch;
      });
      batch.instanceMatrix.needsUpdate=true;
      batch.computeBoundingSphere();
      batch.updateMatrix();
      batch.matrixAutoUpdate=false;
      items[0].group.add(batch);
      this.finalBatches.push(batch);
    });
    this.instanceBatches.forEach(batch=>{
      batch.userData.finalReplaced=batch.userData.sourceItems.every(item=>item.finalBatch);
    });
  }

  stage(phase, start, end, extra = {}) { return { phase, start, end, ...extra }; }

  buildConstructionSite() {
    const permanent = { start: -1, end: -.98, fromScale: [1,1,1], fromOffset: [0,0,0] };
    this.box(this.siteGroup, [36,.5,19], [0,-.7,-2], this.materials.earth, permanent, 'upper-earth-bench');
    this.box(this.siteGroup, [36,.42,15], [0,-1.18,14], this.materials.earth, permanent, 'lower-earth-bench');
    this.box(this.siteGroup, [23.2,.15,13], [0,-.36,0], this.materials.trench, { ...permanent, fadeOutStart: .56, fadeOutEnd: .7 }, 'excavated-villa-pad');
    this.box(this.siteGroup, [17.7,.18,6.1], [-.5,-.38,13.0], this.materials.trench, { ...permanent, fadeOutStart: .55, fadeOutEnd: .68 }, 'pool-excavation');
    [[-12,-5,9,.7,1.5],[12,-5,7,.6,1.3],[-11,7,7,.4,1]].forEach(([x,z,w,h,d],index) => {
      this.roundedBox(this.siteGroup, [w,h,d], [x,-.05,z], this.materials.excavated, { ...permanent, rotation: [0,index*.04,0], fadeOutStart: .61, fadeOutEnd: .74 }, 'construction-earth-berm', .08);
    });
    for (let i = 0; i < 5; i += 1) this.box(this.siteGroup, [.7,.35,1.4], [-12 + i*.8,.1,6.9], this.materials.foundation, { ...permanent, fadeOutStart: .54, fadeOutEnd: .66 }, 'temporary-material-stack');
  }

  buildFoundation() {
    const m = this.materials;
    const footings = [
      [[22.6,.4,.65],[0,-.05,-5.75]], [[22.6,.4,.65],[0,-.05,5.75]],
      [[.65,.4,12],[-10.8,-.05,0]], [[.65,.4,12],[10.8,-.05,0]],
      [[.5,.35,11.5],[-4.7,-.03,0]], [[.5,.35,11.5],[3.6,-.03,0]]
    ];
    footings.forEach(([size,position],i) => this.box(this.foundationGroup, size, position, m.foundation, { start: -.07+i*.009, end: .035+i*.009, fromOffset: [0,-.35,0] }, 'structural-strip-footing'));
    this.roundedBox(this.foundationGroup, [22,.25,12], [0,.58,0], m.foundation, { start: -.01, end: .09, fromScale: [.08,.05,.08], fromOffset: [0,-.45,0] }, 'villa-foundation-slab');
    const retaining = [
      [[22,.85,.25],[0,.17,-5.88]], [[.25,.85,12],[-10.88,.17,0]], [[.25,.85,12],[10.88,.17,0]],
      [[24,.62,.3],[.5,-.02,8.25]], [[24,.62,.3],[.5,-.55,16.35]]
    ];
    retaining.forEach(([size,position],i) => this.box(this.foundationGroup, size, position, m.foundation, { start: .015+i*.007, end: .11+i*.007 }, 'stepped-site-retaining-wall'));
    this.box(this.foundationGroup, [17.2,.22,5.6], [-.5,-.12,13], m.foundation, { start: .015, end: .09, fromScale: [.1,.1,.1], fromOffset: [0,-.5,0] }, 'pool-structural-base');
    [
      [[17.35,.67,.2],[-.5,.23,10.1]], [[17.35,.67,.2],[-.5,.23,15.9]],
      [[.2,.67,5.8],[-9.07,.23,13]], [[.2,.67,5.8],[8.07,.23,13]]
    ].forEach(([size,position],i) => this.box(this.foundationGroup, size, position, m.foundation, { start: .04+i*.008, end: .12+i*.008, fromOffset: [0,-.6,0] }, 'pool-shell-wall'));
    for (let i = 0; i < 12; i += 1) {
      for (const z of [-5.7,5.7]) this.cylinder(this.foundationGroup, .025, 1.45, [-10+i*1.8,1,z], m.rebar, { start: .035+i*.003, end: .13+i*.003, fadeOutStart: .4, fadeOutEnd: .57 }, 6, 'foundation-rebar');
    }
    for (let i = 0; i < 8; i += 1) this.cylinder(this.foundationGroup, .022, .8, [-8+i*2.1,.6,15.85], m.rebar, { start: .05, end: .14, fadeOutStart: .44, fadeOutEnd: .6 }, 6, 'pool-rebar');
    [
      [[22.4,.65,.07],[0,.56,6.12]], [[22.4,.65,.07],[0,.56,-6.12]],
      [[.07,.65,12.2],[-11.12,.56,0]], [[.07,.65,12.2],[11.12,.56,0]],
      [[17.6,.6,.07],[-.5,.32,16.04]]
    ].forEach(([size,position],i) => this.box(this.foundationGroup, size, position, m.oakDark, { start: .03+i*.008, end: .135+i*.008, fadeOutStart: .39, fadeOutEnd: .55 }, 'temporary-timber-formwork'));
  }

  buildColumns() {
    const columns = [];
    [-10.6,-4.7,1.4,7.1,10.6].forEach((x) => [-5.6,5.6].forEach((z) => columns.push([x,2.62,z,3.52])));
    [-4.3,1.3,6.9,11.7].forEach((x) => [-4.9,4.9].forEach((z) => columns.push([x,6.12,z,3.15])));
    columns.push([-10.6,6.05,5.6,3.18],[-10.6,6.05,-5.6,3.18]);
    columns.forEach(([x,y,z,h],i) => {
      const start = i < 10 ? .175+i*.0022 : .275+(i-10)*.0025;
      this.roundedBox(this.columnsGroup, [.19,h,.19], [x,y,z], this.materials.steel, this.stage('structure', start, start+.075, { fromScale: [1,.01,1], fromOffset: [0,-h*.5,0] }), 'slender-structural-column', .009);
      this.contactShadow(this.columnsGroup,[.3,.3],[x,y-h*.5+.007,z],'structure',start);
    });
  }

  buildBeams() {
    const beams = [];
    beams.push([[22,.25,.18],[0,4.36,-5.6]],[[15.4,.25,.18],[3.2,4.36,5.6]]);
    [-10.6,-4.7,1.4,7.1,10.6].forEach((x) => beams.push([[.18,.25,11.3],[x,4.36,0]]));
    [-5,5].forEach((z) => beams.push([[24,.25,.18],[1,7.82,z]]));
    [-10.6,-4.3,1.3,6.9,11.7].forEach((x) => beams.push([[.18,.25,11.3],[x,7.82,0]]));
    [0,5.7,11].forEach((x) => beams.push([[.18,.19,2.25],[x,4.45,6.6]]));
    beams.forEach(([size,position],i) => {
      const start = position[1]>7 ? .375+(i-7)*.002 : .235+i*.003;
      this.roundedBox(this.beamsGroup, size, position, this.materials.steel, this.stage('structure', start, start+(position[1]>7?.045:.065), { fromScale: size[0]>size[2]?[.015,1,1]:[1,1,.015], fromOffset: [0,0,0], fadeOutStart:position[1]>7?.53:undefined, fadeOutEnd:position[1]>7?.63:undefined }), 'horizontal-structural-beam', .012);
    });
  }

  buildFloorSlabs() {
    this.roundedBox(this.floorSlabsGroup, [17.2,.2,10.8], [3.95,4.52,-.1], this.materials.structuralConcrete, this.stage('structure', .28,.365, { fromScale: [.05,.05,.05], fromOffset: [0,-1.2,0] }), 'offset-cantilevered-upper-slab');
    this.roundedBox(this.floorSlabsGroup, [17.4,.16,2.2], [3.95,4.56,6.38], this.materials.structuralConcrete, this.stage('structure', .305,.39, { fromScale: [.05,.05,.05], fromOffset: [0,-1,0] }), 'continuous-balcony-structure');
    this.roundedBox(this.floorSlabsGroup, [6.55,.14,1.7], [-7.9,4.48,-4.75], this.materials.structuralConcrete, this.stage('structure', .32,.4), 'rear-mezzanine-not-over-living-void');
  }

  buildFraming() {
    let i = 0;
    for (const y of [2.63,6.15]) {
      for (let x = -10.2; x <= 11; x += 1.0) {
        if (y>3 && x<-4.5) continue;
        this.box(this.framingGroup, [.06,3.1,.08], [x,y,-5.6], this.materials.oakDark, this.stage('structure', .345+i*.0008,.408+i*.0008, { fadeOutStart: .49, fadeOutEnd: .63 }), 'secondary-timber-stud');
        i += 1;
      }
    }
    [-11.5,12.4].forEach((x) => {
      [-5,0,5.2].forEach((z) => this.cylinder(this.framingGroup, .034,7.8,[x,3.65,z],this.materials.steel,this.stage('structure',.28,.39,{fadeOutStart:.48,fadeOutEnd:.65}),8,'temporary-scaffold-pole'));
      [1.5,3.5,5.5,7.5].forEach((y) => this.box(this.framingGroup,[.06,.06,10.5],[x,y,0],this.materials.steel,this.stage('structure',.31,.4,{fromScale:[1,1,.02],fromOffset:[0,0,0],fadeOutStart:.48,fadeOutEnd:.65}),'temporary-scaffold-rail'));
      const temporary=this.stage('structure',.32,.395,{fromScale:[.08,.08,.08],fromOffset:[0,-.2,0],fadeOutStart:.49,fadeOutEnd:.61});
      this.strut(this.framingGroup,[x,1.5,-5],[x,5.5,0],.025,this.materials.steel,temporary,'temporary-scaffold-diagonal-brace');
      this.strut(this.framingGroup,[x,1.5,0],[x,5.5,-5],.025,this.materials.steel,temporary,'temporary-scaffold-cross-brace');
      [3.5,5.5].forEach(y=>this.roundedBox(this.framingGroup,[.8,.065,5.1],[x,y,-2.5],this.materials.oakDark,temporary,'temporary-scaffold-working-deck',.008));
    });
    const support=this.stage('structure',.26,.33,{fadeOutStart:.46,fadeOutEnd:.56});
    for(const x of [-2.8,3.7,9.5]) for(const z of [-3,2.5]) {
      this.cylinder(this.framingGroup,.047,3.57,[x,2.54,z],this.materials.steel,support,8,'temporary-slab-shoring-column');
      this.box(this.framingGroup,[.34,.035,.34],[x,.78,z],this.materials.steel,support,'temporary-prop-footplate');
      if(z===-3) this.box(this.framingGroup,[.18,.13,8.1],[x,4.32,-.2],this.materials.oakDark,support,'temporary-slab-formwork-bearer');
    }
    [-10.58,10.58].forEach(x=>this.strut(this.framingGroup,[x,.88,-5.5],[x,4.22,-.5],.032,this.materials.steel,this.stage('structure',.27,.35,{fadeOutStart:.48,fadeOutEnd:.59}),'temporary-frame-raking-brace'));
    for(let z=-4.4;z<4.7;z+=1.8) this.box(this.framingGroup,[16.8,.12,.075],[3.95,4.35,z],this.materials.steel,this.stage('structure',.34+(z+4.4)*.002,.408+(z+4.4)*.002,{fromScale:[.02,1,1],fromOffset:[0,0,0],fadeOutStart:.49,fadeOutEnd:.58}),'secondary-floor-framing');
  }

  buildRoof() {
    for (let x=-10.5;x<12.2;x+=1.65) this.box(this.roofGroup,[.1,.18,12.2],[x,7.88,0],this.materials.steel,this.stage('structure',.385+(x+10.5)*.001,.416+(x+10.5)*.001,{fromScale:[1,1,.02],fromOffset:[0,0,0],fadeOutStart:.54,fadeOutEnd:.63}),'roof-structural-joist');
    this.roundedBox(this.roofGroup,[25.3,.19,13.3],[.7,8.03,.2],this.materials.finishedConcrete,this.stage('finishing',.49,.59,{fromScale:[.05,.05,.05],fromOffset:[0,-.6,0]}),'razor-thin-flat-roof');
    this.box(this.roofGroup,[25.15,.035,.04],[.7,7.94,6.85],this.materials.aluminium,this.stage('finishing',.54,.62,{fromScale:[.02,1,1],fromOffset:[0,0,0]}),'recessed-roof-shadow-line');
    this.box(this.roofGroup,[23.6,.035,11.8],[.5,7.79,.4],this.materials.oak,this.stage('finishing',.53,.62,{fromScale:[.06,1,.06],fromOffset:[0,-.2,0]}),'restrained-oak-roof-soffit');
    this.box(this.roofGroup,[16.6,.025,.025],[3.8,7.765,5.75],this.materials.warmLight,this.stage('finishing',.61,.71,{fromScale:[.01,1,1],fromOffset:[0,0,0],castShadow:false}),'recessed-soffit-light-strip');
    this.box(this.roofGroup,[5.5,.025,.025],[-8,7.765,5.75],this.materials.warmLight,this.stage('finishing',.61,.71,{fromScale:[.01,1,1],fromOffset:[0,0,0],castShadow:false}),'living-soffit-light-strip');
  }

  buildWalls() {
    const walls = [
      [[21.8,3.34,.2],[0,2.76,-5.78]], [[.2,3.34,11.4],[10.85,2.76,0]],
      [[.2,6.6,7],[-10.85,4.4,-2.3]], [[17.05,3.15,.2],[3.95,6.2,-5.42]],
      [[.2,3.15,9.9],[-4.55,6.2,-.4]], [[.2,3.15,10.5],[12.42,6.2,-.1]],
      [[.16,3.1,4.8],[5.4,6.15,-2.7]], [[.16,3.1,4.8],[.4,6.15,-2.7]]
    ];
    walls.forEach(([size,position],i) => this.roundedBox(this.wallsGroup,size,position,this.materials.finishedConcrete,this.stage('finishing',.44+i*.005,.54+i*.005),'warm-white-exterior-wall',.016));
    this.roundedBox(this.wallsGroup,[1.5,6.55,.28],[-10.2,4.4,5.82],this.materials.stone,this.stage('finishing',.47,.565),'living-stone-blade');
    this.roundedBox(this.wallsGroup,[1.5,3.25,.23],[11.63,6.2,5.27],this.materials.finishedConcrete,this.stage('finishing',.48,.57),'upper-ivory-end-blade');
    this.roundedBox(this.wallsGroup,[1.45,3.23,.26],[9.97,2.76,5.82],this.materials.stone,this.stage('finishing',.48,.57),'ground-stone-end-wall');
  }

  stoneJoints(group, x, y, z, width, height, start=.54) {
    const a=this.stage('finishing',start,start+.08,{fromScale:[.1,1,1],fromOffset:[0,0,0],castShadow:false});
    for(let level=-height*.5+.65;level<height*.5;level+=.65) this.box(group,[width,.012,.012],[x,y+level,z],this.materials.stoneJoint,a,'travertine-horizontal-joint');
    for(let column=-width*.5+1.2;column<width*.5;column+=1.2) this.box(group,[.01,height,.012],[x+column,y,z],this.materials.stoneJoint,a,'travertine-vertical-joint');
  }

  buildFacade() {
    const m=this.materials;
    this.roundedBox(this.facadeGroup,[1.0,6.8,2.35],[11.42,4.48,4.93],m.stone,this.stage('finishing',.49,.59),'right-travertine-vertical-accent');
    this.stoneJoints(this.facadeGroup,11.42,4.48,6.116,1,6.8);
    this.stoneJoints(this.facadeGroup,-10.2,4.4,5.971,1.5,6.55);
    this.roundedBox(this.facadeGroup,[17.4,.13,2.2],[3.95,4.64,6.38],m.finishedConcrete,this.stage('finishing',.505,.59,{fromScale:[.02,1,.02],fromOffset:[0,-.1,0]}),'finished-thin-balcony-edge');
    this.box(this.facadeGroup,[16.8,.025,.035],[3.9,4.53,7.46],m.aluminium,this.stage('finishing',.55,.625,{fromScale:[.02,1,1],fromOffset:[0,0,0]}),'balcony-drip-shadow-gap');
    this.roundedBox(this.facadeGroup,[17.2,.24,.24],[3.95,4.79,5.43],m.finishedConcrete,this.stage('finishing',.52,.61),'upper-volume-white-sill-band');
    this.roundedBox(this.facadeGroup,[17.2,.28,.26],[3.95,7.66,5.43],m.finishedConcrete,this.stage('finishing',.53,.62),'upper-volume-white-lintel');
    [1.2,6.25].forEach(x=>this.roundedBox(this.facadeGroup,[.25,2.85,.22],[x,6.2,5.43],m.finishedConcrete,this.stage('finishing',.54,.625),'recessed-white-bedroom-divider'));
    this.box(this.facadeGroup,[16.3,.025,.025],[3.75,4.48,6.25],m.warmLight,this.stage('finishing',.63,.73,{fromScale:[.01,1,1],fromOffset:[0,0,0],castShadow:false}),'cantilever-recessed-light-strip');
    for(let i=0;i<12;i+=1) this.box(this.facadeGroup,[.043,3,.13],[8.95+i*.1,6.2,5.42],m.oak,this.stage('finishing',.54+i*.002,.625+i*.002),'small-bedroom-oak-screen');
    // Recessed side entrance remains secondary in the pool-facing hero view.
    this.roundedBox(this.facadeGroup,[.18,3.35,3.3],[-11.05,2.8,-2.8],m.stone,this.stage('finishing',.49,.59),'recessed-entrance-stone-wall');
    this.roundedBox(this.facadeGroup,[.12,2.9,1.45],[-11.16,2.62,-2.25],m.oak,this.stage('finishing',.53,.62),'side-pivot-entry-door');
    this.box(this.facadeGroup,[1.75,.09,3.7],[-11.45,4.18,-2.25],m.finishedConcrete,this.stage('finishing',.54,.63),'floating-entrance-canopy');
    this.box(this.facadeGroup,[.025,2.7,.035],[-11.235,2.6,-1.51],m.warmLight,this.stage('finishing',.63,.73,{castShadow:false}),'entry-indirect-light-strip');
  }

  glazing(size,position,start,name) {
    this.box(this.windowsGroup,size,position,this.materials.glass,this.stage('finishing',start,start+.085,{fromScale:[.85,.85,.85],fromOffset:[0,-.18,0],castShadow:false}),name);
  }

  buildWindows() {
    const m=this.materials;
    // Four panels span the uninterrupted double-height left living room.
    for(let i=0;i<4;i+=1) this.glazing([1.32,6.52,.035],[-8.74+i*1.36,4.38,5.88],.535+i*.004,'double-height-living-glass');
    for(let i=0;i<8;i+=1) this.glazing([1.68,3.16,.035],[-3.57+i*1.73,2.78,5.89],.54+i*.004,'pool-facing-sliding-glass');
    for(let i=0;i<8;i+=1) this.glazing([1.7,2.98,.035],[-3.48+i*1.75,6.2,5.32],.555+i*.004,'upper-full-height-glass');
    for(let i=0;i<5;i+=1) {
      this.box(this.windowsGroup,[.038,6.58,.09],[-9.42+i*1.36,4.38,5.9],m.aluminium,this.stage('finishing',.55+i*.004,.63+i*.004),'slim-double-height-mullion');
    }
    for(let i=0;i<9;i+=1) {
      this.box(this.windowsGroup,[.033,3.24,.085],[-4.44+i*1.73,2.78,5.92],m.aluminium,this.stage('finishing',.56+i*.003,.64+i*.003),'slim-ground-sliding-mullion');
      this.box(this.windowsGroup,[.033,3.07,.085],[-4.35+i*1.75,6.2,5.36],m.aluminium,this.stage('finishing',.57+i*.003,.65+i*.003),'slim-upper-window-mullion');
    }
    [[13.85,1.18,5.94],[13.85,4.38,5.94],[16.8,7.75,5.36]].forEach(([width,y,z],i) => this.box(this.windowsGroup,[width,.038,.085],[i===2?3.9:2.45,y,z],m.aluminium,this.stage('finishing',.59,.665,{fromScale:[.02,1,1],fromOffset:[0,0,0]}),'recessed-glazing-track'));
    this.glazing([.035,6.45,3.55],[-10.74,4.38,3.85],.565,'double-height-corner-glass');
    // Nearly frameless balcony railing, a slim base shoe and no opaque parapet.
    for(let i=0;i<10;i+=1) this.box(this.windowsGroup,[1.64,1.04,.025],[-3.52+i*1.67,5.23,7.47],m.railingGlass,this.stage('finishing',.59+i*.003,.675+i*.003,{fromScale:[1,.1,1],fromOffset:[0,-.5,0],castShadow:false}),'frameless-balcony-glass');
    this.box(this.windowsGroup,[16.9,.045,.048],[3.94,4.73,7.48],m.aluminium,this.stage('finishing',.61,.69,{fromScale:[.02,1,1],fromOffset:[0,0,0]}),'minimal-balcony-base-shoe');
    this.box(this.windowsGroup,[16.9,.013,.019],[3.94,5.752,7.48],m.railingGlass,this.stage('finishing',.615,.69,{fromScale:[.02,1,1],fromOffset:[0,0,0],castShadow:false}),'frameless-railing-top-edge');
    this.box(this.windowsGroup,[.025,1.04,2.0],[12.46,5.23,6.46],m.railingGlass,this.stage('finishing',.61,.69,{castShadow:false}),'balcony-side-glass');
  }

  sofa(group,x,y,z,width,phase='finishing',start=.57) {
    const a=this.stage(phase,start,start+.09,{fromScale:[.08,.08,.08],fromOffset:[0,-.4,0]});
    this.roundedBox(group,[width,.27,1.07],[x,y+.32,z],this.materials.textile,a,'linen-sofa-base',.06,3);
    this.roundedBox(group,[width,.58,.24],[x,y+.69,z-.48],this.materials.textile,a,'linen-sofa-back',.07,3);
    [-1,1].forEach((side) => this.roundedBox(group,[.2,.46,1.07],[x+side*(width*.5-.1),y+.52,z],this.materials.textile,a,'linen-sofa-arm',.05,3));
    const count=Math.max(2,Math.round(width/.8));
    for(let i=0;i<count;i+=1) this.roundedBox(group,[width/count-.06,.12,.79],[x-width*.5+(i+.5)*width/count,y+.52,z+.03],this.materials.cushion,a,'individual-sofa-cushion',.05,3);
    [-1,1].forEach((side) => this.box(group,[.06,.18,.06],[x+side*(width*.5-.18),y+.09,z+.3],this.materials.aluminium,a,'sofa-slender-leg'));
    this.contactShadow(group,[width*.65,.8],[x,y+.006,z],phase,start);
  }

  table(group,x,y,z,width,depth,phase,start=.59) {
    const a=this.stage(phase,start,start+.09,{fromScale:[.07,.07,.07],fromOffset:[0,-.35,0]});
    this.roundedBox(group,[width,.09,depth],[x,y,z],this.materials.oak,a,'oak-table-top',.025);
    [-1,1].forEach((side)=>this.box(group,[.065,y-.07,.065],[x+side*(width*.5-.22),y*.5,z],this.materials.aluminium,a,'slender-table-leg'));
  }

  chair(group,x,floor,z,phase,start=.6,reverse=false) {
    const a=this.stage(phase,start,start+.09,{fromScale:[.07,.07,.07],fromOffset:[0,-.4,0]});
    this.roundedBox(group,[.52,.1,.52],[x,floor+.47,z],this.materials.textile,a,'upholstered-chair-seat',.035,3);
    this.roundedBox(group,[.52,.43,.075],[x,floor+.7,z+(reverse?-.24:.24)],this.materials.textile,a,'upholstered-chair-back',.035,3);
    for(const dx of [-.2,.2]) for(const dz of [-.19,.19]) this.box(group,[.028,.44,.028],[x+dx,floor+.22,z+dz],this.materials.aluminium,a,'slender-chair-leg');
  }

  addAreaLight(group,position,width,height,intensity,start,target) {
    const light=new THREE.RectAreaLight(0xffc78e,0,width,height);
    light.position.set(...position);
    light.lookAt(...target);
    group.add(light);
    this.animatedLights.push({light,start,end:start+.12,intensity});
  }

  buildInterior() {
    const m=this.materials;
    const a=this.stage('finishing',.515,.6,{fromScale:[.05,1,.05],fromOffset:[0,-.18,0]});
    this.box(this.interiorGroup,[21.55,.07,11.5],[0,1.06,0],m.floorOak,a,'ground-oak-floor');
    this.box(this.interiorGroup,[16.65,.07,10.2],[3.95,4.68,-.15],m.floorOak,a,'upper-oak-floor');
    this.roundedBox(this.interiorGroup,[5.25,6.4,.15],[-7.68,4.37,-.6],m.warmPlaster,this.stage('finishing',.51,.605),'double-height-interior-feature-wall');
    this.roundedBox(this.interiorGroup,[1.15,6.25,.08],[-9.68,4.37,-.495],m.oak,this.stage('finishing',.56,.65),'living-room-oak-wall-panel');
    for(let i=0;i<7;i+=1) this.box(this.interiorGroup,[.012,6.2,.015],[-10.16+i*.16,4.37,-.447],m.oakDark,this.stage('finishing',.57,.66),'fine-oak-panel-reveal');
    this.roundedBox(this.interiorGroup,[13.8,3.17,.16],[2.75,2.8,.45],m.warmPlaster,this.stage('finishing',.52,.615),'warm-open-plan-interior-wall');
    this.roundedBox(this.interiorGroup,[16.55,3.05,.12],[3.95,6.2,.05],m.warmPlaster,this.stage('finishing',.53,.625),'upper-bedroom-interior-wall');
    this.sofa(this.interiorGroup,-7.1,1.1,3.4,4.5);
    this.roundedBox(this.interiorGroup,[3.2,.36,.12],[-7.25,2.17,-.49],m.aluminium,this.stage('finishing',.58,.67),'recessed-living-fireplace');
    this.roundedBox(this.interiorGroup,[3.9,.14,.52],[-7.25,1.64,-.33],m.stone,this.stage('finishing',.585,.675),'floating-fireplace-hearth');
    this.roundedBox(this.interiorGroup,[4.5,.015,2.7],[-7.1,1.112,3.7],m.cushion,this.stage('finishing',.58,.67,{fromScale:[.05,1,.05],fromOffset:[0,0,0],castShadow:false}),'living-woven-rug');
    this.roundedBox(this.interiorGroup,[1.7,.19,1.15],[-7.25,1.47,4.98],m.polishedStone,this.stage('finishing',.59,.68,{fromScale:[.05,.05,.05]}),'living-travertine-coffee-table',.045,3);
    this.sofa(this.interiorGroup,-1.8,1.1,3.3,3.15,'finishing',.585);
    this.table(this.interiorGroup,2.3,1.93,3.55,3.6,1.1,'finishing',.59);
    for(let i=0;i<3;i+=1) for(const z of [2.72,4.4]) this.chair(this.interiorGroup,1.15+i*1.15,1.1,z,'finishing',.6+i*.004,z<3);
    this.roundedBox(this.interiorGroup,[3.1,.94,1.2],[7.4,1.61,2.7],m.oak,this.stage('finishing',.58,.675),'kitchen-island-base');
    this.roundedBox(this.interiorGroup,[3.3,.12,1.3],[7.4,2.14,2.7],m.polishedStone,this.stage('finishing',.585,.68),'kitchen-stone-counter');
    this.roundedBox(this.interiorGroup,[4.5,1.6,.1],[6.6,2.44,.57],m.oak,this.stage('finishing',.58,.675),'recessed-kitchen-oak-cabinet-wall');
    for(let i=0;i<6;i+=1) this.box(this.interiorGroup,[.012,1.5,.02],[4.42+i*.76,2.44,.635],m.oakDark,this.stage('finishing',.59,.68),'kitchen-cabinet-shadow-joint');
    this.roundedBox(this.interiorGroup,[2.65,1.55,.05],[-1.2,3.17,.57],m.stone,this.stage('finishing',.58,.67),'quiet-limestone-interior-art-panel');
    for(let step=0;step<13;step+=1) this.roundedBox(this.interiorGroup,[1.45,.08,.38],[4.4,1.28+step*.26,step*.34-3.5],m.oak,this.stage('finishing',.54+step*.003,.62+step*.003,{fromScale:[.05,.1,1]}),'floating-interior-stair');
    [-9.2,-4.62].forEach((x) => {
      for(let i=0;i<7;i+=1) this.cylinder(this.interiorGroup,.033,6.35,[x+i*.055,4.38,5.64],m.curtain,this.stage('finishing',.59,.68),8,'tall-linen-curtain-fold');
    });
    [-8,-7,-6.3].forEach((x,i)=>{
      this.cylinder(this.interiorGroup,.009,2.3,[x,6.68,3.5],m.aluminium,this.stage('finishing',.6,.685),6,'pendant-cable');
      this.addMesh(this.interiorGroup,this.geometry('pendant-sphere',()=>new THREE.SphereGeometry(.12,16,10)),m.warmLight,[x,5.52-i*.28,3.5],this.stage('finishing',.63,.72,{castShadow:false,fromScale:[.02,.02,.02]}),'small-living-pendant');
    });
    // Emissive fixtures provide the visible lamps; two broad area lights replace
    // nine overlapping real-time sources while preserving the warm interior wash.
    this.addAreaLight(this.interiorGroup,[-3.2,4.35,4.9],14,5.4,4,.6,[-3.2,2.1,0]);
    this.addAreaLight(this.interiorGroup,[4.2,6.75,4.6],15,2.8,3,.62,[4.2,4.75,0]);
    this.sofa(this.interiorGroup,2.5,4.72,3,3.2,'finishing',.59);
    this.roundedBox(this.interiorGroup,[2.2,.33,2.4],[7,5.01,2.9],m.textile,this.stage('finishing',.6,.69,{fromScale:[.07,.07,.07]}),'upper-bedroom-bed',.08,3);
  }

  sunbed(x,z,index) {
    const a=this.stage('landscape',.8+index*.007,.88+index*.007,{fromScale:[.06,.06,.06],fromOffset:[0,-.3,0]});
    this.roundedBox(this.terraceGroup,[.92,.1,2.05],[x,.96,z],this.materials.oak,a,'pool-lounger-frame');
    this.roundedBox(this.terraceGroup,[.86,.13,1.25],[x,1.08,z+.25],this.materials.textile,a,'sunbed-linen-cushion',.045,3);
    this.roundedBox(this.terraceGroup,[.86,.13,.8],[x,1.24,z-.71],this.materials.textile,{...a,rotation:[-.3,0,0]},'sunbed-raised-back',.045,3);
    [-1,1].forEach(side=>this.box(this.terraceGroup,[.05,.24,.05],[x+side*.36,.81,z+.58],this.materials.aluminium,a,'sunbed-leg'));
    this.contactShadow(this.terraceGroup,[.65,1.2],[x,.71,z],'landscape',a.start);
  }

  buildTerrace() {
    const m=this.materials;
    this.roundedBox(this.terraceGroup,[24.1,.19,2.4],[.5,1.02,7.26],m.stone,this.stage('finishing',.51,.61,{fromScale:[.08,.05,.08],fromOffset:[0,-.5,0]}),'upper-travertine-terrace');
    this.roundedBox(this.terraceGroup,[24.1,.17,1.4],[.5,.76,9.12],m.stone,this.stage('finishing',.54,.635,{fromScale:[.08,.05,.08],fromOffset:[0,-.4,0]}),'middle-pool-terrace');
    this.roundedBox(this.terraceGroup,[3.4,.15,6.15],[-10.72,.59,13],m.stone,this.stage('finishing',.55,.65,{fromScale:[.07,.1,.07]}),'west-pool-sunbed-deck');
    this.roundedBox(this.terraceGroup,[4.1,.15,6.15],[10.05,.59,13],m.stone,this.stage('finishing',.55,.65,{fromScale:[.07,.1,.07]}),'east-pool-lounge-deck');
    this.roundedBox(this.terraceGroup,[23.6,.15,1.65],[.3,-.15,17.15],m.stone,this.stage('finishing',.57,.665,{fromScale:[.08,.1,.08]}),'lower-garden-terrace');
    this.roundedBox(this.terraceGroup,[24,.66,.24],[.5,.21,9.66],m.stone,this.stage('finishing',.54,.64),'travertine-retaining-band');
    this.stoneJoints(this.terraceGroup,.5,.21,9.79,24,.66,.59);
    for(let i=0;i<3;i+=1) this.roundedBox(this.terraceGroup,[3.3,.15,.44],[-6.1,.86-i*.16,8.4+i*.44],m.stone,this.stage('finishing',.56+i*.006,.65+i*.006),'floating-pool-terrace-step');
    for(let i=0;i<4;i+=1) this.roundedBox(this.terraceGroup,[2.8,.13,.43],[11.4,.51-i*.18,16+i*.38],m.stone,this.stage('finishing',.57+i*.005,.66+i*.005),'lower-garden-step');
    // Large-format honed slabs, not tightly spaced decking stripes.
    for(let i=0;i<3;i+=1) this.box(this.terraceGroup,[23.4,.005,.006],[.4,1.121,6.35+i*.85],m.stoneJoint,this.stage('finishing',.6,.68,{castShadow:false,fromOffset:[0,0,0],fromScale:[.02,1,1]}),'terrace-stone-joint');
    for(let x=-10.8;x<12;x+=1.65) this.box(this.terraceGroup,[.006,.005,2.35],[x,1.122,7.26],m.stoneJoint,this.stage('finishing',.6,.68,{castShadow:false,fromOffset:[0,0,0]}),'terrace-slab-cross-joint');
    this.sofa(this.terraceGroup,3.6,1.13,7,3.8,'landscape',.79);
    this.roundedBox(this.terraceGroup,[1.8,.15,.82],[3.6,1.46,8.0],m.stone,this.stage('landscape',.8,.89,{fromScale:[.08,.08,.08]}),'covered-lounge-coffee-table',.04);
    this.table(this.terraceGroup,-2.4,1.98,7.2,2.8,.85,'landscape',.81);
    [-3.3,-2.4,-1.5].forEach((x)=>this.chair(this.terraceGroup,x,1.13,7.98,'landscape',.82));
    this.sunbed(-10.4,12.7,0);
    this.sunbed(-11.6,12.7,1);
    this.sunbed(10.3,12.7,2);
    this.sunbed(11.5,12.7,3);
    this.addAreaLight(this.terraceGroup,[3.7,4.49,7.1],9,1.1,2.6,.65,[3.7,1.1,7.1]);
    for(const x of [-8,-3,3,8]) this.box(this.terraceGroup,[.54,.028,.02],[x,.55,9.79],m.warmLight,this.stage('finishing',.67,.75,{castShadow:false}),'recessed-terrace-step-light');
  }

  waterNormals() {
    const size=256;
    const data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y+=1) for(let x=0;x<size;x+=1) {
      const i=(y*size+x)*4;
      // Periodic Fourier modes tile cleanly with long, low-amplitude ripples.
      const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
      data[i]=128+Math.sin(u*4+v*2)*14+Math.cos(u*7-v*3)*5;
      data[i+1]=128+Math.cos(v*5+u)*11+Math.sin(v*3-u*2)*5;
      data[i+2]=254;
      data[i+3]=255;
    }
    const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.magFilter=texture.minFilter=THREE.LinearFilter;
    texture.needsUpdate=true;
    return texture;
  }

  buildPool() {
    const m=this.materials;
    const a=this.stage('finishing',.54,.635,{fromOffset:[0,-.12,0],fromScale:[.05,1,.05]});
    this.box(this.landscapeGroup,[16.9,.07,5.45],[-.5,-.005,13],m.poolTile,a,'dark-pool-tile-floor');
    [
      [[16.85,.55,.045],[-.5,.285,10.24]], [[16.85,.55,.045],[-.5,.285,15.76]],
      [[.045,.55,5.45],[-8.9,.285,13]], [[.045,.55,5.45],[7.9,.285,13]]
    ].forEach(([size,position])=>this.box(this.landscapeGroup,size,position,m.poolTile,a,'dark-inner-pool-lining'));
    [
      [[17.3,.12,.32],[-.5,.66,10.12]], [[17.3,.12,.32],[-.5,.66,15.88]],
      [[.32,.12,5.45],[-9.02,.66,13]], [[.32,.12,5.45],[8.02,.66,13]]
    ].forEach(([size,position])=>this.roundedBox(this.landscapeGroup,size,position,m.stone,a,'thin-travertine-pool-coping'));
    for(let i=0;i<4;i+=1) this.box(this.landscapeGroup,[1.3,.14,.55],[-7.9,.5-i*.145,10.6+i*.48],m.poolTile,a,'integrated-pool-entry-step');
    this.box(this.landscapeGroup,[17.05,.045,.08],[-.5,.6,16.09],m.aluminium,a,'infinity-edge-overflow-channel');
    this.box(this.landscapeGroup,[17.1,.24,.55],[-.5,-.32,16.3],m.poolTile,a,'lower-overflow-basin');
    this.roundedBox(this.landscapeGroup,[17.28,.64,.035],[-.5,.235,16.02],m.stone,a,'honed-stone-infinity-edge-facing',.009);
    this.stoneJoints(this.landscapeGroup,-.5,.235,16.04,17.28,.64,.6);
    this.box(this.landscapeGroup,[16.9,.014,.36],[-.5,-.18,16.3],m.water,this.stage('landscape',.79,.88,{fromScale:[.05,1,.05],fromOffset:[0,0,0],castShadow:false}),'subtle-overflow-basin-water');
    const waterNormals=this.waterNormals();
    const textureSize=this.quality.waterTexture||512;
    this.poolWater=new Water(this.geometry('pool-water-plane',()=>new THREE.PlaneGeometry(16.85,5.42)),{
      textureWidth:textureSize,
      textureHeight:textureSize,
      waterNormals,
      sunDirection:new THREE.Vector3(-.55,.78,.29).normalize(),
      sunColor:0xffead0,
      waterColor:0x426c78,
      distortionScale:.62,
      alpha:1,
      fog:Boolean(this.scene.fog)
    });
    this.poolWater.material.uniforms.environmentBlend={value:1};
    const reflect=this.poolWater.onBeforeRender;
    const reflectionInterval=1000/(this.quality.reflectionFPS||24);
    this.poolWater.userData.lastReflection=-Infinity;
    this.poolWater.onBeforeRender=(...args)=>{
      const now=performance.now();
      if(now-this.poolWater.userData.lastReflection<reflectionInterval) return;
      this.poolWater.userData.lastReflection=now;
      reflect(...args);
    };
    this.poolWater.name='reflective-main-infinity-pool';
    this.poolWater.rotation.x=-Math.PI/2;
    this.poolWater.position.set(-.5,.565,13);
    this.landscapeGroup.add(this.poolWater);
    this.contactShadow(this.landscapeGroup,[8.9,.3],[-.5,.5,10.11],'finishing',.56);
    [-6.6,-2.7,1.3,5.6].forEach((x)=>{
      this.box(this.landscapeGroup,[.18,.06,.025],[x,.31,10.235],m.poolLight,this.stage('landscape',.79,.88,{castShadow:false}),'recessed-underwater-light');
    });
  }

  leafGeometry(seed,scale) {
    const random=randomSource(seed);
    const positions=[],normals=[],uvs=[],colors=[],indices=[];
    const count=Math.max(1400,Math.round(5400*this.quality.vegetation));
    const lobes=[[-.95,3.5,-.18,.83,.62,.68],[.75,3.85,.32,.96,.76,.8],[.05,4.57,-.28,.83,.55,.66],[-.35,4.02,.8,.87,.7,.6],[-.4,3.95,-.83,.65,.65,.58],[1.16,3.54,-.28,.62,.49,.57],[.2,3.43,.65,.6,.46,.73]];
    const crownTurn=random()*Math.PI*2;
    const baseColor=new THREE.Color();
    for(let i=0;i<count;i+=1) {
      const l=lobes[i%lobes.length];
      const azimuth=random()*Math.PI*2;
      const cosine=random()*2-1;
      const r=Math.cbrt(random());
      const sine=Math.sqrt(1-cosine*cosine);
      const center=new THREE.Vector3((l[0]+Math.cos(azimuth)*sine*r*l[3])*scale,(l[1]+cosine*r*l[4])*scale,(l[2]+Math.sin(azimuth)*sine*r*l[5])*scale);
      center.applyAxisAngle(new THREE.Vector3(0,1,0),crownTurn);
      const length=((this.mobile?.095:.075)+random()*.065)*scale;
      const rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(random()*2,random()*Math.PI*2,random()*2));
      const normal=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
      baseColor.setHSL(.22+random()*.035,.16+random()*.16,.22+random()*.12);
      const offset=positions.length/3;
      [[-length*.48,-length],[length*.48,-length],[length*.48,length],[-length*.48,length]].forEach(([x,y],corner)=>{
        const vertex=new THREE.Vector3(x,y,0).applyQuaternion(rotation).add(center);
        positions.push(vertex.x,vertex.y,vertex.z);
        normals.push(normal.x,normal.y,normal.z);
        uvs.push(corner===0||corner===3?0:1,corner<2?0:1);
        colors.push(baseColor.r,baseColor.g,baseColor.b);
      });
      indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.setIndex(indices);
    return geometry;
  }

  addTree(x,z,scale,index,groundY=-.22) {
    const start=.785+index*.014;
    const a=this.stage('landscape',start,start+.1,{fromScale:[1,.015,1],fromOffset:[0,-1.2,0]});
    const trunkCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.08,1.35,0),new THREE.Vector3(-.15,2.4,.1),new THREE.Vector3(.1,3.85,-.1)].map(p=>p.multiplyScalar(scale)));
    const wood=[new THREE.TubeGeometry(trunkCurve,10,.065*scale,7,false)];
    for(let branch=0;branch<6;branch+=1) {
      const angle=branch*2.399;
      const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.1+branch*.13,0),new THREE.Vector3(Math.cos(angle)*.55,2.9+branch*.11,Math.sin(angle)*.48),new THREE.Vector3(Math.cos(angle)*1.1,3.5+branch*.12,Math.sin(angle)*.85)].map(p=>p.multiplyScalar(scale)));
      wood.push(new THREE.TubeGeometry(curve,6,.023*scale,5,false));
    }
    const woodGeometry=mergeGeometries(wood,false);
    wood.forEach(geometry=>geometry.dispose());
    this.addMesh(this.landscapeGroup,woodGeometry,this.materials.oakDark,[x,groundY,z],a,'irregular-olive-trunk-and-branches');
    this.addMesh(this.landscapeGroup,this.leafGeometry(61+index*17,scale),this.materials.foliage,[x,groundY,z],this.stage('landscape',start+.018,start+.12,{fromScale:[.1,.05,.1],fromOffset:[0,-.65,0]}),'natural-olive-leaf-canopy');
    this.contactShadow(this.landscapeGroup,[1.5*scale,1.1*scale],[x,groundY+.01,z],'landscape',start);
  }

  grassGeometry(seed, width, height) {
    const random=randomSource(seed);
    const positions=[];
    const count=Math.max(48,Math.round(120*this.quality.vegetation));
    for(let i=0;i<count;i+=1) {
      const theta=random()*Math.PI*2;
      const radius=random()*width;
      const x=Math.cos(theta)*radius,z=Math.sin(theta)*radius;
      const h=height*(.35+random()*.65),lean=height*.22;
      positions.push(x-.018,0,z,x+.018,0,z,x+Math.cos(theta)*lean,h,z+Math.sin(theta)*lean);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.computeVertexNormals();
    return geometry;
  }

  buildLandscape() {
    const m=this.materials;
    const a=this.stage('landscape',.72,.8,{fromScale:[.05,1,.05],fromOffset:[0,-.08,0],castShadow:false});
    // Separate lawn benches leave the pool open rather than placing grass under water.
    this.box(this.landscapeGroup,[36,.1,9.5],[0,-.38,21.1],m.turf,a,'lower-manicured-lawn');
    this.box(this.landscapeGroup,[7.9,.1,19],[-15.15,-.29,9],m.turf,a,'west-garden-lawn');
    this.box(this.landscapeGroup,[7.2,.1,19],[16.4,-.29,9],m.turf,a,'east-garden-lawn');
    this.box(this.landscapeGroup,[35,.1,4],[0,-.29,-7.85],m.turf,a,'rear-lawn');
    this.box(this.landscapeGroup,[3.2,.1,12],[-12.8,-.25,-.5],m.gravel,a,'side-gravel-entry-walk');
    this.buildPool();
    for(let i=0;i<7;i+=1) this.roundedBox(this.landscapeGroup,[1.8,.075,1.1],[12.7,-.21,17.8+i*1.35],m.stone,this.stage('landscape',.75+i*.008,.835+i*.008,{fromScale:[.05,1,.05],fromOffset:[0,-.15,0]}),'large-lawn-stepping-stone');
    this.addTree(-13.9,6,1.1,0);
    this.addTree(15.25,5.8,1.22,1);
    this.addTree(14.75,18,.82,2,-.33);
    this.addTree(-13.1,-6,.94,3);
    const beds=[[-12.5,9.1],[-12.5,15.8],[13.1,8.8],[13.1,15.8],[-9.3,18.5],[8.1,18.9],[-14.8,-2.5]];
    beds.forEach(([x,z],i)=>{
      this.roundedBox(this.landscapeGroup,[1.65,.08,1.4],[x,-.24,z],m.earth,this.stage('landscape',.76+i*.005,.84+i*.005,{fromScale:[.02,1,.02],castShadow:false}),'mulched-ornamental-planting-bed',.035);
      this.addMesh(this.landscapeGroup,this.grassGeometry(83+i,.42,.65),m.grass,[x,-.22,z],this.stage('landscape',.8+i*.007,.89+i*.007,{fromScale:[.1,.02,.1],fromOffset:[0,-.1,0],castShadow:false}),'coastal-ornamental-grass');
      this.addMesh(this.landscapeGroup,this.leafGeometry(105+i,.13),m.foliage,[x+.4,-.63,z+.3],this.stage('landscape',.81+i*.006,.895+i*.006,{fromScale:[.05,.05,.05],scale:[2,.7,1.5],castShadow:false}),'low-natural-shrub');
    });
    [[-13.6,10.4],[13.7,15.5],[-9.2,19.2]].forEach(([x,z],i)=>this.addMesh(this.landscapeGroup,this.geometry('landscape-stone',()=>new THREE.DodecahedronGeometry(.4,1)),m.stone,[x,-.08,z],this.stage('landscape',.81+i*.012,.9+i*.012,{scale:[1.5,.46,1.1],rotation:[0,i*.7,.1],fromScale:[.02,.02,.02]}),'weathered-landscape-stone'));
    [[-12.8,8.5],[13,9.3],[12.8,18.9],[-9.5,18.4]].forEach(([x,z],i)=>{
      this.box(this.landscapeGroup,[.06,.32,.06],[x,-.03,z],m.aluminium,this.stage('landscape',.83+i*.008,.915+i*.008),'minimal-shielded-garden-fixture');
      this.box(this.landscapeGroup,[.045,.018,.025],[x,.115,z+.026],m.warmLight,this.stage('landscape',.84+i*.008,.925+i*.008,{castShadow:false}),'shielded-garden-light');
    });
  }

  animateItems(items,progress) {
    items.forEach((item) => {
      const enter = range(progress,item.start,item.end);
      const exit = item.fadeOutStart == null ? 0 : range(progress,item.fadeOutStart,item.fadeOutEnd);
      const opacity = item.maxOpacity * enter * (1 - exit * (1 - item.endOpacity));
      item.object.position.copy(item.finalPosition).addScaledVector(item.fromOffset,1-enter);
      item.object.scale.set(
        THREE.MathUtils.lerp(item.fromScale.x,item.finalScale.x,enter),
        THREE.MathUtils.lerp(item.fromScale.y,item.finalScale.y,enter),
        THREE.MathUtils.lerp(item.fromScale.z,item.finalScale.z,enter)
      );
      item.object.material.opacity = opacity;
      item.logicalVisible=opacity>.002;
      item.object.visible=item.logicalVisible;
      const material = item.object.material;
      if (!material.transmission) {
        // Fully built surfaces must enter Three.js's opaque pass so physical
        // glazing can refract the furnished interior, with correct occlusion.
        const transparent = opacity < .999 || item.maxOpacity < 1;
        if(material.transparent !== transparent) { material.transparent = transparent; material.needsUpdate = true; }
        material.depthWrite = opacity > .96;
      }
      if(item.batch) {
        item.object.updateMatrix();
        item.batch.setMatrixAt(item.instanceIndex,item.logicalVisible?item.object.matrix:this.zeroMatrix);
        item.batch.userData.visibleInstances+=item.logicalVisible?1:0;
        item.batch.instanceMatrix.needsUpdate=true;
      }
    });
  }

  animateFoundation(progress) { this.animateItems(this.animations.foundation,progress); }
  animateStructure(progress) { this.animateItems(this.animations.structure,progress); }
  animateFinishing(progress) { this.animateItems(this.animations.finishing,progress); }
  animateLandscape(progress) { this.animateItems(this.animations.landscape,progress); }

  setConstructionProgress(progress) {
    const p = clamp(Number(progress) || 0);
    this.instanceBatches.forEach(batch=>{batch.userData.visibleInstances=0;});
    this.animateFoundation(p);
    this.animateStructure(p);
    this.animateFinishing(p);
    this.animateLandscape(p);
    const completed=p>=.955;
    this.finalBatches.forEach(batch=>{batch.visible=completed;});
    Object.values(this.animations).flat().forEach(item=>{
      if(completed&&item.finalBatch&&!item.batch) item.object.visible=false;
    });
    this.instanceBatches.forEach(batch=>{batch.visible=batch.userData.visibleInstances>0&&!(completed&&batch.userData.finalReplaced);});
    this.animatedLights.forEach((item) => { item.light.intensity = item.intensity * range(p,item.start,item.end); });
    if (this.poolWater) {
      const fill=range(p,.78,.94);
      this.poolWater.visible=fill>.005;
      this.poolWater.position.y=THREE.MathUtils.lerp(.04,.565,fill);
      this.poolWater.material.uniforms.alpha.value=fill;
      this.poolWater.material.opacity=fill;
    }
  }

  updateWater(delta) {
    if(!this.poolWater?.visible) return;
    this.poolWater.material.uniforms.time.value += delta*.22;
  }

  getGroupCounts() {
    const names = ['foundationGroup','columnsGroup','beamsGroup','framingGroup','floorSlabsGroup','roofGroup','wallsGroup','facadeGroup','windowsGroup','interiorGroup','terraceGroup','landscapeGroup'];
    const items=Object.values(this.animations).flat();
    return Object.fromEntries(names.map(name=>[name,items.filter(item=>item.group===this[name]).length]));
  }
}
