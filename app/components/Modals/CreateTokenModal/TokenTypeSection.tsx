'use client';
import React, { FC } from 'react';
import { InfoIcon } from './InfoIcon';

interface TokenTypeSectionProps {
    tokenType: 'tax' | 'no-tax';
    setTokenType: (type: 'tax' | 'no-tax') => void;
}

export const TokenTypeSection: FC<TokenTypeSectionProps> = ({ tokenType, setTokenType }) => {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg flex items-center">
                🥩 Token Type
                <InfoIcon 
                    title="🥩 Token Type"
                    content={`This determines which V2 contract you'll get once your project "graduates" and adds real liquidity. You have two choices ...

TAX: your V2 token charges a buy/sell tax (1–5%) that goes straight to your wallet.

NO-TAX: zero tax on V2 trades.`}
                />
            </h3>
            <div className="w-full md:w-3/4 flex items-center gap-4">
                <div
                    onClick={() => setTokenType('tax')}
                    className={`cursor-pointer flex-1 p-3 rounded-lg border-2 transition-all duration-300 ${tokenType === 'tax' ? 'border-amber-400 bg-amber-900/40' : 'border-amber-600/30 hover:bg-amber-900/20'}`}
                >
                    <span className={`font-semibold text-center block ${tokenType === 'tax' ? 'text-amber-300' : 'text-amber-300/70'}`}>TAX</span>
                </div>
                <div
                    onClick={() => setTokenType('no-tax')}
                    className={`cursor-pointer flex-1 p-3 rounded-lg border-2 transition-all duration-300 ${tokenType === 'no-tax' ? 'border-amber-400 bg-amber-900/40' : 'border-amber-600/30 hover:bg-amber-900/20'}`}
                >
                    <span className={`font-semibold text-center block ${tokenType === 'no-tax' ? 'text-amber-300' : 'text-amber-300/70'}`}>NO-TAX</span>
                </div>
            </div>
        </div>
    );
};