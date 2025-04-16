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
  
  console.log('ModelViewer3D está a tentar carregar:', modelPath, 'com escala:', scale);
  
  // Hooks devem estar no topo do componente, não dentro de condicionais
  const gltf = useGLTF(modelPath || '/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-BREEZE.glb');
  
  // useEffect para detetar quando o modelo está carregado
  useEffect(() => {
    // Verificar se o modelPath é válido
    if (!modelPath || modelPath === "") {
      console.error('ModelPath é inválido ou vazio');
      if (onError) onError();
      return;
    }
    
    try {
      if (gltf && gltf.scene) {
        console.log('Modelo 3D carregado com sucesso:', modelPath, 'usando escala:', scale);
        
        // Garantir que a escala seja aplicada corretamente
        gltf.scene.scale.set(scale, scale, scale);
        
        setIsLoaded(true);
        if (onLoad && !isLoaded) {
          console.log('Chamando onLoad callback');
          onLoad();
        }
      }
    } catch (error) {
      console.error('Erro no useEffect do ModelViewer3D:', error);
      if (!hasError) {
        setHasError(true);
        if (onError) onError();
      }
    }
  }, [gltf, modelPath, onLoad, isLoaded, hasError, onError, scale]);

  // Tratar erros após os Hooks
  try {
    if (!gltf || !gltf.scene) {
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
    
    console.log('Renderizando modelo com escala:', scale);
    
    // Aplicar escala diretamente na cena também
    gltf.scene.scale.set(scale, scale, scale);
    
    return (
      <Stage
        preset="soft"
        intensity={2.5}
        environment="city"
        shadows={false}
        adjustCamera={false}
      >
        <primitive 
          object={gltf.scene} 
          scale={scale}
          position={position} 
        />
      </Stage>
    );
  } catch (error) {
    console.error('Erro ao renderizar modelo 3D:', error);
    if (!hasError) {
      setHasError(true);
      if (onError) onError();
    }
    return null;
  }
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
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  console.log('ModelViewer3D inicializado com modelPath:', modelPath, 'e escala:', scale);

  // Garantir que onLoad seja chamado ao menos uma vez quando o componente montar
  useEffect(() => {
    setIsComponentMounted(true);
    
    // Verificar se o modelPath é válido
    if (!modelPath || modelPath === "") {
      console.error('ModelPath fornecido ao componente é inválido ou vazio');
      setHasError(true);
      if (onError) onError();
      return;
    }
    
    // Chamar onLoad após 2 segundos como último recurso
    let timer: NodeJS.Timeout;
    if (onLoad) {
      timer = setTimeout(() => {
        console.log('ModelViewer3D: Chamando onLoad por timeout de fallback para:', modelPath);
        onLoad();
      }, 2000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [onLoad, modelPath, onError]);

  // Precarregar o modelo
  useEffect(() => {
    if (!modelPath || modelPath === "") {
      return;
    }
    
    try {
      console.log('Tentando precarregar o modelo:', modelPath);
      useGLTF.preload(modelPath);
      console.log('Modelo precarregado com sucesso');
    } catch (error) {
      console.error("Erro ao precarregar modelo:", error);
      setHasError(true);
      if (onError) onError();
    }
    
    // Limpeza ao desmontar
    return () => {
      // Nenhuma ação necessária para limpeza
    };
  }, [modelPath, onError]);

  const handleModelError = () => {
    console.error("Erro capturado pelo ModelViewer3D:", modelPath);
    setHasError(true);
    if (onError) onError();
  };

  // Se houver erro, não renderizar o canvas
  if (hasError) {
    return null;
  }

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 25], fov: 30 }}
      shadows={true}
      gl={{ 
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.5
      }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.5;
        
        // Ajustar a câmera para mostrar um objeto maior
        camera.position.set(0, 0, 25);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = 30;
          camera.updateProjectionMatrix();
        }
        
        console.log('Canvas criado com sucesso, câmera ajustada, escala do modelo:', scale);
        // Chamar onLoad aqui também como recurso adicional
        if (onLoad && isComponentMounted) {
          console.log('Chamando onLoad após criação do Canvas');
          onLoad();
        }
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
        enableZoom={false}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
      />
      
      <Environment preset="city" background={false} />
    </Canvas>
  );
} 