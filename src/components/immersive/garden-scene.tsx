"use client";

import { useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createGardenGeometries } from "./garden-geometry";

function createPlasterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#e5e4df";
  context.fillRect(0, 0, 256, 256);
  let seed = 9147;
  for (let index = 0; index < 2200; index += 1) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 256;
    seed = (seed * 16807) % 2147483647;
    const y = seed % 256;
    const alpha = 0.018 + (seed % 9) / 900;
    context.fillStyle = `rgba(55, 55, 50, ${alpha})`;
    context.fillRect(x, y, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  return texture;
}

export function GardenScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const invalidateRef = useRef<() => void>(() => {});
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    return scrollYProgress.on("change", (value) => {
      progressRef.current = value;
      invalidateRef.current();
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (typeof WebGLRenderingContext === "undefined") {
      let active = true;
      queueMicrotask(() => {
        if (active) setState("fallback");
      });
      return () => {
        active = false;
      };
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const detail = window.innerWidth < 700 ? "mobile" : "desktop";
    let mounted = true;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      let active = true;
      queueMicrotask(() => {
        if (active) setState("fallback");
      });
      return () => {
        active = false;
      };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = detail === "desktop";
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e5e4df");
    scene.fog = new THREE.FogExp2("#e5e4df", 0.035);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    camera.position.set(0, 0.2, 13);

    const plasterTexture = createPlasterTexture();
    const plaster = new THREE.MeshPhysicalMaterial({
      color: "#deded8",
      roughness: 0.72,
      metalness: 0,
      clearcoat: 0.08,
      map: plasterTexture,
    });
    const mineral = new THREE.MeshPhysicalMaterial({
      color: "#bdcbc1",
      roughness: 0.42,
      metalness: 0.06,
      clearcoat: 0.4,
      clearcoatRoughness: 0.28,
    });
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: "#bcbcb6",
      roughness: 0.9,
    });
    const geometries = createGardenGeometries(detail);
    const garden = new THREE.Group();
    scene.add(garden);

    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(34, 24, 1, 1), plaster);
    backdrop.position.set(0, 0, -2.8);
    backdrop.receiveShadow = true;
    garden.add(backdrop);

    const stems = [
      { position: [-4.7, -2.2, -0.8], scale: 1.05, rotation: -0.18 },
      { position: [1.8, -2.7, -0.3], scale: 0.95, rotation: 0.72 },
      { position: [-0.5, -3.1, -1.2], scale: 0.72, rotation: 1.1 },
    ] as const;
    for (const item of stems) {
      const stem = new THREE.Mesh(geometries.stem, plaster);
      const [x, y, z] = item.position;
      stem.position.set(x, y, z);
      stem.scale.setScalar(item.scale);
      stem.rotation.z = item.rotation;
      stem.castShadow = true;
      garden.add(stem);
    }

    const leafTransforms = [
      [-4.1, -0.6, 0.0, -0.85, 1.15],
      [-2.65, 0.45, 0.3, 0.5, 0.92],
      [-1.4, 1.25, -0.2, -0.25, 1.25],
      [2.25, -0.85, 0.25, 0.75, 1.35],
      [3.85, 0.35, -0.2, -0.55, 1.05],
      [0.65, -1.85, 0.3, 0.2, 0.88],
      [4.8, 1.8, -0.8, 0.85, 0.8],
    ] as const;
    for (const [x, y, z, rotation, scale] of leafTransforms) {
      const leaf = new THREE.Mesh(geometries.leaf, plaster);
      leaf.position.set(x, y, z);
      leaf.rotation.z = rotation;
      leaf.scale.setScalar(scale);
      leaf.castShadow = true;
      garden.add(leaf);
    }

    const flowers = new THREE.Group();
    const flowerDefinitions = [
      [-2.1, 1.9, 0.35, 0.85],
      [3.7, -1.55, 0.5, 1.2],
      [0.9, 2.6, -0.35, 0.64],
    ] as const;
    for (const [x, y, z, scale] of flowerDefinitions) {
      const flower = new THREE.Group();
      for (let petalIndex = 0; petalIndex < 8; petalIndex += 1) {
        const petal = new THREE.Mesh(
          geometries.petal,
          petalIndex % 2 === 0 ? plaster : mineral,
        );
        petal.rotation.z = (petalIndex / 8) * Math.PI * 2;
        petal.castShadow = true;
        flower.add(petal);
      }
      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, detail === "desktop" ? 24 : 14, 12),
        shadowMaterial,
      );
      center.scale.z = 0.45;
      center.position.z = 0.12;
      flower.add(center);
      flower.position.set(x, y, z);
      flower.scale.setScalar(scale);
      flowers.add(flower);
    }
    garden.add(flowers);

    const birds = new THREE.Group();
    const birdDefinitions = [
      [-3.7, 2.8, 0.8, 0.35],
      [1.15, 0.8, 1.5, -0.18],
      [4.55, 2.7, 0.4, 0.2],
    ] as const;
    for (const [x, y, z, rotation] of birdDefinitions) {
      const bird = new THREE.Mesh(geometries.bird, plaster);
      bird.position.set(x, y, z);
      bird.rotation.z = rotation;
      bird.scale.setScalar(0.58);
      bird.castShadow = true;
      birds.add(bird);
    }
    garden.add(birds);

    const ambient = new THREE.HemisphereLight("#ffffff", "#888982", 2.4);
    const key = new THREE.DirectionalLight("#ffffff", 4.6);
    key.position.set(-5, 8, 9);
    key.castShadow = detail === "desktop";
    key.shadow.mapSize.set(1024, 1024);
    const rim = new THREE.DirectionalLight("#9cc9b1", 2.2);
    rim.position.set(7, -2, 5);
    scene.add(ambient, key, rim);

    let frame = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let visible = true;
    let lost = false;
    let pointerX = 0;
    let pointerY = 0;
    const paperColor = new THREE.Color("#deded8");
    const mineralColor = new THREE.Color("#86aa98");
    const render = (time: number) => {
      frame = 0;
      if (!visible || document.hidden || lost) return;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      elapsed += reducedMotion.matches ? 0 : delta;
      const progress = progressRef.current;
      const targetX = pointerRef.current.x * 0.17;
      const targetY = pointerRef.current.y * 0.11;
      pointerX += (targetX - pointerX) * 0.06;
      pointerY += (targetY - pointerY) * 0.06;
      garden.rotation.y = pointerX + progress * 0.3;
      garden.rotation.x = -pointerY + progress * 0.05;
      garden.position.y = progress * 3.8 - 0.15;
      garden.position.z = -progress * 7.5;
      flowers.rotation.z = Math.sin(elapsed * 0.32) * 0.025 + progress * 0.18;
      birds.position.x = progress * 3.5;
      birds.position.y = Math.sin(elapsed * 0.5) * 0.08 + progress * 1.2;
      mineral.color.copy(paperColor).lerp(mineralColor, Math.min(1, progress * 2.2));
      const objectOpacity = 1 - Math.min(0.58, Math.max(0, progress - 0.12) * 1.35);
      plaster.transparent = objectOpacity < 1;
      mineral.transparent = objectOpacity < 1;
      shadowMaterial.transparent = objectOpacity < 1;
      plaster.opacity = objectOpacity;
      mineral.opacity = objectOpacity;
      shadowMaterial.opacity = objectOpacity;
      camera.position.x = progress * 0.75;
      camera.position.y = 0.2 + progress * 0.65;
      camera.lookAt(0, progress * 0.5, -progress * 2);
      renderer.render(scene, camera);
      if (!reducedMotion.matches) frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (!frame && visible && !document.hidden && !lost) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    invalidateRef.current = start;

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 700 ? 16.8 : 13;
      garden.scale.setScalar(width < 700 ? 0.78 : 1);
      camera.updateProjectionMatrix();
      start();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "100px" },
    );
    intersectionObserver.observe(host);
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerRef.current.x = event.clientX / window.innerWidth - 0.5;
      pointerRef.current.y = event.clientY / window.innerHeight - 0.5;
      start();
    };
    const visibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else start();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      renderer.domElement.style.display = "none";
      setState("fallback");
    };
    const motionChange = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      start();
    };
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    reducedMotion.addEventListener("change", motionChange);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    resize();
    renderer.render(scene, camera);
    queueMicrotask(() => {
      if (mounted) setState("ready");
    });
    start();

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      invalidateRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("visibilitychange", visibilityChange);
      reducedMotion.removeEventListener("change", motionChange);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      for (const geometry of Object.values(geometries)) geometry.dispose();
      backdrop.geometry.dispose();
      for (const object of flowers.children) {
        for (const child of object.children) {
          if (child instanceof THREE.Mesh && child.geometry !== geometries.petal) {
            child.geometry.dispose();
          }
        }
      }
      plaster.dispose();
      mineral.dispose();
      shadowMaterial.dispose();
      plasterTexture?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="garden-scene" ref={hostRef} data-state={state}>
      {state !== "ready" ? (
        <div className="garden-scene-fallback" aria-hidden="true">
          <span className="relief-stem relief-stem-one" />
          <span className="relief-stem relief-stem-two" />
          <span className="relief-orbit" />
        </div>
      ) : null}
    </div>
  );
}
