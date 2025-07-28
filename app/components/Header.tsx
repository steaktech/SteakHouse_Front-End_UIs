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
              <div className="w-8 h-8 bg-[#daaa4e] rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-700 transition-colors">
                <svg className="w-5 h-5 fill-current text-[#5c2702]" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              
              {/* Telegram Icon */}
              <div className="w-8 h-8 bg-[#daaa4e] rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-700 transition-colors">
                <svg className="w-5 h-5 fill-current text-[#5c2702]" viewBox="0 0 24 24">
                  <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.787l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                </svg>
              </div>
              
              {/* Twitter/X Icon */}
              <div className="w-8 h-8 bg-[#daaa4e] rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-700 transition-colors">
                <svg className="w-4 h-4 fill-current text-[#5c2702]" viewBox="0 0 1200 1227">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
                </svg>
              </div>
              
              {/* Info Icon */}
              <div 
                className="w-8 h-8 bg-[#daaa4e] rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-700 transition-colors"
                onClick={() => setIsInfoModalOpen(true)}
              >
                <svg className="w-8 h-8 fill-current text-[#5c2702]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
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