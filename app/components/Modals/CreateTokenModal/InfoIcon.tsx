'use client';
import React, { FC, useState } from 'react';

interface InfoIconProps {
    content: string;
    title?: string;
}

export const InfoIcon: FC<InfoIconProps> = ({ content, title }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block flex-shrink-0 self-start">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                className="text-amber-400/70 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 rounded-full"
                aria-label="More information"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {/* Popup */}
            {isVisible && (
                <div className="absolute z-50 w-80 p-4 mt-2 bg-[#2a1f14] border border-amber-600/30 rounded-lg shadow-xl -left-32 transform">
                    {/* Arrow pointing up */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-[#2a1f14] border-l border-t border-amber-600/30 transform rotate-45"></div>
                    </div>
                    
                    {title && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-600/20">
                            <span className="text-lg">{title.split(' ')[0]}</span>
                            <h4 className="font-semibold text-amber-300">{title.split(' ').slice(1).join(' ')}</h4>
                        </div>
                    )}
                    
                    <div className="text-sm text-amber-200 leading-relaxed whitespace-pre-line">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};