'use client';
import React, { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';

export interface SteakHouseInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SteakhouseModal Component
 *
 * This component renders the main UI card as seen in the image.
 * It includes the logo, titles, steps, and feature list, all styled
 * to match the provided design.
 */
const SteakHouseInfoModal: FC<SteakHouseInfoModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);

    // URL for the placeholder logo.
    const logoUrl = "https://placehold.co/128x128/eab308/3A2411?text=🐮";

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

    const modalContent = (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 font-sans"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            {/* Main container for the modal with a dark brown background, more rounded corners, and a thicker border. */}
            <div 
                className="bg-[rgb(49,25,0)] text-white font-sans rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-auto shadow-2xl border-4 border-[rgb(106,61,11)]/30 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div> */}  

                {/* Logo Image */}
                <div className="flex justify-center mb-6">
                    <img 
                        src="/images/info_modal.png" 
                        alt="SteakHouse Logo" 
                        className="w-32 h-32" 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop if placeholder fails
                            target.src = "https://placehold.co/128x128/3A2411/FFFFFF?text=Logo";
                        }}
                    />
                </div>

                {/* Main Title */}
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#efb95e] mb-8">
                    What's SteakHouse?
                </h2>

                {/* Steps Section */}
                <div className="space-y-6">
                    
                    {/* --- Step 1 --- */}
                    <div>
                        <h3 className="font-bold text-yellow-400 mb-2">
                            <span className="text-2xl text-[#fdfbf7]">Step 1:</span>  <span className="text-lg text-[#d6c6b2]">Cook In the Kitchen</span>
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-[#9a816b] text-sm">
                            Create your token in seconds. Choose TAX or NO-TAX, dynamic settings, max wallet, and tx controls. Set a target market cap and schedule your Launch with 0 coding skills needed.
                        </p>
                    </div>

                    {/* --- Step 2 --- */}
                    <div>
                        <h3 className="font-bold text-yellow-400 mb-2">
                            <span className="text-2xl text-[#edb94b]">Step 2:</span>  <span className="text-lg text-[#826220]">Steakhouse Kitchen Curve</span>
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-[#9a816b] text-sm">
                            Tokens buy / sell into a private bonding curve. Hype builds while ETH gets taxed and paid to the Developer directly, no clog or chart dumps from tax token sells.
                        </p>
                    </div>

                    {/* --- Step 3 --- */}
                    <div>
                        <h3 className="font-bold text-yellow-400 mb-2">
                            <span className="text-2xl text-[#8f6944]">Step 3:</span>  <span className="text-lg text-[#6e4f2f]">Serve to the Market</span>
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-[#9a816b] text-sm">
                            When the target is hit, the entire Kitchen is bundled into Uniswap V2:
                        </p>
                        {/* Bullet points for Step 3 */}
                        <ul className="list-disc list-inside text-gray-300 mt-3 space-y-2 pl-2 text-sm">
                            <li>ETH becomes LP</li>
                            <li>Balances are bundled recreating the curve on V2</li>
                            <li>Buyers get locked positions inside the Kitchen</li>
                            <li>No slippage, no dumps, no snipers</li>
                        </ul>
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
