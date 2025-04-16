  "use client";

  import { useState, useEffect, useRef, useCallback, MouseEvent as ReactMouseEvent } from "react";
  import Image from "next/image";
  import { motion, AnimatePresence } from "framer-motion";
  import { ChevronLeftIcon, ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline";
  import ModelViewer3D from "./ModelViewer3D";
  import { usePathname } from "next/navigation";

  interface Machine {
    id: number;
    name: string;
    image: string;
    baseModel: string;
    modelPath?: string;
    modelPaths?: Record<string, string>;
  }

  type ColorVariant = "Breeze" | "Midnight" | "Leaf" | "Terracotta" | "Violet";

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const machines: Machine[] = [
    { 
      id: 1, 
      name: "ILUMAi BREEZE", 
      image: "/IQOSILUMAV2/IMG/ILUMAi/ILUMAi_BREEZE.png", 
      baseModel: "ILUMAi", 
      modelPath: `${basePath}/3DMODELS/ILUMAi/ILUMAi_BREEZE.glb` 
    },
    { 
      id: 2, 
      name: "ILUMAi ONE", 
      image: "/IQOSILUMAV2/IMG/ILUMAi-ONE/ILUMAi-ONE_BREEZE.png", 
      baseModel: "ILUMAi-ONE",
      modelPath: `${basePath}/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-BREEZE.glb`,
      modelPaths: {
        Breeze: `${basePath}/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-BREEZE.glb`,
        Midnight: `${basePath}/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-MIDNIGHT.glb`,
        Leaf: `${basePath}/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-LEAF.glb`,
        Terracotta: `${basePath}/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-TERRACOTA.glb`,
        Violet: `${basePath}/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-VIOLET.glb`
      }
    },
    { 
      id: 3, 
      name: "ILUMAi PRIME", 
      image: "/IQOSILUMAV2/IMG/ILUMAi-PRIME/ILUMAi-PRIME_BREEZE.png", 
      baseModel: "ILUMAi-PRIME" 
    },
  ];

  export default function Carousel() {
    const pathname = usePathname();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<ColorVariant>("Breeze");
    const [showModel, setShowModel] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragDistance, setDragDistance] = useState(0);
    const [lastDragTime, setLastDragTime] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePrevious = () => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? machines.length - 1 : prevIndex - 1));
      setShowModel(false);
      setIsModelLoading(true);
    };

    const handleNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex === machines.length - 1 ? 0 : prevIndex + 1));
      setShowModel(false);
      setIsModelLoading(true);
    };

    const handleDragStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      setIsDragging(true);
      setLastDragTime(Date.now());
      
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      
      setDragStart({ x: clientX, y: clientY });
      setDragDistance(0);
    };

    const handleDragMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const distance = clientX - dragStart.x;
      setDragDistance(distance);
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      
      const dragTime = Date.now() - lastDragTime;
      const dragSpeed = Math.abs(dragDistance) / dragTime;
      const threshold = dragSpeed > 0.5 ? 50 : 100;
      
      if (Math.abs(dragDistance) > threshold) {
        if (dragDistance > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
      
      setIsDragging(false);
      setDragDistance(0);
    };

    const handleModelLoad = () => {
      console.log('Modelo 3D carregado com sucesso');
      setIsModelLoading(false);
    };

    const handleModelError = () => {
      console.error('Erro ao carregar o modelo 3D');
      setShowModel(false);
      setIsModelLoading(false);
    };

    const toggleView = () => {
      setShowModel(!showModel);
      if (!showModel) {
        setIsModelLoading(true);
      }
    };

    const currentMachine = machines[currentIndex];
    const modelPath = currentMachine.modelPaths?.[selectedVariant] || currentMachine.modelPath;

    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <button
          onClick={handlePrevious}
          className="absolute left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
          aria-label="Previous machine"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, x: dragDistance }}
              animate={{ opacity: 1, x: isDragging ? dragDistance : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showModel && modelPath ? (
                <div className="relative w-full h-full">
                  {isModelLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  <ModelViewer3D
                    modelPath={modelPath}
                    scale={3}
                    position={[0, -1, 0]}
                    autoRotate={true}
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                  />
                </div>
              ) : (
                <Image
                  src={currentMachine.image}
                  alt={currentMachine.name}
                  width={800}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  priority
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
          aria-label="Next machine"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        <button
          onClick={toggleView}
          className="absolute bottom-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
          aria-label="Toggle 3D view"
        >
          <CubeIcon className="w-6 h-6" />
        </button>

        {currentMachine.modelPaths && (
          <div className="absolute bottom-20 z-10 flex gap-2">
            {Object.keys(currentMachine.modelPaths).map((variant) => (
              <button
                key={variant}
                onClick={() => setSelectedVariant(variant as ColorVariant)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedVariant === variant ? 'border-white' : 'border-transparent'
                } transition-colors`}
                style={{
                  backgroundColor: `var(--${variant.toLowerCase()})`,
                }}
                aria-label={`Select ${variant} variant`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }