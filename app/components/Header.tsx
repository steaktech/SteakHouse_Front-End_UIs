"use client";

import Image from 'next/image';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const CreateTokenModal = dynamic(() => import('./Modals/CreateTokenModal/CreateTokenModal'), { ssr: false });
const SteakHouseInfoModal = dynamic(() => import('./Modals/SteakHouseInfoModal'), { ssr: false });

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  return (
    <>
      {/* <header className="relative w-full h-20 bg-gradient-to-b from-[#4c2001] to-[#723203] shadow-md"> */}
      <header className="relative w-full h-20 bg-gradient-to-b from-[#4c2001] to-transparent shadow-md">
        {/* Header Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-2 sm:px-4 md:px-6 lg:px-12">
          {/* Logo & Socials Section */}
          <div className="flex items-center">
            {/* Logo Container */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-65 md:h-65 pointer-events-none">
              <Image
                src="/images/app-logo.png"
                alt="Logo"
                fill
                className="object-contain pointer-events-auto md:hidden"
              />
              <Image
                src="/images/header-logo-lg.png"
                alt="Logo"
                fill
                className="object-contain pointer-events-auto hidden md:block"
              />
            </div>
            
            {/* Social Icons */}
            {/* MODIFIED: Icons are hidden by default, and appear as a flex container on 'sm' screens and larger */}
            <div className="hidden sm:flex items-center space-x-2 ml-4">
              {/* Discord Icon */}
              <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/discord.png"
                  alt="Discord"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>
              
              {/* Telegram Icon */}
              <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/telegram.png"
                  alt="Telegram"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>

              {/* Twitter/X Icon */}
              <a href="#" className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>
              
              {/* Info Icon */}
              <div onClick={() => setIsInfoModalOpen(true)} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/info.png"
                  alt="Info"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Buttons Section (using the most compact version) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 mb-2">
            {/* Create Token Button */}
            <div className="outer-button header-button cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <div className="inner-button px-1.5 py-1 sm:px-2 md:px-3 text-[#e9af5a] font-bold text-xs sm:text-sm md:text-base">
                <span className="text-xs sm:text-sm font-bold mr-1">+</span>
                <span className="hidden sm:inline">Create Token</span>
                <span className="sm:hidden">Create</span>
              </div>
            </div>

            {/* Connect Wallet Button */}
            <div className="outer-button header-button cursor-pointer" onClick={() => { /* wallet logic */ }}>
              <div className="inner-button golden px-1.5 py-1 sm:px-2 md:px-3 text-[#000000] font-bold text-xs sm:text-sm md:text-base">
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Modals */}
      <CreateTokenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SteakHouseInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
}