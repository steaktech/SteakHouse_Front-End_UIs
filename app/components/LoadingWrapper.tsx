'use client';
import React, { useState, useEffect } from 'react';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden font-sans bg-gradient-to-br from-[#1a0e08] via-[#2d1810] to-[#1a0e08] z-50">
    {/* Animated Background Particles */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#e8b35c] rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#f3cc76] rounded-full opacity-30 animate-ping"></div>
      <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-[#e8b35c] rounded-full opacity-25 animate-bounce"></div>
      <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-[#f3cc76] rounded-full opacity-20 animate-pulse"></div>
    </div>

    {/* Main Loading Container */}
    <div className="relative flex flex-col items-center gap-8 transform animate-fade-in">
      {/* Central Image Container */}
      <div className="relative">
        <img
          src="/images/loading-animation.gif"
          alt="Loading Animation"
          className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/200x200/e8b35c/1d1107?text=🚀';
          }}
        />
      </div>
      
      {/* Enhanced Loading Text */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#e8b35c] via-[#f3cc76] to-[#e8b35c] bg-clip-text text-transparent animate-shimmer tracking-wider">
          Steakhouse
        </h1>
        
        <div className="flex items-center gap-3">
          <p className="text-xl md:text-2xl font-medium text-[#e8b35c] animate-pulse">
            Loading
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#e8b35c] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#e8b35c] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#e8b35c] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-64 md:w-80 h-1 bg-[#e8b35c]/20 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-[#e8b35c] to-[#f3cc76] rounded-full animate-progress"></div>
        </div>
        
        <p className="text-sm text-[#e8b35c]/60 mt-2 animate-fade-in-delayed">
          Preparing your trading experience...
        </p>
      </div>
    </div>

    {/* Custom Styles */}
    <style jsx>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fade-in-delayed {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes spin-reverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes progress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .animate-fade-in {
        animation: fade-in 1s ease-out;
      }
      
      .animate-fade-in-delayed {
        animation: fade-in-delayed 2s ease-out 1s both;
      }
      
      .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
      }
      
      .animate-spin-reverse {
        animation: spin-reverse 4s linear infinite;
      }
      
      .animate-shimmer {
        background-size: 200% 100%;
        animation: shimmer 2s ease-in-out infinite;
      }
      
      .animate-progress {
        animation: progress 2s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // Ensure minimum 2 seconds of loading time
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    // Simulate content being ready (you can adjust this)
    const contentTimer = setTimeout(() => {
      setContentReady(true);
    }, 100);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  useEffect(() => {
    // Hide loading only when both conditions are met:
    // 1. Minimum time has elapsed (2 seconds)
    // 2. Content is ready
    if (minTimeElapsed && contentReady) {
      setIsLoading(false);
    }
  }, [minTimeElapsed, contentReady]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}