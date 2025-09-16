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

    // Listen for orientation changes with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateOrientation, 100);
    };

    // Multiple event listeners for better orientation detection
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', () => {
      // Orientationchange fires before the viewport adjusts, so we need a delay
      setTimeout(updateOrientation, 200);
    });
    
    // Additional listener for screen orientation API if available
    if (screen && screen.orientation) {
      screen.orientation.addEventListener('change', debouncedUpdate);
    }

    // Cleanup listeners
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
      if (screen && screen.orientation) {
        screen.orientation.removeEventListener('change', debouncedUpdate);
      }
    };
  }, []);

  return orientationState;
}
