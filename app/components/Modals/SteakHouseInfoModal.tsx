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
    const [playingVideo, setPlayingVideo] = useState<number | null>(null);
    const [fullscreenVideo, setFullscreenVideo] = useState<{ id: number; url: string; title: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (fullscreenVideo) {
                    setFullscreenVideo(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose, fullscreenVideo]);

    if (!isOpen || !mounted) return null;

    const videos = [
        { 
            id: 1, 
            title: 'Connecting your wallet and getting started', 
            url: 'https://tuereaugboyscqlvuskt.supabase.co/storage/v1/object/sign/tutorialVids/tutorial-1-steakhouse.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMWQyNzQ5Yi02OWMxLTQ3OTYtYWZkMi1lMTMzMGE2MTk2NjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0dXRvcmlhbFZpZHMvdHV0b3JpYWwtMS1zdGVha2hvdXNlLm1wNCIsImlhdCI6MTc2MzE4Njk2OSwiZXhwIjoxOTIwODY2OTY5fQ.MCvPVU6F_hnCzkswlfhe_GhRQ2ogdxY6X6frF7ajm1c'
        },
        { 
            id: 2, 
            title: 'Searching for tokens on homepage and using filters', 
            url: 'https://tuereaugboyscqlvuskt.supabase.co/storage/v1/object/sign/tutorialVids/2025-11-14%2022.05.27.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMWQyNzQ5Yi02OWMxLTQ3OTYtYWZkMi1lMTMzMGE2MTk2NjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0dXRvcmlhbFZpZHMvMjAyNS0xMS0xNCAyMi4wNS4yNy5tcDQiLCJpYXQiOjE3NjMxODY5NTgsImV4cCI6MTkyMDg2Njk1OH0.T4vB_O63CFmQN_2CeFqBGuwuZ1kdbZmtMOsYScR2Nlg'
        },
        { 
            id: 3, 
            title: 'Buying and Selling a Token', 
            url: 'https://tuereaugboyscqlvuskt.supabase.co/storage/v1/object/sign/tutorialVids/2025-11-14%2022.04.52.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMWQyNzQ5Yi02OWMxLTQ3OTYtYWZkMi1lMTMzMGE2MTk2NjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0dXRvcmlhbFZpZHMvMjAyNS0xMS0xNCAyMi4wNC41Mi5tcDQiLCJpYXQiOjE3NjMxODY5NDQsImV4cCI6MTkyMDg2Njk0NH0.hA0adZR_BpzlzScLRoUxYb-ABu3O8RZ7FiPsnBZ_ml8'
        },
        { 
            id: 4, 
            title: 'Creating a token', 
            url: 'https://tuereaugboyscqlvuskt.supabase.co/storage/v1/object/sign/tutorialVids/video-create-token.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMWQyNzQ5Yi02OWMxLTQ3OTYtYWZkMi1lMTMzMGE2MTk2NjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0dXRvcmlhbFZpZHMvdmlkZW8tY3JlYXRlLXRva2VuLm1wNCIsImlhdCI6MTc2MzE4NzAzNywiZXhwIjoxOTIwODY3MDM3fQ.LA3WcaOCmMZagRfTkNmxbMOpQQYiz5Twrt7Z4X_bqz0'
        },
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

                {/* Video Tutorials Grid - TOP SECTION */}
                <div className="mb-8 pb-8 border-b border-[rgb(106,61,11)]/30">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#efb95e] mb-6 text-center">
                        Quick Start Videos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {videos.map((video, index) => (
                            <div key={video.id} className="group relative">
                                {/* Video Container */}
                                <div className="aspect-video bg-gradient-to-br from-black/60 to-black/40 rounded-xl border-2 border-[rgb(106,61,11)]/40 hover:border-[#efb95e]/60 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-[#efb95e]/20">
                                    {/* Play Button Overlay */}
                                    <div 
                                        className="w-full h-full flex flex-col items-center justify-center bg-black/30 cursor-pointer hover:bg-black/20 transition-all"
                                        onClick={() => setFullscreenVideo({ id: video.id, url: video.url, title: video.title })}
                                    >
                                        <svg 
                                            className="w-12 h-12 text-[#efb95e] group-hover:scale-110 transition-transform duration-300" 
                                            viewBox="0 0 24 24" 
                                            fill="currentColor"
                                        >
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                        <span className="text-[#efb95e] text-xs mt-2 font-semibold">Video {index + 1}</span>
                                    </div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-[#efb95e]/30">
                                    {video.title}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fullscreen Video Player Modal */}
                {fullscreenVideo && (
                    <div 
                        className="fixed inset-0 bg-black/95 z-[10000] flex flex-col items-center justify-center p-4"
                        onClick={() => setFullscreenVideo(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setFullscreenVideo(null)}
                            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
                            aria-label="Close video"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Video Title */}
                        <div className="text-white text-xl font-semibold mb-4 text-center max-w-3xl">
                            {fullscreenVideo.title}
                        </div>

                        {/* Video Player */}
                        <div 
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                src={fullscreenVideo.url}
                                controls
                                autoPlay
                                className="w-full h-full"
                                style={{
                                    objectFit: 'contain'
                                }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* Instructions */}
                        <div className="text-white/60 text-sm mt-4 text-center">
                            Press ESC or click outside to close
                        </div>
                    </div>
                )}

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

                    {/* Compact 2x2 Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Step 1 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
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

                        {/* Step 2 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
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

                        {/* Step 3 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
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

                        {/* Step 4 */}
                        <div className="bg-black/20 rounded-xl p-4 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors">
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