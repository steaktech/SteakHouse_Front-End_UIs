'use client';
import React, { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';

export interface SteakHouseInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SteakHouse Getting Started Guide Modal
 *
 * Redesigned modal with video tutorials at the top and comprehensive guide content.
 */
const SteakHouseInfoModal: FC<SteakHouseInfoModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen || !mounted) return null;

    const videos = [
        { id: 1, title: 'Connecting your wallet and getting started', placeholder: 'video-placeholder-1.png' },
        { id: 2, title: 'Searching for tokens on homepage and using filters', placeholder: 'video-placeholder-2.png' },
        { id: 3, title: 'Buying and Selling a Token', placeholder: 'video-placeholder-3.png' },
        { id: 4, title: 'Creating a token', placeholder: 'video-placeholder-4.png' },
    ];

    const modalContent = (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 font-sans"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            {/* Main container with improved styling */}
            <div 
                className="bg-gradient-to-b from-[rgb(49,25,0)] to-[rgb(35,18,0)] text-white font-sans rounded-3xl p-6 sm:p-8 max-w-6xl w-full mx-auto shadow-2xl border-4 border-[rgb(106,61,11)]/40 max-h-[90vh] overflow-y-auto scroll-smooth custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header with Logo */}
                <div className="flex justify-center mb-4">
                    <img 
                        src="/images/info_modal.png" 
                        alt="SteakHouse Logo" 
                        className="w-24 h-24" 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/96x96/3A2411/FFFFFF?text=Logo";
                        }}
                    />
                </div>

                {/* Guide Content */}
                <div>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#efb95e] mb-2">
                            How SteakHouse Works
                        </h3>
                        <p className="text-[#9a816b] text-sm sm:text-base">
                            The ultimate platform for creating and trading tokens with ease
                        </p>
                    </div>

                    {/* Steps in 2x2 Grid with Videos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {/* Step 1 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#efb95e] to-[#d6a043] flex items-center justify-center text-[rgb(49,25,0)] font-bold text-lg">
                                            1
                                        </div>
                                        <h4 className="text-lg font-bold text-[#fdfbf7]">
                                            Connect Your Wallet
                                        </h4>
                                    </div>
                                    <p className="text-[#9a816b] text-sm">
                                        Connect your Web3 wallet and select your network to start trading.
                                    </p>
                                </div>
                                {/* Video 1 */}
                                <div className="w-full sm:w-40 flex-shrink-0 group relative">
                                    <div className="aspect-video rounded-lg border-2 border-[rgb(106,61,11)]/40 hover:border-[#efb95e]/60 transition-all duration-300 cursor-pointer overflow-hidden group-hover:shadow-lg group-hover:shadow-[#efb95e]/20">
                                        <img 
                                            src="/images/thumbnails/thumbnail-1.webp" 
                                            alt="Connect Your Wallet Tutorial" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#efb95e] to-[#d6a043] flex items-center justify-center text-[rgb(49,25,0)] font-bold text-lg">
                                            2
                                        </div>
                                        <h4 className="text-lg font-bold text-[#fdfbf7]">
                                            Search & Discover
                                        </h4>
                                    </div>
                                    <p className="text-[#9a816b] text-sm">
                                        Browse trending tokens and use filters to find the best opportunities.
                                    </p>
                                </div>
                                {/* Video 2 */}
                                <div className="w-full sm:w-40 flex-shrink-0 group relative">
                                    <div className="aspect-video rounded-lg border-2 border-[rgb(106,61,11)]/40 hover:border-[#efb95e]/60 transition-all duration-300 cursor-pointer overflow-hidden group-hover:shadow-lg group-hover:shadow-[#efb95e]/20">
                                        <img 
                                            src="/images/thumbnails/thumbnail-2.webp" 
                                            alt="Search & Discover Tutorial" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#efb95e] to-[#d6a043] flex items-center justify-center text-[rgb(49,25,0)] font-bold text-lg">
                                            3
                                        </div>
                                        <h4 className="text-lg font-bold text-[#fdfbf7]">
                                            Buy & Sell Tokens
                                        </h4>
                                    </div>
                                    <p className="text-[#9a816b] text-sm">
                                        Trade seamlessly with real-time charts and instant execution.
                                    </p>
                                </div>
                                {/* Video 3 */}
                                <div className="w-full sm:w-40 flex-shrink-0 group relative">
                                    <div className="aspect-video rounded-lg border-2 border-[rgb(106,61,11)]/40 hover:border-[#efb95e]/60 transition-all duration-300 cursor-pointer overflow-hidden group-hover:shadow-lg group-hover:shadow-[#efb95e]/20">
                                        <img 
                                            src="/images/thumbnails/thumbnail-3.webp" 
                                            alt="Buy & Sell Tokens Tutorial" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#efb95e] to-[#d6a043] flex items-center justify-center text-[rgb(49,25,0)] font-bold text-lg">
                                            4
                                        </div>
                                        <h4 className="text-lg font-bold text-[#fdfbf7]">
                                            Create Your Token
                                        </h4>
                                    </div>
                                    <p className="text-[#9a816b] text-sm">
                                        Launch your own token in minutes with zero coding required.
                                    </p>
                                </div>
                                {/* Video 4 */}
                                <div className="w-full sm:w-40 flex-shrink-0 group relative">
                                    <div className="aspect-video rounded-lg border-2 border-[rgb(106,61,11)]/40 hover:border-[#efb95e]/60 transition-all duration-300 cursor-pointer overflow-hidden group-hover:shadow-lg group-hover:shadow-[#efb95e]/20">
                                        <img 
                                            src="/images/thumbnails/thumbnail-4.webp" 
                                            alt="Create Your Token Tutorial" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kitchen Curve Explainer */}
                    <div className="bg-gradient-to-br from-[#efb95e]/10 to-transparent rounded-2xl p-6 border-2 border-[#efb95e]/30">
                        <h4 className="text-xl sm:text-2xl font-bold text-[#efb95e] mb-4 flex items-center gap-3">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                            </svg>
                            The Kitchen Curve Advantage
                        </h4>
                        <div className="space-y-3 text-[#b89d7f] text-sm sm:text-base">
                            <p>
                                <strong className="text-[#fdfbf7]">Private Bonding Curve:</strong> Tokens trade within a controlled bonding curve environment before public launch. This creates organic price discovery and builds momentum.
                            </p>
                            <p>
                                <strong className="text-[#fdfbf7]">Fair Launch to Uniswap:</strong> When the target market cap is reached, the entire kitchen automatically bundles into Uniswap V2:
                            </p>
                            <ul className="ml-6 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e] mt-0.5">✓</span>
                                    <span>All ETH becomes liquidity pool (LP) automatically</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e] mt-0.5">✓</span>
                                    <span>Existing balances transfer seamlessly, recreating the curve on V2</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e] mt-0.5">✓</span>
                                    <span>Early buyers receive locked positions (anti-dump mechanism)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e] mt-0.5">✓</span>
                                    <span>No bot snipers, no front-running, no launch dumps</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-10 pt-8 border-t border-[rgb(106,61,11)]/30 text-center">
                    <p className="text-[#9a816b] mb-4">
                        Ready to get started?
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-[#efb95e] to-[#d6a043] text-[rgb(49,25,0)] font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-[#efb95e]/30 transition-all duration-300 hover:scale-105"
                    >
                        Start Trading Now
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(
        modalContent,
        document.body
    );
};

export default SteakHouseInfoModal;