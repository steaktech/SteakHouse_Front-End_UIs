"use client";

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/app/contexts/ThemeContext';

interface MobileBannerProps {
  bannerUrl?: string;
  tokenName?: string;
}

export default function MobileBanner({
  bannerUrl,
  tokenName = 'Token',
}: MobileBannerProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!bannerUrl) {
    return null;
  }

  return (
    <div className={`w-full h-[120px] border-b overflow-hidden ${isLight ? 'bg-white border-[#e8dcc8]' : 'bg-[#07040b] border-[#07040b]'}`}>
      <div className="relative w-full h-full">
        <Image
          src={bannerUrl}
          alt={`${tokenName} banner`}
          fill
          className="object-cover"
          style={{
            objectPosition: 'center',
          }}
          priority // Banner is likely above the fold or close to it
        />
        {/* Gradient overlay for better text readability if needed */}
        <div className={`absolute inset-0 pointer-events-none ${isLight ? 'bg-gradient-to-t from-white/20 to-transparent' : 'bg-gradient-to-t from-[#0a0612]/40 to-transparent'}`} />
      </div>
    </div>
  );
}
