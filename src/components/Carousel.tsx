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

  const pathname = usePathname();
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