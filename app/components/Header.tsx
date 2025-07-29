"use client";

import Image from 'next/image';
import { useState } from 'react';
import dynamic from 'next/dynamic';
const CreateTokenModal = dynamic(() => import('./Modals/CreateTokenModal'), { ssr: false });
const SteakHouseInfoModal = dynamic(() => import('./Modals/SteakHouseInfoModal'), { ssr: false });

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  return (
    <>
      <header className="relative w-full h-20 md:h-20 lg:h-20 bg-gradient-to-b from-[#4c2001] to-[#723203] shadow-md">
        {/* Background Image */}
        
        {/* Header Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-6 md:px-12 lg:px-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative w-40 h-40 md:w-40 md:h-40 lg:w-60 lg:h-60 pointer-events-none">
              <Image
                src="/images/header_icon.png"
                alt="Logo"
                fill
                className="object-contain pointer-events-auto"         
              />
            </div>
            
            {/* Social Icons */}
            <div className="hidden sm:flex items-center space-x-2 ml-4">
              {/* Discord Icon */}
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/discord.png"
                  alt="Discord"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              
              {/* Telegram Icon */}
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/telegram.png"
                  alt="Telegram"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>

              {/* Twitter/X Icon */}
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              
              {/* Info Icon */}
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsInfoModalOpen(true)}>
                <Image
                  src="/images/info.png"
                  alt="Info"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>


            </div>
          </div>
          
          {/* Buttons Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Create Token Button with 3D Effect */}
            <div 
              className="outer-button header-button cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="inner-button text-[#e9af5a] font-bold text-sm sm:text-base">
                <span className="text-sm sm:text-lg font-bold mr-1 sm:mr-2">+</span>
                <span className="hidden sm:inline">Create Token</span>
                <span className="sm:hidden">Create</span>
              </div>
            </div>

            {/* Connect Wallet Button with 3D Effect */}
            <div className="outer-button golden header-button cursor-pointer">
              <div className="inner-button golden text-black font-bold text-sm sm:text-base">
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Modals - Moved outside of header */}
      <CreateTokenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SteakHouseInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
}