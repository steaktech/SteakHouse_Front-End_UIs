'use client';
import React, { FC } from 'react';

interface ModalHeaderProps {
    onClose: () => void;
}

export const ModalHeader: FC<ModalHeaderProps> = ({ onClose }) => {
    return (
        <div className="bg-[#6e3e12] p-4 flex items-center justify-center relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-wide">
                <span className="font-light text-amber-400">+</span> Create Token
            </h2>
            <button onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-4 text-amber-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};