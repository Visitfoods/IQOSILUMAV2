"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Stage, ContactShadows, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ACESFilmicToneMapping } from 'three';

interface ModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
  onError?: () => void;
}

function Model({ modelPath, scale = 3, position = [0, 0, 0], onError }: ModelViewerProps) {
  const [hasError, setHasError] = useState(false);

  // Hook sempre chamado incondicionalmente
  let scene;
  try {
    const gltf = useGLTF(modelPath);
    scene = gltf.scene;
  } catch (error) {
    console.error("Erro ao carregar modelo:", error);
    if (!hasError) {
      setHasError(true);
      if (onError) onError();
    }
    return null;
  }
  
  if (!scene) return null;
  
  return (
    <Stage
      preset="soft"
      intensity={1.8}
      environment="city"
      shadows={false}
      adjustCamera={false}
    >
      <primitive 
        object={scene} 
        scale={scale} 
        position={position} 
      />
    </Stage>
  );
}

// Componente de fallback para capturar erros no carregamento de modelos
class ErrorBoundary extends React.Component<{onError?: () => void, children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {onError?: () => void, children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("Erro no componente 3D:", error);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default function ModelViewer3D({ modelPath, scale = 3, position = [0, 0, 0], autoRotate = false, onError }: ModelViewerProps) {
  const controlsRef = useRef(null);

  // Precarregar o modelo
  useEffect(() => {
    try {
      useGLTF.preload(modelPath);
    } catch (error) {
      console.error("Erro ao precarregar modelo:", error);
    }
    
    // Limpeza ao desmontar
    return () => {
      // Nenhuma ação necessária para limpeza
    };
  }, [modelPath]);

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 5, 15], fov: 45 }}
      shadows={true}
      gl={{ 
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.5
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.5;
      }}
    >
      {/* Iluminação mais uniforme e brilhante, similar ao Google Model Viewer */}
      <ambientLight intensity={3.5} />
      <hemisphereLight intensity={2.5} color="#ffffff" groundColor="#e0e0ff" />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.0} 
        castShadow={false} 
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.7} 
        castShadow={false} 
      />
      
      <SoftShadows size={25} samples={16} focus={0.5} />
      
      <ErrorBoundary onError={onError}>
        <Model 
          modelPath={modelPath} 
          scale={scale} 
          position={position} 
          onError={onError}
        />
      </ErrorBoundary>
      
      <OrbitControls 
        ref={controlsRef} 
        autoRotate={autoRotate} 
        autoRotateSpeed={1.5} 
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
      />
      
      <Environment preset="city" background={false} />
    </Canvas>
  );
} 