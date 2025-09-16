"use client";

import { useState, useEffect } from 'react';

export interface DeviceOrientationState {
  isLandscape: boolean;
  isPortrait: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Custom hook to detect device orientation and screen size
 * Specifically designed for mobile fullscreen chart functionality
 */
export function useDeviceOrientation(): DeviceOrientationState {
  const [orientationState, setOrientationState] = useState<DeviceOrientationState>({
    isLandscape: false,
    isPortrait: true,
    isMobile: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 1024; // lg breakpoint
      const isLandscape = width > height;
      const isPortrait = height > width;

      setOrientationState({
        isLandscape,
        isPortrait,
        isMobile,
        screenWidth: width,
        screenHeight: height,
        orientation: isLandscape ? 'landscape' : 'portrait',
      });
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    // Cleanup listeners
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientationState;
}
