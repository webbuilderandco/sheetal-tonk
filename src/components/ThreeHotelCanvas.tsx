import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Pre-allocated math variables to ensure zero GC in animation loop
const _vec3 = new THREE.Vector3();
const _targetCam = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export type LightingMode = 'twilight' | 'night' | 'day';
export type CameraPreset = 'facade' | 'pool' | 'chattri' | 'suites';

export interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  position: THREE.Vector3;
  targetPreset: CameraPreset;
}

export const HOTEL_HOTSPOTS: Hotspot[] = [
  {
    id: 'entrance',
    title: 'The Nawabi Portico & Lobby',
    subtitle: 'Grand Rajasthani arched gateway welcoming guests with traditional Shehnai',
    category: 'Welcome Area',
    position: new THREE.Vector3(0, 2.5, 3.5),
    targetPreset: 'facade',
  },
  {
    id: 'reflection-pool',
    title: 'Royal Courtyard & Lotus Pool',
    subtitle: 'Central stepped water pavilion with floating petals & evening diyas',
    category: 'Courtyard Oasis',
    position: new THREE.Vector3(0, 0.8, 11),
    targetPreset: 'pool',
  },
  {
    id: 'chattri-lounge',
    title: 'Sunehri Rooftop Chattri',
    subtitle: 'Ornate carved cupolas overlooking Tonk skyline & stargazing terrace',
    category: 'Rooftop Experience',
    position: new THREE.Vector3(0, 9.5, 0.5),
    targetPreset: 'chattri',
  },
  {
    id: 'royal-suites',
    title: 'Maharaja Heritage Jharokhas',
    subtitle: 'Hand-carved balcony suites with panoramic views of the landscaped lawns',
    category: 'Luxury Living',
    position: new THREE.Vector3(-6.5, 5, 2.2),
    targetPreset: 'suites',
  },
];

interface ThreeHotelCanvasProps {
  lightingMode: LightingMode;
  cameraPreset: CameraPreset;
  petalsActive: boolean;
  autoRotate: boolean;
  onHotspotSelect?: (hotspot: Hotspot) => void;
  activeHotspotId?: string | null;
}

export const ThreeHotelCanvas: React.FC<ThreeHotelCanvasProps> = ({
  lightingMode,
  cameraPreset,
  petalsActive,
  autoRotate,
  onHotspotSelect,
  activeHotspotId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [screenHotspots, setScreenHotspots] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);

  // Internal references to Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const petalsRef = useRef<THREE.Points | null>(null);
  const lanternLightsRef = useRef<THREE.PointLight[]>([]);
  const windowEmissivesRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const domeEmissivesRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Camera animation state
  const camCurrentRef = useRef(new THREE.Vector3(0, 6, 26));
  const lookCurrentRef = useRef(new THREE.Vector3(0, 3, 0));
  const userInteractingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0, phi: 0.22, distance: 26 });

  // Camera preset coordinates [camX, camY, camZ, lookX, lookY, lookZ]
  const presetMap: Record<CameraPreset, [number, number, number, number, number, number]> = {
    facade: [0, 5.5, 24, 0, 3.2, 0],
    pool: [0, 2.2, 16.5, 0, 2.8, 3],
    chattri: [4.5, 11.5, 12, 0, 8.2, 0],
    suites: [-9, 6.2, 10, -5, 4.8, 1],
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per skill directive
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / container.clientHeight, 0.5, 150);
    camera.position.set(0, 6, 26);
    cameraRef.current = camera;

    // Mandatory RoomEnvironment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting Rig
    const dirLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
    dirLight.position.set(16, 24, 18);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 60;
      const d = 18;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0004;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const hemiLight = new THREE.HemisphereLight(0xffecd2, 0x1a2130, 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Ground & Courtyard Plinth
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x141821,
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Warm Rajasthani Sandstone Materials
    const sandstoneMainMat = new THREE.MeshStandardMaterial({
      color: 0xd6b488, // Warm Dholpur / Jaisalmer golden sandstone
      roughness: 0.72,
      metalness: 0.08,
    });
    const sandstoneTrimMat = new THREE.MeshStandardMaterial({
      color: 0xb58c5a, // Deep carved sandstone trim
      roughness: 0.65,
      metalness: 0.12,
    });
    const goldOrnamentMat = new THREE.MeshStandardMaterial({
      color: 0xe5b85c,
      roughness: 0.28,
      metalness: 0.85,
    });
    const marbleWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xedebe4,
      roughness: 0.35,
      metalness: 0.05,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x362215,
      roughness: 0.75,
      metalness: 0.05,
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffe2a4,
      emissive: 0xffad33,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.1,
    });
    windowEmissivesRef.current.push(windowMat);

    const domeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf3c76d,
      emissive: 0xe5a329,
      emissiveIntensity: 0.4,
      roughness: 0.35,
      metalness: 0.4,
    });
    domeEmissivesRef.current.push(domeGlowMat);

    // BUILD THE PALACE HOTEL ARCHITECTURE (Multi-part THREE.Group)
    const palaceGroup = new THREE.Group();

    // 1. Grand Raised Courtyard Podium
    const podiumGeo = new THREE.BoxGeometry(26, 0.6, 20);
    const podium = new THREE.Mesh(podiumGeo, sandstoneTrimMat);
    podium.position.set(0, 0.3, 0);
    podium.receiveShadow = !isSoftwareGl;
    palaceGroup.add(podium);

    // Stepped Entrance steps
    for (let s = 1; s <= 4; s++) {
      const stepGeo = new THREE.BoxGeometry(10 + s * 0.8, 0.15, 0.8);
      const step = new THREE.Mesh(stepGeo, sandstoneTrimMat);
      step.position.set(0, (4 - s) * 0.15 + 0.075, 10 + s * 0.7);
      step.receiveShadow = !isSoftwareGl;
      palaceGroup.add(step);
    }

    // 2. Central Grand Entrance Pavilion
    const centralBlockGeo = new THREE.BoxGeometry(8, 7.5, 7);
    const centralBlock = new THREE.Mesh(centralBlockGeo, sandstoneMainMat);
    centralBlock.position.set(0, 4.35, 0);
    centralBlock.castShadow = !isSoftwareGl;
    centralBlock.receiveShadow = !isSoftwareGl;
    palaceGroup.add(centralBlock);

    // Archway Cutout / Frame (Mehrab Archway)
    const archPillarLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.2, 16), sandstoneTrimMat);
    archPillarLeft.position.set(-2, 2.7, 3.55);
    archPillarLeft.castShadow = !isSoftwareGl;
    palaceGroup.add(archPillarLeft);

    const archPillarRight = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.2, 16), sandstoneTrimMat);
    archPillarRight.position.set(2, 2.7, 3.55);
    archPillarRight.castShadow = !isSoftwareGl;
    palaceGroup.add(archPillarRight);

    // Arch Mehrab Header
    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.5, 0.8), sandstoneTrimMat);
    archLintel.position.set(0, 4.7, 3.55);
    palaceGroup.add(archLintel);

    // Grand Entrance Double Doors (Recessed)
    const doorGeo = new THREE.BoxGeometry(3.2, 3.8, 0.2);
    const door = new THREE.Mesh(doorGeo, darkWoodMat);
    door.position.set(0, 2.5, 3.3);
    palaceGroup.add(door);

    // Gold Brass Door Studs & Handles
    const doorHandleLeft = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 12, 16), goldOrnamentMat);
    doorHandleLeft.position.set(-0.5, 2.5, 3.45);
    palaceGroup.add(doorHandleLeft);
    const doorHandleRight = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 12, 16), goldOrnamentMat);
    doorHandleRight.position.set(0.5, 2.5, 3.45);
    palaceGroup.add(doorHandleRight);

    // "HOTEL SHEETAL TONK" Architectural Plaque above Archway
    const plaqueGeo = new THREE.BoxGeometry(5.2, 0.9, 0.25);
    const plaque = new THREE.Mesh(plaqueGeo, marbleWhiteMat);
    plaque.position.set(0, 5.5, 3.6);
    palaceGroup.add(plaque);

    const crestBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 24), goldOrnamentMat);
    crestBadge.rotation.x = Math.PI / 2;
    crestBadge.position.set(0, 6.2, 3.65);
    palaceGroup.add(crestBadge);

    // 3. Left Wing (Presidential & Heritage Suites)
    const leftWingGeo = new THREE.BoxGeometry(8, 6.5, 6);
    const leftWing = new THREE.Mesh(leftWingGeo, sandstoneMainMat);
    leftWing.position.set(-7.5, 3.85, -0.5);
    leftWing.castShadow = !isSoftwareGl;
    leftWing.receiveShadow = !isSoftwareGl;
    palaceGroup.add(leftWing);

    // 4. Right Wing (Royal Deluxe & Dining Halls)
    const rightWingGeo = new THREE.BoxGeometry(8, 6.5, 6);
    const rightWing = new THREE.Mesh(rightWingGeo, sandstoneMainMat);
    rightWing.position.set(7.5, 3.85, -0.5);
    rightWing.castShadow = !isSoftwareGl;
    rightWing.receiveShadow = !isSoftwareGl;
    palaceGroup.add(rightWing);

    // Cornices and Slanted Eaves (Chajjas) across the facade
    const leftEave = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.2, 1.2), sandstoneTrimMat);
    leftEave.position.set(-7.5, 6.9, 2.5);
    leftEave.rotation.x = 0.12;
    palaceGroup.add(leftEave);

    const rightEave = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.2, 1.2), sandstoneTrimMat);
    rightEave.position.set(7.5, 6.9, 2.5);
    rightEave.rotation.x = 0.12;
    palaceGroup.add(rightEave);

    const centralEave = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.25, 1.4), sandstoneTrimMat);
    centralEave.position.set(0, 8.05, 3.6);
    centralEave.rotation.x = 0.12;
    palaceGroup.add(centralEave);

    // 5. Jharokha Balconies with Carved Lattice (Left & Right Wings)
    const createJharokha = (x: number, y: number, z: number) => {
      const jharokhaGroup = new THREE.Group();
      // Bracket base
      const baseGeo = new THREE.ConeGeometry(0.9, 0.8, 6);
      const base = new THREE.Mesh(baseGeo, sandstoneTrimMat);
      base.rotation.x = Math.PI;
      base.position.set(0, -0.4, 0);
      jharokhaGroup.add(base);

      // Balcony enclosure
      const balcGeo = new THREE.CylinderGeometry(0.95, 0.9, 1.1, 8, 1, true);
      const balc = new THREE.Mesh(balcGeo, sandstoneTrimMat);
      jharokhaGroup.add(balc);

      // Backlit Suite Window inside Jharokha
      const winGeo = new THREE.PlaneGeometry(1.2, 1.5);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.set(0, 0.3, -0.3);
      jharokhaGroup.add(win);

      // Jharokha Roof Canopy / Chattri
      const roofGeo = new THREE.ConeGeometry(1.1, 0.7, 8);
      const roof = new THREE.Mesh(roofGeo, sandstoneTrimMat);
      roof.position.set(0, 0.95, 0);
      jharokhaGroup.add(roof);

      // Brass Kalash finial
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), goldOrnamentMat);
      finial.position.set(0, 1.4, 0);
      jharokhaGroup.add(finial);

      jharokhaGroup.position.set(x, y, z);
      return jharokhaGroup;
    };

    // Add 4 Suite Jharokhas across the facade
    palaceGroup.add(createJharokha(-9.5, 4.2, 2.5));
    palaceGroup.add(createJharokha(-5.5, 4.2, 2.5));
    palaceGroup.add(createJharokha(5.5, 4.2, 2.5));
    palaceGroup.add(createJharokha(9.5, 4.2, 2.5));

    // Ground floor arched gallery windows
    const createArchWindow = (x: number, y: number, z: number) => {
      const g = new THREE.Group();
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), windowMat);
      g.add(win);
      const archTop = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), windowMat);
      archTop.position.set(0, 0.9, 0);
      g.add(archTop);
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 8, 16, Math.PI), sandstoneTrimMat);
      frame.position.set(0, 0.9, 0.02);
      g.add(frame);
      g.position.set(x, y, z);
      return g;
    };

    palaceGroup.add(createArchWindow(-9.5, 1.8, 2.52));
    palaceGroup.add(createArchWindow(-5.5, 1.8, 2.52));
    palaceGroup.add(createArchWindow(5.5, 1.8, 2.52));
    palaceGroup.add(createArchWindow(9.5, 1.8, 2.52));

    // 6. ROOFTOP CHATTRIS (The Royal Rajput Cupolas)
    const createChattri = (radius: number, height: number, domeHeight: number) => {
      const chattri = new THREE.Group();

      // Plinth
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.15, radius * 1.25, 0.35, 16), sandstoneTrimMat);
      chattri.add(plinth);

      // Pillars (6 perimeter columns)
      const numPillars = 6;
      for (let i = 0; i < numPillars; i++) {
        const angle = (i / numPillars) * Math.PI * 2;
        const px = Math.cos(angle) * (radius * 0.85);
        const pz = Math.sin(angle) * (radius * 0.85);
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, height, 12), sandstoneTrimMat);
        col.position.set(px, height / 2 + 0.175, pz);
        chattri.add(col);
      }

      // Arch Ring Above Columns
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.1, radius * 1.05, 0.25, 16), sandstoneTrimMat);
      ring.position.set(0, height + 0.3, 0);
      chattri.add(ring);

      // Fluted Royal Rajasthani Dome
      const dome = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7), domeGlowMat);
      dome.position.set(0, height + 0.4, 0);
      chattri.add(dome);

      // Inverted Lotus & Kalash Brass Finial
      const lotus = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.35, 0.4, 16), goldOrnamentMat);
      lotus.rotation.x = Math.PI;
      lotus.position.set(0, height + domeHeight + 0.7, 0);
      chattri.add(lotus);

      const finialSphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), goldOrnamentMat);
      finialSphere.position.set(0, height + domeHeight + 1.1, 0);
      chattri.add(finialSphere);

      const finialSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.6, 12), goldOrnamentMat);
      finialSpire.position.set(0, height + domeHeight + 1.45, 0);
      chattri.add(finialSpire);

      return chattri;
    };

    // Central Grand Chattri (Main Crown of Hotel Sheetal)
    const mainChattri = createChattri(2.2, 2.2, 1.8);
    mainChattri.position.set(0, 8.2, 0);
    palaceGroup.add(mainChattri);

    // Left Wing Corner Chattri
    const leftChattri = createChattri(1.3, 1.6, 1.1);
    leftChattri.position.set(-10, 7.0, 0);
    palaceGroup.add(leftChattri);

    // Right Wing Corner Chattri
    const rightChattri = createChattri(1.3, 1.6, 1.1);
    rightChattri.position.set(10, 7.0, 0);
    palaceGroup.add(rightChattri);

    // Parapet crenellations across rooftop
    const createParapet = (length: number, x: number, y: number, z: number) => {
      const g = new THREE.Group();
      const count = Math.floor(length / 0.7);
      for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.25), sandstoneTrimMat);
          m.position.set((i - count / 2) * 0.7, 0, 0);
          g.add(m);
        }
      }
      g.position.set(x, y, z);
      return g;
    };

    palaceGroup.add(createParapet(8, -7.5, 7.15, 2.5));
    palaceGroup.add(createParapet(8, 7.5, 7.15, 2.5));
    palaceGroup.add(createParapet(7.5, 0, 8.25, 3.5));

    scene.add(palaceGroup);

    // 7. CENTRAL WATER REFLECTION POOL & STEPPED TANK
    const poolGroup = new THREE.Group();
    // Outer stone rim
    const poolRim = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.4, 7.6), sandstoneTrimMat);
    poolRim.position.set(0, 0.2, 11);
    poolRim.receiveShadow = !isSoftwareGl;
    poolGroup.add(poolRim);

    // Pool Inner Basin
    const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.35, 6.6), marbleWhiteMat);
    poolBasin.position.set(0, 0.15, 11);
    poolGroup.add(poolBasin);

    // Water Surface (PBR Material with emerald/blue reflections)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f4852,
      roughness: 0.12,
      metalness: 0.65,
    });
    const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 6.5, 16, 16), waterMat);
    waterPlane.rotation.x = -Math.PI / 2;
    waterPlane.position.set(0, 0.32, 11);
    waterPlane.receiveShadow = true;
    poolGroup.add(waterPlane);
    waterMeshRef.current = waterPlane;

    // Center Lotus Fountain in Pool
    const fountainGroup = new THREE.Group();
    const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.6, 16), marbleWhiteMat);
    fountainBase.position.set(0, 0.3, 0);
    fountainGroup.add(fountainBase);

    const fountainBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.8, 0.3, 24), marbleWhiteMat);
    fountainBowl.position.set(0, 0.7, 0);
    fountainGroup.add(fountainBowl);

    const fountainJet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 12), goldOrnamentMat);
    fountainJet.position.set(0, 0.95, 0);
    fountainGroup.add(fountainJet);

    fountainGroup.position.set(0, 0, 11);
    poolGroup.add(fountainGroup);

    scene.add(poolGroup);

    // 8. COURTYARD PALM TREES & FLOWER PLANTERS
    const createPalmTree = (x: number, z: number, scale = 1) => {
      const palm = new THREE.Group();
      // Trunk (curved segmented cylinder)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a483a, roughness: 0.85 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 4.8 * scale, 10), trunkMat);
      trunk.position.set(0, 2.4 * scale, 0);
      trunk.castShadow = !isSoftwareGl;
      palm.add(trunk);

      // Fronds (Arching green leaves)
      const frondMat = new THREE.MeshStandardMaterial({
        color: 0x24552b,
        roughness: 0.65,
        side: THREE.DoubleSide,
      });
      const numFronds = 9;
      for (let i = 0; i < numFronds; i++) {
        const angle = (i / numFronds) * Math.PI * 2;
        const frondGeo = new THREE.ConeGeometry(0.7 * scale, 3.2 * scale, 4);
        const frond = new THREE.Mesh(frondGeo, frondMat);
        frond.rotation.z = Math.PI / 2.8;
        frond.rotation.y = angle;
        frond.position.set(0, 4.7 * scale, 0);
        palm.add(frond);
      }

      // Stone Planter Base
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * scale, 0.6 * scale, 0.7 * scale, 12), sandstoneTrimMat);
      pot.position.set(0, 0.35 * scale, 0);
      palm.add(pot);

      palm.position.set(x, 0, z);
      return palm;
    };

    scene.add(createPalmTree(-8.5, 11, 1.1));
    scene.add(createPalmTree(8.5, 11, 1.1));
    scene.add(createPalmTree(-11.5, 6, 0.95));
    scene.add(createPalmTree(11.5, 6, 0.95));

    // 9. ORNATE STONE LANTERNS / DIYAS WITH POINT LIGHTS
    const lanternPositions = [
      new THREE.Vector3(-4, 0.6, 7.5),
      new THREE.Vector3(4, 0.6, 7.5),
      new THREE.Vector3(-4.5, 0.6, 14.5),
      new THREE.Vector3(4.5, 0.6, 14.5),
      new THREE.Vector3(-2.2, 3.8, 3.6),
      new THREE.Vector3(2.2, 3.8, 3.6),
    ];

    lanternLightsRef.current = [];
    lanternPositions.forEach((pos) => {
      // Stone lantern body
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.9, 8), sandstoneTrimMat);
      post.position.copy(pos);
      scene.add(post);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), goldOrnamentMat);
      lampHead.position.set(pos.x, pos.y + 0.55, pos.z);
      scene.add(lampHead);

      // Warm Amber Point Light for evening starlight ambience
      const pLight = new THREE.PointLight(0xffaa33, 1.4, 9, 1.5);
      pLight.position.set(pos.x, pos.y + 0.6, pos.z);
      scene.add(pLight);
      lanternLightsRef.current.push(pLight);
    });

    // 10. FLOATING ROSE & MARIGOLD FLOWER PETALS (Animated Particle System)
    const petalCount = 220;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVelocities = new Float32Array(petalCount * 3);
    const petalColors = new Float32Array(petalCount * 3);

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 22;
      petalPositions[i * 3 + 1] = Math.random() * 8 + 0.5;
      petalPositions[i * 3 + 2] = Math.random() * 20 + 2;

      petalVelocities[i * 3] = (Math.random() - 0.5) * 0.4;
      petalVelocities[i * 3 + 1] = -0.3 - Math.random() * 0.4;
      petalVelocities[i * 3 + 2] = -0.2 - Math.random() * 0.3;

      // Saffron gold & rose pink tones
      if (Math.random() > 0.4) {
        // Marigold Gold
        petalColors[i * 3] = 0.98;
        petalColors[i * 3 + 1] = 0.72;
        petalColors[i * 3 + 2] = 0.15;
      } else {
        // Royal Rose Pink
        petalColors[i * 3] = 0.92;
        petalColors[i * 3 + 1] = 0.24;
        petalColors[i * 3 + 2] = 0.38;
      }
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    petalGeo.setAttribute('color', new THREE.BufferAttribute(petalColors, 3));

    const petalMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);
    petalsRef.current = petalSystem;

    // Contact Shadows grounding the palace and trees
    const contactMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const palaceShadow = new THREE.Mesh(new THREE.PlaneGeometry(28, 16), contactMat);
    palaceShadow.rotation.x = -Math.PI / 2;
    palaceShadow.position.set(0, 0.02, 1);
    scene.add(palaceShadow);

    setIsInitialized(true);

    // MOUSE & TOUCH ORBIT DRAG CONTROLS (With smooth damping)
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      userInteractingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerStartRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!userInteractingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - pointerStartRef.current.x;
      const deltaY = clientY - pointerStartRef.current.y;
      pointerStartRef.current = { x: clientX, y: clientY };

      orbitAnglesRef.current.theta -= deltaX * 0.005;
      orbitAnglesRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2.3, orbitAnglesRef.current.phi + deltaY * 0.005));
    };

    const onPointerUp = () => {
      userInteractingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAnglesRef.current.distance = Math.max(10, Math.min(36, orbitAnglesRef.current.distance + e.deltaY * 0.02));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION & RENDER LOOP
    let frameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // 1. Gentle auto-rotation when enabled
      if (autoRotate && !userInteractingRef.current) {
        orbitAnglesRef.current.theta += delta * 0.08;
      }

      // 2. Camera smooth transition to target preset
      const targetCoords = presetMap[cameraPreset];
      if (userInteractingRef.current) {
        // Orbit mode around current target
        const dist = orbitAnglesRef.current.distance;
        const phi = orbitAnglesRef.current.phi;
        const theta = orbitAnglesRef.current.theta;

        _targetCam.set(
          targetCoords[3] + dist * Math.sin(theta) * Math.cos(phi),
          targetCoords[4] + dist * Math.sin(phi),
          targetCoords[5] + dist * Math.cos(theta) * Math.cos(phi)
        );
        _targetLookAt.set(targetCoords[3], targetCoords[4], targetCoords[5]);
      } else {
        // Preset mode with gentle floating breath
        const sway = Math.sin(elapsed * 0.6) * 0.15;
        _targetCam.set(targetCoords[0] + sway, targetCoords[1] + Math.cos(elapsed * 0.4) * 0.08, targetCoords[2]);
        _targetLookAt.set(targetCoords[3], targetCoords[4], targetCoords[5]);
      }

      // Silky-smooth exponential damping
      camCurrentRef.current.x = THREE.MathUtils.damp(camCurrentRef.current.x, _targetCam.x, 3.5, delta);
      camCurrentRef.current.y = THREE.MathUtils.damp(camCurrentRef.current.y, _targetCam.y, 3.5, delta);
      camCurrentRef.current.z = THREE.MathUtils.damp(camCurrentRef.current.z, _targetCam.z, 3.5, delta);

      lookCurrentRef.current.x = THREE.MathUtils.damp(lookCurrentRef.current.x, _targetLookAt.x, 3.5, delta);
      lookCurrentRef.current.y = THREE.MathUtils.damp(lookCurrentRef.current.y, _targetLookAt.y, 3.5, delta);
      lookCurrentRef.current.z = THREE.MathUtils.damp(lookCurrentRef.current.z, _targetLookAt.z, 3.5, delta);

      if (cameraRef.current) {
        cameraRef.current.position.copy(camCurrentRef.current);
        cameraRef.current.lookAt(lookCurrentRef.current);
      }

      // 3. Water surface subtle pulsation & ripple
      if (waterMeshRef.current) {
        const mat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.roughness = 0.12 + Math.sin(elapsed * 2.2) * 0.04;
      }

      // 4. Animate floating rose/marigold flower petals
      if (petalsRef.current && petalsActive) {
        const posAttr = petalsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let i = 0; i < petalCount; i++) {
          positions[i * 3 + 1] -= delta * (0.8 + Math.sin(elapsed + i) * 0.2); // fall downward
          positions[i * 3] += Math.sin(elapsed * 1.5 + i) * delta * 0.6; // gentle sway X
          positions[i * 3 + 2] += delta * 0.3; // breeze toward camera

          // Recycle petals that hit ground or drifted past
          if (positions[i * 3 + 1] <= 0.25 || positions[i * 3 + 2] > 28) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = 6 + Math.random() * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 16 + 2;
          }
        }
        posAttr.needsUpdate = true;
      }

      // 5. Update screen positions for 3D interactive Hotspots
      if (cameraRef.current && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const coords = HOTEL_HOTSPOTS.map((h) => {
          _vec3.copy(h.position);
          _vec3.project(cameraRef.current!);
          const visible = _vec3.z < 1.0;
          return {
            id: h.id,
            x: ((_vec3.x + 1) * width) / 2,
            y: ((-_vec3.y + 1) * height) / 2,
            visible,
          };
        });
        setScreenHotspots(coords);
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update lighting & atmosphere whenever lightingMode changes
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;

    if (lightingMode === 'twilight') {
      // Golden twilight over Rajasthan
      sceneRef.current.background = new THREE.Color(0x161324);
      sceneRef.current.fog = new THREE.FogExp2(0x1a162b, 0.024);
      dirLightRef.current.color.setHex(0xffaa5e);
      dirLightRef.current.intensity = 2.4;
      dirLightRef.current.position.set(16, 12, 14);
      hemiLightRef.current.color.setHex(0xff9966);
      hemiLightRef.current.groundColor.setHex(0x1c1a2e);
      hemiLightRef.current.intensity = 0.95;

      lanternLightsRef.current.forEach((l) => (l.intensity = 1.6));
      windowEmissivesRef.current.forEach((w) => (w.emissiveIntensity = 0.85));
      domeEmissivesRef.current.forEach((d) => (d.emissiveIntensity = 0.5));
    } else if (lightingMode === 'night') {
      // Royal Starlight Night
      sceneRef.current.background = new THREE.Color(0x070913);
      sceneRef.current.fog = new THREE.FogExp2(0x090c1a, 0.028);
      dirLightRef.current.color.setHex(0x7892b5);
      dirLightRef.current.intensity = 0.65;
      dirLightRef.current.position.set(-10, 20, -10);
      hemiLightRef.current.color.setHex(0x324461);
      hemiLightRef.current.groundColor.setHex(0x060810);
      hemiLightRef.current.intensity = 0.45;

      // Glow bright lanterns & fairy lights
      lanternLightsRef.current.forEach((l) => (l.intensity = 2.6));
      windowEmissivesRef.current.forEach((w) => (w.emissiveIntensity = 1.35));
      domeEmissivesRef.current.forEach((d) => (d.emissiveIntensity = 0.95));
    } else {
      // Sandstone Day / High Noon Sun
      sceneRef.current.background = new THREE.Color(0x566d8a);
      sceneRef.current.fog = new THREE.FogExp2(0x566d8a, 0.016);
      dirLightRef.current.color.setHex(0xfff6e8);
      dirLightRef.current.intensity = 3.2;
      dirLightRef.current.position.set(18, 28, 16);
      hemiLightRef.current.color.setHex(0xffeed6);
      hemiLightRef.current.groundColor.setHex(0x353a42);
      hemiLightRef.current.intensity = 1.2;

      lanternLightsRef.current.forEach((l) => (l.intensity = 0.15));
      windowEmissivesRef.current.forEach((w) => (w.emissiveIntensity = 0.2));
      domeEmissivesRef.current.forEach((d) => (d.emissiveIntensity = 0.1));
    }
  }, [lightingMode, isInitialized]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Hotspot Interactive Marker Overlays */}
      {screenHotspots.map((spot) => {
        if (!spot.visible) return null;
        const hotspotDef = HOTEL_HOTSPOTS.find((h) => h.id === spot.id);
        if (!hotspotDef) return null;
        const isActive = activeHotspotId === spot.id;

        return (
          <div
            key={spot.id}
            style={{
              transform: `translate3d(${spot.x}px, ${spot.y}px, 0)`,
              willChange: 'transform',
            }}
            className="absolute top-0 left-0 pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-20 group"
          >
            <button
              onClick={() => onHotspotSelect?.(hotspotDef)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all shadow-lg ${
                isActive
                  ? 'bg-[#d4af37] text-black ring-2 ring-white/80 scale-105'
                  : 'bg-black/75 hover:bg-[#c5a059] text-white hover:text-black border border-white/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#d4af37] group-hover:bg-black transition-colors" />
              <span className="whitespace-nowrap">{hotspotDef.title.split(' ')[0]} {hotspotDef.title.split(' ')[1] || ''}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
