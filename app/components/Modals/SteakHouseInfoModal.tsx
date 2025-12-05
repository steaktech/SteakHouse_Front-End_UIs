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
        { id: 1, title: 'Connect your wallet', placeholder: 'thumbnail-1.webp' },
        { id: 2, title: 'Searching for tokens', placeholder: 'thumbnail-2.webp' },
        { id: 3, title: 'Buying / Selling a Token', placeholder: 'thumbnail-3.webp' },
        { id: 4, title: 'Creating a Token', placeholder: 'thumbnail-4.webp' },
    ];

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 font-sans"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <div
                className="bg-gradient-to-b from-[rgb(49,25,0)] to-[rgb(35,18,0)] text-white font-sans rounded-3xl p-4 sm:p-6 max-w-7xl w-full mx-auto shadow-2xl border-4 border-[rgb(106,61,11)]/40 max-h-[95vh] overflow-y-auto scroll-smooth custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Column: Info & Features */}
                    <div className="flex flex-col justify-center">
                        {/* Header with Logo Left Aligned */}
                        <div className="flex flex-col items-start mb-4">
                            <img
                                src="/images/info_modal.png"
                                alt="SteakHouse Logo"
                                className="w-16 h-16 mb-2"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "https://placehold.co/96x96/3A2411/FFFFFF?text=Logo";
                                }}
                            />
                            <h3 className="text-xl sm:text-2xl font-bold text-[#efb95e] mb-1">
                                How To Use SteakHouse
                            </h3>
                            <p className="text-[#9a816b] text-xs sm:text-sm mb-4 leading-relaxed">
                                The ultimate platform for easily creating and trading customized Tokens, safely from bots and Snipers.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="mt-1">
                            <h4 className="text-base font-bold text-[#fdfbf7] mb-2 flex items-center gap-2">
                                <span className="text-[#efb95e]">(i)</span> Why Choose Our Platform?
                            </h4>
                            <ul className="space-y-1 text-[#b89d7f] text-xs sm:text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>$3 Deployments</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>No-Coding Skills</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>Multichain Support</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>Custom: Tax, Limits, Grad MCAP</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>Stealth Deploys</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>Anti Bot / Sniper</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>All Tokens 100% Safe Audited</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#efb95e]">✓</span>
                                    <span>Manipulation Free Standards</span>
                                </li>
                            </ul>
                        </div>

                        {/* Footer CTA - Moved to left column for better balance or keep at bottom? 
                            User said "see all 4 videos... and Ready to get started section".
                            If I put it at the bottom of the left column, it might balance the height better 
                            since the 4 videos are tall.
                        */}
                        <div className="mt-6 pt-4 border-t border-[rgb(106,61,11)]/30 text-center">
                            <p className="text-[#9a816b] text-xs mb-2">
                                Ready to get started?
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-gradient-to-r from-[#efb95e] to-[#d6a043] text-[rgb(49,25,0)] font-bold py-2 px-6 rounded-xl hover:shadow-lg hover:shadow-[#efb95e]/30 transition-all duration-300 hover:scale-105 text-sm"
                            >
                                Start Trading Now
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Stacked Videos */}
                    <div className="flex flex-col gap-2 justify-center">
                        {videos.map((video) => (
                            <div key={video.id} className="bg-black/20 rounded-lg p-2 border border-[rgb(106,61,11)]/30 hover:border-[#efb95e]/50 transition-colors flex gap-3 items-center">
                                <div className="w-40 sm:w-48 flex-shrink-0 aspect-video rounded border border-[rgb(106,61,11)]/40 hover:border-[#efb95e]/60 transition-all duration-300 cursor-pointer overflow-hidden group relative">
                                    <img
                                        src={`/images/thumbnails/${video.placeholder}`}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = `https://placehold.co/600x340/3A2411/FFFFFF?text=${encodeURIComponent(video.title)}`;
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-[#efb95e] flex items-center justify-center text-[rgb(49,25,0)]">
                                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[#fdfbf7] text-xs sm:text-sm font-bold flex-1">{video.title}</p>
                            </div>
                        ))}
                    </div>
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