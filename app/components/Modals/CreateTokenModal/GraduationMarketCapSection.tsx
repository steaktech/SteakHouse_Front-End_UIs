'use client';
import React, { FC } from 'react';
import { FormInput } from './FormComponents';
import { InfoIcon } from './InfoIcon';

interface GraduationMarketCapSectionProps {
    formData: {
        marketCap: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GraduationMarketCapSection: FC<GraduationMarketCapSectionProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
                🎓 Graduation Market Cap
                <InfoIcon 
                    title="🎓 Graduation Market Cap"
                    content={`Choose the on-chain cap at which your token graduates (e.g. $30K – $200K). This sets your V2 'market cap to liquidity' ratio and remember, a higher cap means proportionally less liquidity on launch.`}
                />
            </h3>
            <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput 
                        label="market cap" 
                        placeholder="$ 500,000" 
                        name="marketCap" 
                        value={formData.marketCap} 
                        onChange={handleInputChange} 
                    />
                </div>
            </div>
        </div>
    );
};