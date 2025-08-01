'use client';
import React, { FC } from 'react';
import { FormCheckbox, FormInput } from './FormComponents';
import { InfoIcon } from './InfoIcon';

interface LiquiditySectionProps {
    formData: {
        lock: boolean;
        burn: boolean;
        lockTime: string;
    };
    handleCheckboxChange: (name: string) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LiquiditySection: FC<LiquiditySectionProps> = ({ formData, handleCheckboxChange, handleInputChange }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
                💧 Liquidity
                <InfoIcon 
                    title="💧 Liquidity"
                    content="Decide what happens to your LP tokens once V2 launches:

Burn (irrecoverable), great for pure meme vibes.

Lock (min. 30 days; we recommend ≥ 90 days), your full liquidity pool and ETH raised during the curve returns to you once unlocked."
                />
            </h3>
            <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormCheckbox
                        label="Lock liquidity"
                        checked={formData.lock}
                        onChange={() => handleCheckboxChange('lock')}
                    />
                    <FormCheckbox
                        label="Burn liquidity"
                        checked={formData.burn}
                        onChange={() => handleCheckboxChange('burn')}
                    />
                    {/* Only show lock time if lock is checked */}
                    {formData.lock && (
                        <FormInput
                            label="lock time"
                            placeholder="365 days"
                            name="lockTime"
                            value={formData.lockTime}
                            onChange={handleInputChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};