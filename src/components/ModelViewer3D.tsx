"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  bgColor?: string;
}

function Model({ modelPath, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], autoRotate = true }: ModelViewerProps) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);
  
  // Auto-rotate a model
  useFrame((state, delta) => {
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  // Clone the scene to avoid sharing
  const clonedScene = scene.clone();

  return (
    <group ref={modelRef} position={position} rotation={rotation as any} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default function ModelViewer3D({ modelPath, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], autoRotate = true, bgColor = "transparent" }: ModelViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: bgColor }}
      >
        {/* Luz ambiente mínima apenas para ajudar a visualização */}
        <ambientLight intensity={0.3} />
        
        {/* Ambiente para reflexões - dawn tem reflexos mais suaves */}
        <Environment preset="dawn" />
        
        <PresentationControls
          global
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <Model 
            modelPath={modelPath} 
            scale={scale} 
            position={position} 
            rotation={rotation} 
            autoRotate={autoRotate}
          />
        </PresentationControls>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/3DMODELS/ILUMAi/ILUMAi_BREEZE.glb"); 