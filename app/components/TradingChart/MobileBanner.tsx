"use client";

import React from 'react';

interface MobileBannerProps {
  bannerUrl?: string;
  tokenName?: string;
}

export default function MobileBanner({
  bannerUrl,
  tokenName = 'Token',
}: MobileBannerProps) {
  if (!bannerUrl) {
    return null;
  }

  return (
    <div className="lg:hidden w-full h-[120px] bg-[#0a0612] border-b border-[#1f1a24] overflow-hidden">
      <div className="relative w-full h-full">
        <img
          src={bannerUrl}
          alt={`${tokenName} banner`}
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center',
          }}
        />
        {/* Gradient overlay for better text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612]/40 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
