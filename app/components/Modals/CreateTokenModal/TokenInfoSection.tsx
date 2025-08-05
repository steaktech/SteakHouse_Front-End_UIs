'use client';
import React, { FC } from 'react';
import { FormInput } from './FormComponents';
import { InfoIcon } from './InfoIcon';

interface TokenInfoSectionProps {
    formData: {
        name: string;
        symbol: string;
        supply: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TokenInfoSection: FC<TokenInfoSectionProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
                ℹ️ Token Info
                <InfoIcon 
                    title="ℹ️ Token Info"
                    content="Pick a name, symbol (3–5 characters works best), and total supply. Utility tokens often use round figures (1 – 100 M), while memes can get playful (69 B)."
                />
            </h3>
            <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput 
                        label="name" 
                        placeholder="STEAK" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                    />
                    <FormInput 
                        label="symbol" 
                        placeholder="STEAK" 
                        name="symbol" 
                        value={formData.symbol} 
                        onChange={handleInputChange} 
                    />
                    <FormInput 
                        label="supply" 
                        placeholder="10,000,000" 
                        name="supply" 
                        value={formData.supply} 
                        onChange={handleInputChange} 
                    />
                </div>
            </div>
        </div>
    );
};