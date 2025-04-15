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
  onLoad?: () => void;
}

function Model({ modelPath, scale = 3, position = [0, 0, 0], onError, onLoad }: ModelViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  console.log('ModelViewer3D está a tentar carregar:', modelPath);
  
  // Hooks devem estar no topo do componente, não dentro de condicionais
  const gltf = useGLTF(modelPath);
  
  // useEffect para detetar quando o modelo está carregado
  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('Modelo 3D carregado com sucesso:', modelPath);
      setIsLoaded(true);
      if (onLoad && !isLoaded) {
        console.log('Chamando onLoad callback');
        onLoad();
      }
    }
  }, [gltf, modelPath, onLoad, isLoaded]);

  // Tratar erros após os Hooks
  let scene;
  try {
    scene = gltf.scene;
  } catch (error) {
    console.error('Erro ao acessar gltf.scene:', error);
    if (!hasError) {
      setHasError(true);
      if (onError) {
        console.log('Chamando onError devido a falha no acesso à scene');
        onError();
      }
    }
    return null;
  }
  
  if (!scene) {
    console.error('Scene é null ou undefined para o modelo:', modelPath);
    if (!hasError) {
      setHasError(true);
      if (onError) {
        console.log('Chamando onError porque scene é null');
        onError();
      }
    }
    return null;
  }
  
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

export default function ModelViewer3D({ modelPath, scale = 3, position = [0, 0, 0], autoRotate = false, onError, onLoad }: ModelViewerProps) {
  const controlsRef = useRef(null);
  
  console.log('ModelViewer3D inicializado com modelPath:', modelPath);

  // Precarregar o modelo
  useEffect(() => {
    try {
      console.log('Tentando precarregar o modelo:', modelPath);
      useGLTF.preload(modelPath);
      console.log('Modelo precarregado com sucesso');
    } catch (error) {
      console.error("Erro ao precarregar modelo:", error);
    }
    
    // Limpeza ao desmontar
    return () => {
      // Nenhuma ação necessária para limpeza
    };
  }, [modelPath]);

  const handleModelError = () => {
    console.error("Erro capturado pelo ModelViewer3D:", modelPath);
    if (onError) onError();
  };

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
      
      <ErrorBoundary onError={handleModelError}>
        <Model 
          modelPath={modelPath} 
          scale={scale} 
          position={position} 
          onError={handleModelError}
          onLoad={onLoad}
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