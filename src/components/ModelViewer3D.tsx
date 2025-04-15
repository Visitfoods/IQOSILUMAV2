"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
  onError?: () => void;
}

function Model({ modelPath, scale = 1, position = [0, 0, 0], onError }: ModelViewerProps) {
  // Hook sempre chamado incondicionalmente
  const { scene } = useGLTF(modelPath, undefined, 
    (error) => {
      console.error("Erro ao carregar modelo:", error);
      if (onError) onError();
    }
  );
  
  if (!scene) return null;
  
  return (
    <primitive 
      object={scene} 
      scale={scale} 
      position={position} 
    />
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

export default function ModelViewer3D({ modelPath, scale = 1, position = [0, 0, 0], autoRotate = false, onError }: ModelViewerProps) {
  const controlsRef = useRef(null);

  useEffect(() => {
    // Descarregar o modelo quando o componente for desmontado
    return () => {
      if (modelPath) {
        useGLTF.preload(modelPath);
      }
    };
  }, [modelPath]);

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10], fov: 50 }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
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
    </Canvas>
  );
} 