import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface ThreeFoodCanvasProps {
  enabled?: boolean;
}

export const ThreeFoodCanvas: React.FC<ThreeFoodCanvasProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Warm studio lighting illuminating both front and back
    const hemiLight = new THREE.HemisphereLight(0xfff1dc, 0x3d2716, 1.5);
    scene.add(hemiLight);

    // Front Key Light
    const frontKey = new THREE.DirectionalLight(0xfff6e8, 3.0);
    frontKey.position.set(4, 5, 5);
    scene.add(frontKey);

    // Back Light (ensures underneath and back crust are clearly visible and lit when rotating)
    const backLight = new THREE.DirectionalLight(0xffdfba, 2.4);
    backLight.position.set(-4, -3, -5);
    scene.add(backLight);

    // Rim Highlight
    const rimLight = new THREE.DirectionalLight(0xffbe6b, 1.8);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // Hierarchy: scene > flight (position, scale, yaw) > pizzaRoot (roll, pitch, continuous 360 spin)
    const flight = new THREE.Group();
    scene.add(flight);

    const pizzaRoot = new THREE.Group();
    flight.add(pizzaRoot);

    // BUILD FULLY 3D DUAL-SIDED PIZZA (Visible from front, back, and all angles)
    const pizzaGroup = new THREE.Group();

    // 1. Procedural Textures for Dough & Toppings
    // Baked Crust Texture (used for bottom base and rim)
    const createCrustCanvasTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      // Golden baked base
      const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
      grad.addColorStop(0, '#e5b26b');
      grad.addColorStop(0.7, '#d29a50');
      grad.addColorStop(1, '#a86b32');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Wood-fired blister speckles (char marks)
      for (let i = 0; i < 180; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 5 + 1.5;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(74, 38, 14, 0.65)' : 'rgba(120, 68, 28, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Melted Mozzarella & Sauce Texture
    const createCheeseCanvasTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      // Rich red tomato sauce base
      ctx.fillStyle = '#b82818';
      ctx.fillRect(0, 0, 512, 512);

      // Melted creamy golden mozzarella pools
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * 460 + 26;
        const y = Math.random() * 460 + 26;
        const rx = Math.random() * 38 + 20;
        const ry = Math.random() * 32 + 18;
        const grad = ctx.createRadialGradient(x, y, 2, x, y, rx);
        grad.addColorStop(0, '#fff6db');
        grad.addColorStop(0.6, '#f7d368');
        grad.addColorStop(0.9, '#e89e2e');
        grad.addColorStop(1, 'rgba(184, 40, 24, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      // Herbs oregano flecks
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = 'rgba(40, 75, 25, 0.85)';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2.5, 3.5);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const crustTex = createCrustCanvasTexture();
    const cheeseTex = createCheeseCanvasTexture();

    // 2. Materials
    const crustMat = new THREE.MeshStandardMaterial({
      map: crustTex,
      roughness: 0.72,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const cheeseMat = new THREE.MeshPhysicalMaterial({
      map: cheeseTex,
      roughness: 0.28,
      metalness: 0.08,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide,
    });

    const pepperoniMat = new THREE.MeshStandardMaterial({
      color: 0x9e2417, // Deep cured red
      roughness: 0.42,
      metalness: 0.12,
    });

    const paneerMat = new THREE.MeshStandardMaterial({
      color: 0xfaf4e6, // Grilled tandoori paneer
      roughness: 0.5,
      metalness: 0.05,
    });

    const capsicumMat = new THREE.MeshStandardMaterial({
      color: 0x2b8226, // Fresh green bell pepper
      roughness: 0.32,
      metalness: 0.1,
    });

    const oliveMat = new THREE.MeshStandardMaterial({
      color: 0x181818, // Black kalamata olive
      roughness: 0.25,
      metalness: 0.2,
    });

    // 3. PIZZA CRUST BASE (Visible from BACK/BOTTOM and SIDES)
    // Cylinder body with height 0.14: top is cheese surface, bottom is baked crust underside!
    const baseRadius = 1.5;
    const baseHeight = 0.14;
    const pizzaBaseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.98, baseHeight, 36);
    const pizzaBase = new THREE.Mesh(pizzaBaseGeo, crustMat);
    pizzaBase.castShadow = true;
    pizzaGroup.add(pizzaBase);

    // 4. PUFFY RAISED CRUST RIM (Torus ring framing the outer edge)
    const rimRadius = baseRadius * 0.98;
    const rimTube = 0.14;
    const crustRimGeo = new THREE.TorusGeometry(rimRadius, rimTube, 16, 36);
    const crustRim = new THREE.Mesh(crustRimGeo, crustMat);
    crustRim.rotation.x = Math.PI / 2;
    crustRim.position.y = baseHeight * 0.4;
    pizzaGroup.add(crustRim);

    // 5. MELTED CHEESE & SAUCE SURFACE (Front/Top disc)
    const cheeseDiscGeo = new THREE.CircleGeometry(baseRadius * 0.92, 36);
    const cheeseDisc = new THREE.Mesh(cheeseDiscGeo, cheeseMat);
    cheeseDisc.rotation.x = -Math.PI / 2;
    cheeseDisc.position.y = baseHeight / 2 + 0.01;
    pizzaGroup.add(cheeseDisc);

    // 6. TOPPINGS (Front side)
    // A. Pepperoni / Tandoori Discs
    const numPepperoni = 7;
    for (let i = 0; i < numPepperoni; i++) {
      const angle = (i / numPepperoni) * Math.PI * 2 + 0.2;
      const dist = 0.68 + (i % 2 === 0 ? 0.2 : -0.15);
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), pepperoniMat);
      pep.position.set(px, baseHeight / 2 + 0.025, pz);
      pep.rotation.y = Math.random();
      pizzaGroup.add(pep);

      // Char marks on pepperoni edge
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.015, 6, 16), crustMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(px, baseHeight / 2 + 0.035, pz);
      pizzaGroup.add(rim);
    }
    // Center Pepperoni
    const centerPep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), pepperoniMat);
    centerPep.position.set(-0.08, baseHeight / 2 + 0.025, 0.05);
    pizzaGroup.add(centerPep);

    // B. Grilled Paneer Cubes
    const paneerPositions = [
      [0.4, 0.15], [-0.5, 0.25], [0.1, -0.55], [-0.3, -0.45], [0.75, -0.2]
    ];
    paneerPositions.forEach(([x, z]) => {
      const paneer = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.18), paneerMat);
      paneer.position.set(x, baseHeight / 2 + 0.06, z);
      paneer.rotation.set(0.1, Math.random() * Math.PI, 0.1);
      pizzaGroup.add(paneer);
    });

    // C. Green Bell Pepper / Capsicum Slices (Torus arcs)
    const numCapsicum = 8;
    for (let i = 0; i < numCapsicum; i++) {
      const angle = (i / numCapsicum) * Math.PI * 2 + 0.5;
      const dist = 0.55 + (i % 2 === 0 ? 0.35 : -0.18);
      const cap = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 14, Math.PI * 1.3), capsicumMat);
      cap.rotation.x = Math.PI / 2;
      cap.rotation.z = Math.random() * Math.PI * 2;
      cap.position.set(Math.cos(angle) * dist, baseHeight / 2 + 0.035, Math.sin(angle) * dist);
      pizzaGroup.add(cap);
    }

    // D. Black Kalamata Olives (Hollow rings)
    const olivePositions = [
      [0.35, 0.7], [-0.4, 0.65], [-0.85, 0.0], [0.85, 0.2], [-0.1, 0.8], [0.55, -0.6]
    ];
    olivePositions.forEach(([x, z]) => {
      const olive = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.035, 8, 14), oliveMat);
      olive.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
      olive.position.set(x, baseHeight / 2 + 0.038, z);
      pizzaGroup.add(olive);
    });

    // 7. BOTTOM CRUST REALISM (Underside details so back looks fantastic)
    // Underside baked base disc
    const bottomDiscGeo = new THREE.CircleGeometry(baseRadius * 0.96, 36);
    const bottomDisc = new THREE.Mesh(bottomDiscGeo, crustMat);
    bottomDisc.rotation.x = Math.PI / 2; // points downward/backwards
    bottomDisc.position.y = -baseHeight / 2 - 0.005;
    pizzaGroup.add(bottomDisc);

    // Initial angle: slight forward tilt so front is immediately welcoming
    pizzaGroup.rotation.x = 0.35;
    pizzaRoot.add(pizzaGroup);

    // 8. OVEN-HOT STEAM & HERB AROMA PARTICLES
    const steamCount = 30;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount; i++) {
      steamPositions[i * 3] = (Math.random() - 0.5) * 1.5;
      steamPositions[i * 3 + 1] = Math.random() * 1.6;
      steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const steamPoints = new THREE.Points(steamGeo, steamMat);
    pizzaRoot.add(steamPoints);

    setIsLoaded(true);

    // Flight Path Keyframes across Hotel Sheetal Tonk sections (Compact size)
    const K_DESKTOP = [
      { x: -0.32, y: -0.06, s: 0.95, yaw: 135, pitch: 10, roll: -6 }, // Hero
      { x: 0.32,  y: -0.16, s: 0.90, yaw: 45,  pitch: 8,  roll: 6 },  // Booking Bar
      { x: -0.30, y: -0.20, s: 0.92, yaw: 140, pitch: -8, roll: -6 }, // Suites
      { x: 0.30,  y: -0.02, s: 0.98, yaw: 50,  pitch: 10, roll: 8 },  // Dining
      { x: -0.28, y: -0.14, s: 0.90, yaw: 130, pitch: 8,  roll: -5 }, // Banquets
      { x: 0.26,  y: -0.08, s: 0.88, yaw: 60,  pitch: 6,  roll: 4 },  // Heritage
      { x: 0.02,  y: -0.04, s: 0.85, yaw: 105, pitch: 4,  roll: 0 },  // Footer
    ];

    const K_MOBILE = [
      { x: 0.20, y: -0.04, s: 0.75, yaw: 140, pitch: 8,  roll: -4 },
      { x: -0.18, y: 0.10, s: 0.72, yaw: 50,  pitch: 8,  roll: 6 },
      { x: 0.18,  y: -0.12, s: 0.74, yaw: 140, pitch: -6, roll: -6 },
      { x: -0.16, y: 0.08, s: 0.78, yaw: 55,  pitch: 8,  roll: 6 },
      { x: 0.16,  y: -0.08, s: 0.72, yaw: 135, pitch: 8,  roll: -5 },
      { x: -0.14, y: 0.06, s: 0.70, yaw: 60,  pitch: 6,  roll: 4 },
      { x: 0.00,  y: 0.06, s: 0.68, yaw: 105, pitch: 4,  roll: 0 },
    ];

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function lerpAngle(a: number, b: number, t: number) {
      const d = ((b - a + 540) % 360) - 180;
      return a + d * t;
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function targetAt(scrollRatio: number) {
      const K = window.innerWidth < 760 ? K_MOBILE : K_DESKTOP;
      const p = Math.max(0, Math.min(K.length - 1, scrollRatio * (K.length - 1)));
      const i = Math.min(K.length - 2, Math.floor(p));
      const f = p - i;
      const t = ease(Math.max(0, Math.min(1, (f - 0.12) / 0.76)));
      const dive = Math.sin(t * Math.PI) * -0.18;
      const k0 = K[i];
      const k1 = K[i + 1];
      return {
        x: lerp(k0.x, k1.x, t),
        y: lerp(k0.y, k1.y, t) + dive,
        s: lerp(k0.s, k1.s, t) * (1 + Math.sin(t * Math.PI) * 0.1),
        yaw: lerpAngle(k0.yaw, k1.yaw, t),
        pitch: lerp(k0.pitch, k1.pitch, t),
        roll: lerp(k0.roll, k1.roll, t),
        moving: Math.sin(t * Math.PI),
      };
    }

    const clock = new THREE.Clock();
    const cur = { x: -0.32, y: -0.06, s: 0.95, yaw: 135, pitch: 10, roll: -6 };
    let prevX = cur.x;
    let prevY = cur.y;

    const mouse = { tx: 0, ty: 0, sx: 0, sy: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    const tick = () => {
      frameId = requestAnimationFrame(tick);

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      // Scroll progress 0..1
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollRatio = Math.max(0, Math.min(1, window.scrollY / docHeight));
      const target = targetAt(scrollRatio);

      // Smooth lag follow
      const k = 1 - Math.exp(-dt * 3.2);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      cur.s += (target.s - cur.s) * k;
      cur.pitch += (target.pitch - cur.pitch) * k;
      cur.roll += (target.roll - cur.roll) * k;

      const kYaw = 1 - Math.exp(-dt * 2.6);
      cur.yaw = lerpAngle(cur.yaw, target.yaw, kYaw);

      const vx = (cur.x - prevX) / dt;
      const vy = (cur.y - prevY) / dt;
      prevX = cur.x;
      prevY = cur.y;

      const kMouse = 1 - Math.exp(-dt * 2);
      mouse.sx += (mouse.tx - mouse.sx) * kMouse;
      mouse.sy += (mouse.ty - mouse.sy) * kMouse;

      const fovRad = (camera.fov * Math.PI) / 180;
      const halfH = Math.tan(fovRad / 2) * camera.position.z;
      const halfW = halfH * camera.aspect;
      const hover = Math.sin(t * 1.8) * 0.04 + Math.sin(t * 3.2) * 0.015;

      flight.position.x = cur.x * halfW + Math.sin(t * 1.2) * 0.04 + mouse.sx * 0.12;
      flight.position.y = cur.y * halfH + hover * halfH * 0.5 + mouse.sy * 0.08;
      flight.position.z = Math.sin(t * 0.8) * 0.12;

      flight.scale.setScalar(halfH * 2 * 0.155 * cur.s);

      // FULL 360° CONTINUOUS ROTATION so pizza is displayed from FRONT, BACK, and ALL SIDES!
      const continuousSpin = t * 0.65;
      flight.rotation.set(0, -((cur.yaw + mouse.sx * 10) * Math.PI / 180) + continuousSpin, 0);

      // Gentle wobble & tilt
      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
      const pitchDeg = cur.pitch - clamp(vy * 18, -24, 24) + Math.sin(t * 1.8 + 1) * 3 + mouse.sy * 6;
      const rollDeg = cur.roll + clamp(vx * 15, -24, 24) + Math.sin(t * 1.4) * 3.5;
      pizzaRoot.rotation.set((rollDeg * Math.PI) / 180, 0, (pitchDeg * Math.PI) / 180, 'YZX');

      // Animate rising oven steam
      const posAttr = steamPoints.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < steamCount; i++) {
        arr[i * 3 + 1] += dt * 0.6;
        arr[i * 3] += Math.sin(t * 2 + i) * dt * 0.15;
        if (arr[i * 3 + 1] > 2.2) {
          arr[i * 3 + 1] = 0.1;
          arr[i * 3] = (Math.random() - 0.5) * 1.8;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      id="food3d"
      className={`fixed inset-0 w-full h-full pointer-events-none z-30 transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
};
