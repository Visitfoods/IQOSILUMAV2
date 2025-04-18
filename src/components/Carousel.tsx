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

  const machines: Machine[] = [
    { 
      id: 1, 
      name: "ILUMAi BREEZE", 
      image: "/IQOSILUMAV2/IMG/ILUMAi/ILUMAi_BREEZE.png", 
      baseModel: "ILUMAi", 
      modelPath: "/IQOSILUMAV2/3DMODELS/ILUMAi/ILUMAi_BREEZE.glb" 
    },
    { 
      id: 2, 
      name: "ILUMAi ONE", 
      image: "/IQOSILUMAV2/IMG/ILUMAi-ONE/ILUMAi-ONE_BREEZE.png", 
      baseModel: "ILUMAi-ONE",
      modelPath: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-BREEZE.glb",
      modelPaths: {
        Breeze: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-BREEZE.glb",
        Midnight: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-MIDNIGHT.glb",
        Leaf: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-LEAF.glb",
        Terracotta: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-TERRACOTA.glb",
        Violet: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-VIOLET.glb"
      }
    },
    { 
      id: 3, 
      name: "ILUMAi PRIME", 
      image: "/IQOSILUMAV2/IMG/ILUMAi-PRIME/ILUMAi-PRIME_BREEZE.png", 
      baseModel: "ILUMAi-PRIME",
      modelPath: "/IQOSILUMAV2/3DMODELS/ILUMAi-ONE/ILUMAi-ONE-BREEZE.glb" 
    },
  ];

  const colorConfig = [
    { color: "#3A3D4A", variant: "Midnight", label: "Midnight" },
    { color: "#95C4C7", variant: "Breeze", label: "Breeze" },
    { color: "#8F993D", variant: "Leaf", label: "Leaf" },
    { color: "#AA4C3A", variant: "Terracotta", label: "Terracotta" },
    { color: "#8690CA", variant: "Violet", label: "Violet", availableFor: ["ILUMAi", "ILUMAi-ONE"] },
  ];

  export default function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(1);
    const [direction, setDirection] = useState<"left" | "right" | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [viewMode, setViewMode] = useState<"carousel" | "detail">("carousel");
    const [selectedColor, setSelectedColor] = useState<ColorVariant>("Breeze");
    const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
    const [showModel3D, setShowModel3D] = useState(true);
    const [modelLoadError, setModelLoadError] = useState(false);
    const [activePopup, setActivePopup] = useState<string | null>(null);
    const [activeIconRef, setActiveIconRef] = useState<HTMLDivElement | null>(null);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
    const iconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const pathname = usePathname();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // Estilos globais para a animação do efeito "snake" e loading
    useEffect(() => {
      // Adicionar estilos de animação
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes snake {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 1000;
          }
        }
        @keyframes loading {
          0% {
            width: 0%;
            left: 0;
          }
          50% {
            width: 100%;
            left: 0;
          }
          100% {
            width: 0%;
            left: 100%;
          }
        }
      `;
      document.head.appendChild(style);

      // Limpar o estilo ao desmontar
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    // Criar refs callbacks para cada ícone
    const setIconRef = useCallback((name: string) => (node: HTMLDivElement | null) => {
      iconRefs.current[name] = node;
    }, []);

    useEffect(() => {
      setIsMounted(true);
      
      // Inicia a animação automática após a montagem
      if (!initialAnimationComplete) {
        let currentRotation = 0;
        const interval = setInterval(() => {
          if (currentRotation < machines.length) {
            setDirection("right");
            setCurrentIndex((prev) => (prev + 1) % machines.length);
            currentRotation++;
          } else {
            clearInterval(interval);
            setInitialAnimationComplete(true);
          }
        }, 1000); // Intervalo de 1 segundo entre cada transição

        return () => clearInterval(interval);
      }
    }, [initialAnimationComplete]);

    // Função para formatar o nome do modelo de forma consistente
    const formatModelName = (baseModel: string) => {
      // Substitui ILUMAi por ILUMA i no título
      return baseModel.replace('ILUMAi', 'ILUMA i').replace('-', ' ');
    };

    const getPositionedMachines = () => {
      const totalMachines = machines.length;
      return machines.map((machine, index) => {
        let position: "left" | "center" | "right";
        
        if (index === currentIndex) {
          position = "center";
        } else if (index === (currentIndex - 1 + totalMachines) % totalMachines) {
          position = "left";
        } else if (index === (currentIndex + 1) % totalMachines) {
          position = "right";
        } else if (index < currentIndex) {
          position = "left";
        } else {
          position = "right";
        }
        
        return { ...machine, position };
      });
    };

    const handleClick = (clickDirection: "left" | "right") => {
      if (isAnimating) return;
      
      setIsAnimating(true);
      setDirection(clickDirection);
      
      const totalMachines = machines.length;
      if (clickDirection === "left") {
        setCurrentIndex((prev) => (prev - 1 + totalMachines) % totalMachines);
      } else {
        setCurrentIndex((prev) => (prev + 1) % totalMachines);
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    };

    const handleDiscover = () => {
      const centerMachine = getPositionedMachines().find(m => m.position === "center");
      if (centerMachine) {
        setSelectedMachine(centerMachine);
        setSelectedColor("Breeze"); // Reset para cor padrão
        setViewMode("detail");
      }
    };

    const handleBack = () => {
      setSelectedMachine(null);
      setViewMode("carousel");
    };

    const handleColorChange = (variant: ColorVariant) => {
      setSelectedColor(variant);
    };

    // Gera o caminho da imagem baseado no modelo e cor selecionada
    const getImagePath = (machine: Machine, colorVariant: ColorVariant) => {
      let colorForPath = colorVariant.toUpperCase();
      if (colorVariant === "Terracotta") {
        colorForPath = "TERRACOTA";
      } else if (colorVariant === "Violet") {
        colorForPath = "-VIOLET";
      }
      return `/IQOSILUMAV2/IMG/${machine.baseModel}/${machine.baseModel}_${colorForPath}.png`;
    };

    const getColorStyle = (colorVariant: ColorVariant, machine: Machine) => {
      if (machine.baseModel === "ILUMAi-PRIME") {
        switch (colorVariant) {
          case "Midnight":
            return "bg-[#131d2b]";
          case "Breeze":
            return "bg-[#82aaae]";
          case "Leaf":
            return "bg-[#0f2e27]";
          case "Terracotta":
            return "bg-[#2d1e27]";
          case "Violet":
            return "bg-[#898FC8]";
          default:
            return "";
        }
      } else {
        // Cores originais para outros modelos
        switch (colorVariant) {
          case "Midnight":
            return "bg-[#1E1E1E]";
          case "Breeze":
            return "bg-[#4A919E]";
          case "Leaf":
            return "bg-[#8a8e28]";
          case "Terracotta":
            return "bg-[#A75D5D]";
          case "Violet":
            return "bg-[#898FC8]";
          default:
            return "";
        }
      }
    };

    const variants = {
      enter: (direction: "left" | "right") => ({
        x: direction === "right" ? "100%" : "-100%",
        opacity: 0,
        scale: 0.8,
        filter: "blur(4px)",
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.3 },
          scale: { duration: 0.5 },
          filter: { duration: 0.5 }
        }
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 10,
        filter: "blur(0px)",
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          filter: { duration: 0.5 }
        }
      },
      left: {
        x: "-35%",
        opacity: 0.6,
        scale: 0.85,
        zIndex: 5,
        filter: "blur(2px)",
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          filter: { duration: 0.5 }
        }
      },
      right: {
        x: "35%",
        opacity: 0.6,
        scale: 0.85,
        zIndex: 5,
        filter: "blur(2px)",
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          filter: { duration: 0.5 }
        }
      },
      exit: (direction: "left" | "right") => ({
        x: direction === "right" ? "-100%" : "100%",
        opacity: 0,
        scale: 0.8,
        filter: "blur(4px)",
        transition: {
          x: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.3 },
          scale: { duration: 0.5 },
          filter: { duration: 0.5 }
        }
      })
    };

    const positionedMachines = getPositionedMachines();

    // Função para obter o caminho do modelo 3D
    const getModelPath = (machine: Machine, colorVariant?: ColorVariant) => {
      if (!machine) {
        console.error('getModelPath: machine é null ou undefined');
        return null;
      }

      let modelPath = '';
      if (machine.baseModel === "ILUMAi-ONE") {
        modelPath = machine.modelPaths?.[colorVariant || selectedColor] || machine.modelPath || '';
      } else {
        modelPath = machine.modelPath || '';
      }

      // Se não houver modelPath, retorna null
      if (!modelPath) {
        console.error('getModelPath: modelPath é vazio para', machine.baseModel, colorVariant || selectedColor);
        return null;
      }

      // Certificar-se de que o caminho começa com o prefixo correto
      if (!modelPath.startsWith('/IQOSILUMAV2') && modelPath.startsWith('/')) {
        modelPath = `/IQOSILUMAV2${modelPath}`;
      }

      // Verificar se o caminho é válido
      console.log("Caminho final do modelo 3D:", modelPath);
      
      return modelPath;
    };

    // Manipulador de erro para o carregamento de modelos 3D
    const handleModelLoadError = () => {
      console.error("Erro global ao carregar modelo 3D");
      setModelLoadError(true);
    };

    // Reset do erro ao mudar de cor ou modelo
    useEffect(() => {
      setModelLoadError(false);
    }, [selectedColor, selectedMachine]);

    // Alternar entre imagem 2D e modelo 3D
    const toggleModelView = () => {
      setShowModel3D(prev => !prev);
    };

    // Garantir que ao trocar de cor, o modelo 3D permanece visível se essa for a preferência
    useEffect(() => {
      // Preservar showModel3D ao trocar de cor
    }, [selectedColor]);

    // Função para lidar com cliques nos ícones
    const handleIconClick = (iconName: string, event: ReactMouseEvent) => {
      event.stopPropagation(); // Evita propagação do clique
      
      // Se já estiver aberto, fecha apenas
      if (activePopup === iconName) {
        setActivePopup(null);
        setActiveIconRef(null);
        return;
      }
      
      // Guarda a referência do ícone clicado
      const iconRef = iconRefs.current[iconName];
      setActiveIconRef(iconRef);
      
      // Efeito de paralaxe - primeiro fecha o popup atual, depois abre o novo
      if (activePopup) {
        setActivePopup(null);
        setActiveIconRef(null);
        setTimeout(() => {
          setActivePopup(iconName);
        }, 300);
      } else {
        setActivePopup(iconName);
      }
    };

    // Fechar popup quando clicar fora dele ou do ícone ativo
    useEffect(() => {
      const handleClickOutside = (event: Event) => {
        if (activePopup) {
          const popup = document.getElementById('popup-container');
          const isClickInsidePopup = popup && popup.contains(event.target as Node);
          const isClickInsideIcon = activeIconRef && activeIconRef.contains(event.target as Node);
          
          if (!isClickInsidePopup && !isClickInsideIcon) {
            setActivePopup(null);
            setActiveIconRef(null);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [activePopup, activeIconRef]);
    
    // Definir os ícones disponíveis
    const getAvailableIcons = (baseModel: string) => {
      return baseModel === "ILUMAi-ONE" 
        ? ["FlexPuffONE", "InicioAutomatico"] 
        : ["FlexPuff", "FlexBattery", "ModoPausa", "EcraTatil"];
    };

    // Obter informações dos ícones
    const getIconInfo = (iconName: string) => {
      switch (iconName) {
        case "FlexPuff":
        case "FlexPuffONE":
          return { src: "/IQOSILUMAV2/Icons/FlexPuff.svg", label: "Flex Puff" };
        case "FlexBattery":
          return { src: "/IQOSILUMAV2/Icons/FlexBattery.svg", label: "Flex Battery" };
        case "ModoPausa":
          return { src: "/IQOSILUMAV2/Icons/Modo Pausa.svg", label: "Modo Pausa" };
        case "EcraTatil":
          return { src: "/IQOSILUMAV2/Icons/EcraTatil.svg", label: "Ecrã Tátil" };
        case "InicioAutomatico":
          return { src: "/IQOSILUMAV2/Icons/InicioAutomatico.svg", label: "Início Automático" };
        default:
          return { src: "", label: "" };
      }
    };

    // Função para navegar entre popups
    const navigateToNextIcon = (direction: "left" | "right") => {
      const availableIcons = selectedMachine ? getAvailableIcons(selectedMachine.baseModel) : [];
      const totalIcons = availableIcons.length;
      const currentIndex = availableIcons.findIndex(icon => icon === activePopup);
      const newIndex = direction === "right"
        ? (currentIndex + 1) % totalIcons
        : (currentIndex - 1 + totalIcons) % totalIcons;

      setSwipeDirection(direction);
      setActivePopup(availableIcons[newIndex]);
      setActiveIconRef(iconRefs.current[availableIcons[newIndex]]);
    };

    // Componente GlobalPopup para renderizar o popup fora dos containers dos ícones
    const GlobalPopup = () => {
      // Estados para controlar a posição e animação fluida
      const [currentOffset, setCurrentOffset] = useState(0);
      const [isDragging, setIsDragging] = useState(false);
      
      // Não renderizar nada se não houver popup ativo
      if (!activePopup || !activeIconRef) return null;
      
      // Definir todos os ícones disponíveis para o carrossel
      const availableIcons = selectedMachine ? getAvailableIcons(selectedMachine.baseModel) : [];
      const activeIndex = availableIcons.findIndex(icon => icon === activePopup);
      
      // Configurações para a animação contínua
      const cardWidth = 300; // Largura base do cartão em pixels
      const swipeThreshold = 100; // Limiar para completar um swipe
      const totalCards = availableIcons.length;
      
      // Obter informações dos popups
      const getPopupContent = (iconName: string) => {
        let title = '';
        let content: React.ReactNode = null;
        let iconSrc = '';
        
        switch (iconName) {
          case "FlexPuff":
          case "FlexPuffONE":
            title = "Flex Puff";
            iconSrc = "/IQOSILUMAV2/Icons/FlexPuff.svg";
            content = <p>A funcionalidade Flexpuff adapta-se de forma inteligente ao ritmo de utilização, podendo permitir até 4 aspirações extra, para uma experiência de utilização máxima de até 6 minutos*.</p>;
            break;
          case "FlexBattery":
            title = "Flex Battery";
            iconSrc = "/IQOSILUMAV2/Icons/FlexBattery.svg";
            content = (
              <>
                <p>Já é possível adaptar a bateria do seu dispositivo com o FlexBattery:</p>
                <p className="mt-2"><span className="font-bold">Modo Eco</span><br/>Permite prolongar o tempo de vida útil da bateria do equipamento até um ano**;</p>
                <p className="mt-2">ou</p>
                <p className="mt-2"><span className="font-bold">Modo Desempenho</span><br/>Até 3 utilizações consecutivas**</p>
              </>
            );
            break;
          case "ModoPausa":
            title = "Modo Pausa";
            iconSrc = "/IQOSILUMAV2/Icons/Modo Pausa.svg";
            content = (
              <>
                <p>Já é possível interromper e recomeçar a utilização até 8 minutos, sem que o SMARTCORE STICK™ fique inutilizado, com o novo Modo Pausa.</p>
                <p className="mt-2 text-white/70 italic">Apenas disponível no Modo Desempenho</p>
              </>
            );
            break;
          case "EcraTatil":
            title = "Ecrã Tátil";
            iconSrc = "/IQOSILUMAV2/Icons/EcraTatil.svg";
            content = <p>O novo Ecrã Tátil permite acompanhar todas as informações relativas ao estado do dispositivo e personalizar a sua utilização.</p>;
            break;
          case "InicioAutomatico":
            title = "Início Automático";
            iconSrc = "/IQOSILUMAV2/Icons/InicioAutomatico.svg";
            content = <p>O ILUMAi ONE permite iniciar a utilização automaticamente ao inspirar, sem necessidade de premir botões.</p>;
            break;
          default:
            return { title: '', content: null, iconSrc: '' };
        }
        
        return { title, content, iconSrc };
      };

      // Lidar com o fim do arrasto
      const handleDragEnd = (e: any, info: any) => {
        setIsDragging(false);
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        
        // Mudar card se o swipe foi rápido OU se passou do threshold
        const shouldSwipe = Math.abs(velocity) > 500 || Math.abs(offset) > swipeThreshold;
        
        if (shouldSwipe) {
          const direction = offset > 0 ? "prev" : "next";
          const newIndex = direction === "prev" 
            ? (activeIndex - 1 + totalCards) % totalCards
            : (activeIndex + 1) % totalCards;

          // Atualizar o card ativo
          const newActiveIcon = availableIcons[newIndex];
          setActivePopup(newActiveIcon);
          setActiveIconRef(iconRefs.current[newActiveIcon]);
          setCurrentOffset(0);
        } else {
          // Retornar ao centro se o swipe não foi suficiente
          setCurrentOffset(0);
        }
      };

      // Navegar para o popup anterior
      const navigatePrev = () => {
        if (isDragging) return;
        
        const newIndex = (activeIndex - 1 + totalCards) % totalCards;
        const newActiveIcon = availableIcons[newIndex];
        setActivePopup(newActiveIcon);
        setActiveIconRef(iconRefs.current[newActiveIcon]);
        setCurrentOffset(0);
      };

      // Navegar para o próximo popup
      const navigateNext = () => {
        if (isDragging) return;
        
        const newIndex = (activeIndex + 1) % totalCards;
        const newActiveIcon = availableIcons[newIndex];
        setActivePopup(newActiveIcon);
        setActiveIconRef(iconRefs.current[newActiveIcon]);
        setCurrentOffset(0);
      };
      
      // Renderizar o conteúdo de um popup
      const renderPopupContent = (iconName: string, isCurrent: boolean) => {
        const { title, content, iconSrc } = getPopupContent(iconName);
        
        return (
          <div className="w-full bg-gradient-to-br from-[#2D8F9B] to-[#045557] border-2 border-[#3CABB8]/60 rounded-xl backdrop-blur-xl p-6 shadow-2xl">
            <div className="relative">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#1A6A72]/60 backdrop-blur-md p-2 ring-2 ring-[#5CD9E8]/60">
                  <Image
                    src={iconSrc}
                    alt={title}
                    width={48}
                    height={48}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-iqos font-bold text-white">
                  {title}
                </h3>
              </div>
              
              {isCurrent && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopup(null);
                    setActiveIconRef(null);
                  }}
                  className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#1A6A72]/60 backdrop-blur-md hover:bg-[#1A6A72] transition-colors border border-[#5CD9E8]/30"
                  aria-label="Fechar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              <div className="text-sm sm:text-base text-white font-iqos leading-relaxed bg-[#1A6A72]/20 backdrop-blur-sm p-4 rounded-lg border border-[#5CD9E8]/20">
                {content}
              </div>
              
              {isCurrent && (
                <svg 
                  className="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] z-[-1]"
                  viewBox="0 0 1000 1000" 
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5CD9E8" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#5CD9E8" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <rect
                    x="2"
                    y="2"
                    width="996"
                    height="996"
                    fill="none"
                    stroke="url(#snakeGradient)"
                    strokeWidth="4"
                    strokeDasharray="1000"
                    strokeLinecap="round"
                    rx="16"
                    ry="16"
                    filter="url(#glow)"
                    style={{
                      animation: 'snake 8s linear infinite'
                    }}
                  />
                </svg>
              )}
            </div>
          </div>
        );
      };
      
      // Gerar cards para o carrossel
      const renderCards = () => {
        return availableIcons.map((iconName, index) => {
          // Calcular a posição relativa ao card ativo
          let positionOffset = index - activeIndex;
          if (positionOffset > totalCards / 2) {
            positionOffset -= totalCards;
          } else if (positionOffset < -totalCards / 2) {
            positionOffset += totalCards;
          }
          
          // Calcular posição com base no offset atual
          const xPosition = positionOffset * cardWidth + (isDragging ? currentOffset : 0);
          const isCurrent = index === activeIndex;
          const distance = Math.abs(xPosition);
          
          return (
            <motion.div
              key={`popup-card-${iconName}-${activeIndex}`}
              className="absolute"
              layout="position"
              style={{
                x: xPosition,
                scale: isCurrent ? 1 : Math.max(0.8, 1 - (distance / cardWidth * 0.15)),
                opacity: isCurrent ? 1 : Math.max(0.7, 1 - (distance / cardWidth * 0.2)),
                filter: `blur(${isCurrent ? 0 : Math.min(3, distance / cardWidth * 1.5)}px)`,
                zIndex: isCurrent ? 100 : 100 - Math.abs(positionOffset) * 10,
                pointerEvents: isCurrent ? 'auto' : 'none',
              }}
              animate={{
                x: xPosition,
                scale: isCurrent ? 1 : Math.max(0.8, 1 - (distance / cardWidth * 0.15)),
                opacity: isCurrent ? 1 : Math.max(0.7, 1 - (distance / cardWidth * 0.2)),
                filter: `blur(${isCurrent ? 0 : Math.min(3, distance / cardWidth * 1.5)}px)`,
                zIndex: isCurrent ? 100 : 100 - Math.abs(positionOffset) * 10,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 25,
                mass: 0.5,
                bounce: 0.2,
                restDelta: 0.001,
                restSpeed: 0.001,
                duration: 0.6
              }}
              drag={isCurrent ? "x" : false}
              dragConstraints={{ left: -cardWidth, right: cardWidth }}
              dragElastic={0.1}
              dragTransition={{ 
                bounceStiffness: 300,
                bounceDamping: 20
              }}
              dragSnapToOrigin={false}
              onDragStart={() => setIsDragging(true)}
              onDrag={(e, info) => {
                if (isCurrent) {
                  setCurrentOffset(info.offset.x);
                }
              }}
              onDragEnd={handleDragEnd}
            >
              <div className="w-[300px] sm:w-[350px] md:w-[400px]">
                {renderPopupContent(iconName, isCurrent)}
              </div>
            </motion.div>
          );
        });
      };
      
      return (
        <>
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setActivePopup(null);
              setActiveIconRef(null);
            }}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[150]" onClick={(e) => e.stopPropagation()}>
            <div id="popup-container" className="relative w-full max-w-5xl">
              <div className="relative w-full h-[70vh] sm:h-[60vh] md:h-[50vh] flex items-center justify-center">
                <motion.div
                  className="relative flex justify-center items-center w-full h-full"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                >
                  {renderCards()}
                </motion.div>

                {/* Áreas para cliques de navegação */}
                <button 
                  className="absolute left-0 top-0 bottom-0 w-1/4 h-full z-[15] bg-transparent focus:outline-none"
                  onClick={navigatePrev}
                  aria-label="Popup anterior"
                />
                
                <button 
                  className="absolute right-0 top-0 bottom-0 w-1/4 h-full z-[15] bg-transparent focus:outline-none"
                  onClick={navigateNext}
                  aria-label="Próximo popup"
                />

                {/* Setas de navegação */}
                <div className="absolute w-full flex justify-between px-4 sm:px-8 md:px-12 pointer-events-none">
                  <button
                    onClick={navigatePrev}
                    className="text-white p-2 hover:text-gray-300 transition-colors pointer-events-auto"
                    aria-label="Anterior"
                  >
                    <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </button>
                  <button
                    onClick={navigateNext}
                    className="text-white p-2 hover:text-gray-300 transition-colors pointer-events-auto"
                    aria-label="Próximo"
                  >
                    <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </button>
                </div>
              </div>

              {/* Carrossel de ícones (miniaturas) */}
              <div className="absolute left-0 right-0 bottom-[-3rem] sm:bottom-[-4rem] md:bottom-[-5rem] flex justify-center items-center gap-4 sm:gap-6 md:gap-8">
                {availableIcons.map((iconName, index) => {
                  const isActive = iconName === activePopup;
                  const { src, label } = getIconInfo(iconName);
                  return (
                    <motion.button
                      key={iconName}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopup(iconName);
                        setActiveIconRef(iconRefs.current[iconName]);
                        setCurrentOffset(0);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex flex-col items-center ${isActive ? 'scale-110' : 'opacity-70'}`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-[#1A6A72] ring-2 ring-[#5CD9E8]' : 'bg-[#1A6A72]/50'} backdrop-blur-md p-1`}>
                        <Image
                          src={src}
                          alt={label}
                          width={24}
                          height={24}
                          className="w-5 h-5 sm:w-6 sm:h-6 brightness-0 invert"
                        />
                      </div>
                      <span className={`text-[10px] sm:text-xs text-white mt-1 ${isActive ? 'font-bold' : 'font-normal opacity-70'}`}>
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      );
    };

    // Componente de visualização do dispositivo que alterna entre imagem e modelo 3D com fallback
    const DeviceViewer = ({ machine, colorVariant }: { machine: Machine, colorVariant: ColorVariant }) => {
      const [isLoading, setIsLoading] = useState(true);
      const [localModelError, setLocalModelError] = useState(false);
      
      // Mostrar modelo 3D sempre, independente do modelo, só mostrar imagem se houver erro
      const shouldShow3D = !modelLoadError && !localModelError && machine.modelPath !== undefined;
      
      // Resetar isLoading e localModelError sempre que mudar de cor ou máquina
      useEffect(() => {
        setIsLoading(true);
        setLocalModelError(false);
      }, [machine, colorVariant]);

      const handleModelLoadSuccess = () => {
        console.log("Modelo carregado com sucesso:", getModelPath(machine, colorVariant));
        setIsLoading(false);
      };
      
      const handleModelLoadError = () => {
        console.error("Erro ao carregar modelo para:", machine.baseModel, colorVariant);
        setLocalModelError(true);
        setModelLoadError(true);
      };

      // Componente de loading com animação atrativa
      const LoadingSpinner = () => (
        <div className="w-[300px] h-[450px] sm:w-[350px] sm:h-[500px] md:w-[400px] md:h-[550px] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-teal-400 mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-teal-400/30 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg mb-1">A carregar modelo 3D</p>
            <p className="text-white/70 text-sm">Por favor aguarde...</p>
          </div>
          <div className="mt-3 w-40 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-400 to-blue-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      );

      return (
        <div className="relative flex items-center justify-center">
          {shouldShow3D ? (
            <>
              {isLoading && <LoadingSpinner />}
              <div className={`w-[400px] h-[500px] sm:w-[450px] sm:h-[550px] md:w-[500px] md:h-[600px] ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                <ModelViewer3D 
                  modelPath={getModelPath(machine, colorVariant) || ""}
                  scale={30}
                  position={[0, -20, 0]}
                  autoRotate={true}
                  onError={handleModelLoadError}
                  onLoad={handleModelLoadSuccess}
                />
              </div>
            </>
          ) : (
            <Image
              src={getImagePath(machine, colorVariant)}
              alt={machine.name}
              width={400}
              height={400}
              className="w-32 sm:w-45 md:w-50 h-auto object-contain"
              priority
            />
          )}
        </div>
      );
    };

    if (!isMounted) {
      return null;
    }

    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Renderizar o popup globalmente, fora dos containers dos ícones */}
        <AnimatePresence>
          {activePopup && <GlobalPopup />}
        </AnimatePresence>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-[1400px] h-full md:h-[80vh] px-4">
            {viewMode === "carousel" ? (
              <motion.div 
                key="carousel"
                className="relative w-full h-full"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative w-[85%] h-[85%] flex items-center justify-center -mt-20 sm:-mt-24 md:-mt-28">
                    <motion.div 
                      className="absolute inset-0 bottom-[20%] z-[5]"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset, velocity }) => {
                        if (isAnimating) return;
                        
                        const swipe = offset.x;
                        
                        if (Math.abs(swipe) > 50) {
                          if (swipe < 0) {
                            handleClick("right");
                          } else {
                            handleClick("left");
                          }
                        }
                      }}
                    />
                    
                    <button 
                      className="absolute left-0 top-0 bottom-[20%] w-1/3 h-auto z-[15] bg-transparent focus:outline-none"
                      onClick={() => !isAnimating && handleClick("left")}
                      disabled={isAnimating}
                      aria-label="Imagem anterior"
                    />
                    
                    <button 
                      className="absolute right-0 top-0 bottom-[20%] w-1/3 h-auto z-[15] bg-transparent focus:outline-none"
                      onClick={() => !isAnimating && handleClick("right")}
                      disabled={isAnimating}
                      aria-label="Próxima imagem"
                    />

                    <AnimatePresence mode="sync" initial={false} custom={direction}>
                      {positionedMachines.map((machine) => (
                        <motion.div
                          key={machine.id}
                          className="absolute inset-0 flex items-center justify-center"
                          custom={direction}
                          initial="enter"
                          animate={machine.position}
                          exit="exit"
                          variants={variants}
                          style={{ 
                            zIndex: machine.position === "center" ? 10 : 1,
                            pointerEvents: machine.position === "center" ? "auto" : "none"
                          }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.2}
                          onDragEnd={(e, { offset, velocity }) => {
                            if (isAnimating) return;
                            
                            const swipe = offset.x;
                            
                            if (Math.abs(swipe) > 50) {
                              if (swipe < 0) {
                                handleClick("right");
                              } else {
                                handleClick("left");
                              }
                            }
                          }}
                        >
                          {machine.position === "center" && (
                            <motion.div 
                              className="flex flex-col items-center justify-center w-full h-full"
                              initial={{ scale: 0.95, opacity: 0.8 }}
                              animate={{ 
                                scale: 1,
                                opacity: 1,
                                transition: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 25
                                }
                              }}
                            >
                              <div className="relative w-[65%] sm:w-[55%] md:w-[45%] aspect-square">
                                <Image
                                  src={machine.image}
                                  alt={machine.name}
                                  width={400}
                                  height={400}
                                  className="object-contain w-full h-full relative z-10"
                                  priority
                                  draggable={false}
                                />
                              </div>
                            </motion.div>
                          )}
                          
                          {machine.position !== "center" && (
                            <motion.div 
                              className="relative w-[45%] sm:w-[35%] md:w-[30%] aspect-square"
                              whileHover={{
                                scale: 1.05,
                                opacity: 0.9,
                                filter: "blur(1px)",
                                transition: { duration: 0.2 }
                              }}
                            >
                              <Image
                                src={machine.image}
                                alt={machine.name}
                                width={400}
                                height={400}
                                className="object-contain w-full h-full"
                                priority
                                draggable={false}
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Setas de navegação */}
                    <div className="absolute w-full flex justify-between px-4 sm:px-8 md:px-12 bottom-[30%] sm:bottom-[32%] md:bottom-[34%]">
                      <button
                        onClick={() => !isAnimating && handleClick("left")}
                        className="text-white p-2 hover:text-gray-300 transition-colors"
                        aria-label="Anterior"
                      >
                        <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                      </button>
                      <button
                        onClick={() => !isAnimating && handleClick("right")}
                        className="text-white p-2 hover:text-gray-300 transition-colors"
                        aria-label="Próximo"
                      >
                        <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                      </button>
                    </div>

                    <div className="absolute bottom-[10%] left-0 right-0 flex justify-center">
                      <button
                        className="bg-white text-black px-8 py-2 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors relative group z-30"
                        onClick={handleDiscover}
                      >
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse scale-[1.3] transition-transform duration-300" />
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-[pulse_2s_ease-in-out_infinite] scale-[1.5] transition-transform duration-300" />
                        <div className="absolute inset-0 bg-white/10 rounded-full animate-[pulse_3s_ease-in-out_infinite] scale-[1.7] transition-transform duration-300" />
                        <span className="relative z-10">Descobre</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="detail"
                className="relative w-full h-full"
              >
                <div className="relative h-screen flex flex-col">
                  {/* Cabeçalho fixo (seta + título) */}
                  <div className="relative flex flex-col items-center justify-center pt-6 sm:pt-8 md:pt-10">
                    <button
                      onClick={handleBack}
                      className="relative text-white p-2 hover:text-gray-300 transition-colors group mb-4 sm:mb-6 md:mb-8"
                      aria-label="Voltar"
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full scale-150 group-hover:scale-[1.7] transition-transform duration-300" />
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full animate-pulse scale-[1.7] group-hover:scale-[1.9] transition-transform duration-300" />
                      <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative z-10" />
                    </button>

                    <h1 className="text-white font-iqos text-2xl sm:text-3xl md:text-4xl">
                      {formatModelName(selectedMachine?.baseModel || "")}
                    </h1>
                  </div>

                  {/* Conteúdo principal centralizado */}
                  <div className="flex-1 flex flex-col items-center justify-start pt-10 sm:pt-12 md:pt-16">
                    {/* Container relativo para o dispositivo e ícones */}
                    <div className="relative flex items-center justify-center w-full px-20 sm:px-32 md:px-40">
                      {selectedMachine?.baseModel === "ILUMAi-ONE" ? (
                        <>
                          {/* Ícone esquerdo para ILUMAi ONE */}
                          <div className="absolute top-[calc(50%-50px)] -translate-y-1/2 left-6 sm:left-12 md:left-16 flex flex-col items-center">
                            <motion.div 
                              ref={setIconRef("FlexPuffONE")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative cursor-pointer ${activePopup === "FlexPuffONE" ? "z-[101]" : ""}`}
                              onClick={(e) => handleIconClick("FlexPuffONE", e)}
                            >
                              <Image
                                src="/IQOSILUMAV2/Icons/FlexPuff.svg"
                                alt="Flex Puff"
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                              />
                              <span className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-iqos text-center">Flex Puff</span>
                            </motion.div>
                          </div>

                          {/* Visualização central do dispositivo */}
                          {selectedMachine && <DeviceViewer machine={selectedMachine} colorVariant={selectedColor} />}

                          {/* Ícone direito para ILUMAi ONE */}
                          <div className="absolute top-[calc(50%-50px)] -translate-y-1/2 right-6 sm:right-12 md:right-16 flex flex-col items-center">
                            <motion.div 
                              ref={setIconRef("InicioAutomatico")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative cursor-pointer ${activePopup === "InicioAutomatico" ? "z-[101]" : ""}`}
                              onClick={(e) => handleIconClick("InicioAutomatico", e)}
                            >
                              <Image
                                src="/IQOSILUMAV2/Icons/InicioAutomatico.svg"
                                alt="Início Automático"
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                              />
                              <span className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-iqos text-center">Início Automático</span>
                            </motion.div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Ícones à esquerda para ILUMAi e ILUMAi PRIME */}
                          <div className="absolute top-[calc(50%-100px)] -translate-y-1/2 left-6 sm:left-12 md:left-16 flex flex-col items-center">
                            <motion.div 
                              ref={setIconRef("FlexPuff")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative cursor-pointer ${activePopup === "FlexPuff" ? "z-[101]" : ""}`}
                              onClick={(e) => handleIconClick("FlexPuff", e)}
                            >
                              <Image
                                src="/IQOSILUMAV2/Icons/FlexPuff.svg"
                                alt="Flex Puff"
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                              />
                              <span className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-iqos text-center">Flex Puff</span>
                            </motion.div>
                          </div>

                          <div className="absolute top-[calc(50%+50px)] -translate-y-1/2 left-6 sm:left-12 md:left-16 flex flex-col items-center">
                            <motion.div 
                              ref={setIconRef("FlexBattery")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative cursor-pointer ${activePopup === "FlexBattery" ? "z-[101]" : ""}`}
                              onClick={(e) => handleIconClick("FlexBattery", e)}
                            >
                              <Image
                                src="/IQOSILUMAV2/Icons/FlexBattery.svg"
                                alt="Flex Battery"
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                              />
                              <span className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-iqos text-center">Flex Battery</span>
                            </motion.div>
                          </div>

                          {/* Visualização central do dispositivo */}
                          {selectedMachine && <DeviceViewer machine={selectedMachine} colorVariant={selectedColor} />}

                          {/* Ícones à direita para ILUMAi e ILUMAi PRIME */}
                          <div className="absolute top-[calc(50%-100px)] -translate-y-1/2 right-6 sm:right-12 md:right-16 flex flex-col items-center">
                            <motion.div 
                              ref={setIconRef("ModoPausa")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative cursor-pointer ${activePopup === "ModoPausa" ? "z-[101]" : ""}`}
                              onClick={(e) => handleIconClick("ModoPausa", e)}
                            >
                              <Image
                                src="/IQOSILUMAV2/Icons/Modo Pausa.svg"
                                alt="Modo Pausa"
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                              />
                              <span className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-iqos text-center">Modo Pausa</span>
                            </motion.div>
                          </div>

                          <div className="absolute top-[calc(50%+50px)] -translate-y-1/2 right-6 sm:right-12 md:right-16 flex flex-col items-center">
                            <motion.div 
                              ref={setIconRef("EcraTatil")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative cursor-pointer ${activePopup === "EcraTatil" ? "z-[101]" : ""}`}
                              onClick={(e) => handleIconClick("EcraTatil", e)}
                            >
                              <Image
                                src="/IQOSILUMAV2/Icons/EcraTatil.svg"
                                alt="Ecrã Tátil"
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 brightness-0 invert"
                              />
                              <span className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-iqos text-center">Ecrã Tátil</span>
                            </motion.div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Cores com efeito de arco em U */}
                    <div className="relative mt-0 sm:mt-2 md:mt-4">
                      <div className="relative flex justify-center items-center">
                        {colorConfig
                          .filter((c) => !c.availableFor || c.availableFor.includes(selectedMachine?.baseModel || ""))
                          .map((colorObj, index, array) => {
                            // Calcular posição no arco
                            const totalItems = array.length;
                            const centerIndex = (totalItems - 1) / 2;
                            const offset = index - centerIndex;
                            
                            // Criar efeito de arco usando uma função quadrática
                            const xSpacing = 60; // Espaçamento horizontal entre as bolas
                            const maxYOffset = 40; // Altura máxima do arco
                            
                            // Função quadrática para criar o arco em forma de U invertido (para cima)
                            const normalizedOffset = offset / centerIndex;
                            const yOffset = -maxYOffset * Math.pow(normalizedOffset, 2);
                            
                            return (
                              <button
                                key={colorObj.color}
                                onClick={() => {
                                  handleColorChange(colorObj.variant as ColorVariant);
                                }}
                                style={{
                                  transform: `translate(${offset * xSpacing}px, ${yOffset}px)`,
                                  transition: 'transform 0.3s ease-out'
                                }}
                                className={`absolute w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full ${getColorStyle(
                                  colorObj.variant as ColorVariant,
                                  selectedMachine!
                                )} ${
                                  selectedColor === colorObj.variant
                                    ? "ring-2 ring-offset-2 ring-white scale-110 z-10"
                                    : "hover:scale-105 transition-transform"
                                }`}
                                aria-label={`Selecionar cor ${colorObj.label}`}
                              />
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Espaço para padding inferior */}
                  <div className="h-8 sm:h-12 md:h-16" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  } 