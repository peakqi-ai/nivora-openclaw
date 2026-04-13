"use client";

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MATERIALS, type MaterialType } from "@/lib/pricing";

interface Viewer3DProps {
  material: MaterialType;
  color: string;
  modelBlobUrl: string | null;
  onModelLoaded?: () => void;
}

export default function Viewer3D({
  material,
  color,
  modelBlobUrl,
  onModelLoaded,
}: Viewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);

  // Initialize scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.offsetWidth / canvas.offsetHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x00e5c0, 0.3);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // Grid
    scene.add(new THREE.GridHelper(10, 10, 0x00e5c0, 0x444444));

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Load model when blobUrl changes
  useEffect(() => {
    if (!modelBlobUrl || !sceneRef.current) return;

    const loader = new GLTFLoader();
    loader.load(
      modelBlobUrl,
      (gltf) => {
        const scene = sceneRef.current!;
        if (modelRef.current) scene.remove(modelRef.current);

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;

        model.position.sub(center);
        model.scale.multiplyScalar(scale);
        scene.add(model);
        modelRef.current = model;
        onModelLoaded?.();
      },
      undefined,
      (err) => console.error("Model load error:", err)
    );
  }, [modelBlobUrl, onModelLoaded]);

  // Update material appearance
  const updateMaterial = useCallback(() => {
    if (!modelRef.current) return;
    const matProps = MATERIALS[material];
    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: matProps.roughness,
          metalness: matProps.metalness,
        });
      }
    });
  }, [material, color]);

  useEffect(() => {
    updateMaterial();
  }, [updateMaterial]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
    />
  );
}
