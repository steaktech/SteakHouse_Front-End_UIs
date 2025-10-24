"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface SteakDrop {
  id: number;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  glowIntensity: number;
}

export default function SteakMatrixAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [drops, setDrops] = useState<SteakDrop[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize drops and handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Create initial drops with enhanced properties
  const createDrop = useCallback((id: number): SteakDrop => ({
    id,
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height - dimensions.height,
    speed: 0.8 + Math.random() * 2.5,
    opacity: 0.2 + Math.random() * 0.3,
    scale: 0.5 + Math.random() * 0.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
    glowIntensity: 0.3 + Math.random() * 0.7,
  }), [dimensions.width, dimensions.height]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Create 8-12 drops with better spacing
    const numDrops = Math.floor(8 + Math.random() * 4);
    const initialDrops: SteakDrop[] = [];
    
    // Create drops with spacing to avoid overlap
    for (let i = 0; i < numDrops; i++) {
      let attempts = 0;
      let newDrop: SteakDrop;
      
      do {
        newDrop = createDrop(i);
        attempts++;
      } while (
        attempts < 20 && 
        initialDrops.some(existingDrop => {
          const distance = Math.sqrt(
            Math.pow(newDrop.x - existingDrop.x, 2) + 
            Math.pow(newDrop.y - existingDrop.y, 2)
          );
          return distance < 120; // Minimum distance between steaks
        })
      );
      
      initialDrops.push(newDrop);
    }
    
    setDrops(initialDrops);
  }, [dimensions, createDrop]);

  // Enhanced animation loop with trail effects
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const animate = () => {
      setDrops((prevDrops) => {
        return prevDrops.map((drop) => {
          let newY = drop.y + drop.speed;
          let newX = drop.x;
          let newRotation = drop.rotation + drop.rotationSpeed;
          
          // Enhanced horizontal drift with wave motion - reduced for less overlap
          newX += Math.sin(newY * 0.008) * 0.8 + Math.cos(newY * 0.012) * 0.5;
          
          // Vary opacity for breathing effect
          const breathingOpacity = drop.opacity + Math.sin(Date.now() * 0.003 + drop.id) * 0.05;

          // Reset drop when it goes off screen with new properties
          if (newY > dimensions.height + 80) {
            return createDrop(drop.id);
          }

          return {
            ...drop,
            x: newX,
            y: newY,
            rotation: newRotation,
            opacity: Math.max(0.15, Math.min(0.5, breathingOpacity)),
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, createDrop]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute"
          style={{
            left: `${drop.x}px`,
            top: `${drop.y}px`,
            opacity: drop.opacity,
            transform: `scale(${drop.scale}) rotate(${drop.rotation}deg)`,
            filter: `sepia(90%) saturate(200%) hue-rotate(-10deg) brightness(1.2) drop-shadow(0 0 ${8 + drop.glowIntensity * 6}px rgba(227, 163, 74, ${0.4 + drop.glowIntensity * 0.3}))`,
            transition: 'transform 0.1s ease-out, filter 0.2s ease-out',
          }}
        >
          <Image
            src="/images/logo-original.webp"
            alt=""
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12"
            priority={false}
            loading="lazy"
          />
        </div>
      ))}
      
      {/* Enhanced gradient overlays for depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/0 via-[#0d0b09]/8 to-[#0d0b09]/25 pointer-events-none"
        style={{ zIndex: 2 }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#0d0b09]/10 via-transparent to-[#0d0b09]/10 pointer-events-none"
        style={{ zIndex: 3 }}
      />
      
      {/* Subtle animated glow effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(227, 163, 74, 0.08) 0%, transparent 50%)',
          zIndex: 4,
          animationDuration: '4s',
        }}
      />
    </div>
  );
}