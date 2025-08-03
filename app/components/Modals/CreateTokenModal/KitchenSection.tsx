'use client';
import React, { FC } from 'react';
import { FormInput } from './FormComponents';
import { InfoIcon } from './InfoIcon';

interface KitchenSectionProps {
    formData: {
        startingTax: string;
        timeActive1: string;
        finalTax: string;
        startingMaxTx: string;
        maxTimeActive: string;
        finalMaxTx: string;
        startingMaxWallet: string;
        maxWalletTimeActive: string;
        finalMaxWallet: string;
        taxReceiver: string;
        adv_startingTax: string;
        adv_taxDropAmount: string;
        adv_taxDropBlocks: string;
        adv_finalTax: string;
        adv_taxWallet: string;
        adv_startingMaxWallet: string;
        adv_maxWalletIncreaseAmount: string;
        adv_maxWalletBlocks: string;
        adv_startingMaxTx: string;
        adv_maxTxIncreaseAmount: string;
        adv_maxTxBlocks: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tokenType: 'tax' | 'no-tax';
    isAdvancedOpen: boolean;
    setIsAdvancedOpen: (open: boolean) => void;
}

export const KitchenSection: FC<KitchenSectionProps> = ({ 
    formData, 
    handleInputChange, 
    tokenType, 
    isAdvancedOpen, 
    setIsAdvancedOpen 
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
                📊 Kitchen (Virtual Curve)
                <InfoIcon 
                    title="📊 Kitchen (Virtual Curve)"
                    content={`While your token is still virtual, the bonding curve enforces any static or time-based limits and taxes at each buy. ETH taxes are taken immediately, smoothing out "sell pressure" and funding your V2 marketing vault.

Standard (TAX / NO-TAX) can enforce a flat tax (e.g. 20%) and static limits (e.g. 1% max-tx, 1% max-wallet) for a set duration, then drop to forever values.

Advanced lets you stepwise decay or increase parameters: e.g. –1% tax every 10 blocks (~1m20s), or ramp max-wallet by +0.1% each interval until final values are reached in-curve or the token graduates.`}
                />
            </h3>
            <div className="w-full md:w-3/4">
                {!isAdvancedOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormInput 
                            label="starting tax" 
                            placeholder="20%" 
                            name="startingTax" 
                            value={formData.startingTax} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="tax time active" 
                            placeholder="10s" 
                            name="timeActive1" 
                            value={formData.timeActive1} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="final tax" 
                            placeholder="2%" 
                            name="finalTax" 
                            value={formData.finalTax} 
                            onChange={handleInputChange}
                            disabled={tokenType === 'no-tax'} 
                        />
                        <FormInput 
                            label="starting maxtx" 
                            placeholder="0.5%" 
                            name="startingMaxTx" 
                            value={formData.startingMaxTx} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="maxtx time active" 
                            placeholder="3s" 
                            name="maxTimeActive" 
                            value={formData.maxTimeActive} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="final maxtx" 
                            placeholder="2%" 
                            name="finalMaxTx" 
                            value={formData.finalMaxTx} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="starting maxwallet" 
                            placeholder="0.5%" 
                            name="startingMaxWallet" 
                            value={formData.startingMaxWallet} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="maxwallet time active" 
                            placeholder="3s" 
                            name="maxWalletTimeActive" 
                            value={formData.maxWalletTimeActive} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="final max wallet" 
                            placeholder="2%" 
                            name="finalMaxWallet" 
                            value={formData.finalMaxWallet} 
                            onChange={handleInputChange} 
                        />
                        <FormInput 
                            label="tax reciever" 
                            placeholder="0x..." 
                            name="taxReceiver" 
                            value={formData.taxReceiver} 
                            onChange={handleInputChange}
                            containerClassName="sm:col-span-2 lg:col-span-3" 
                        />
                    </div>
                )}

                {/* Advanced Section */}
                <div className="mt-6 border-t border-amber-800/30 pt-6">
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="w-full flex justify-between items-center text-lg font-bold text-amber-300 hover:text-amber-100 transition-colors py-2"
                    >
                        <span>[ADVANCED]</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isAdvancedOpen && (
                        <div className="mt-4 space-y-4">
                            {/* Tax Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput label="Starting TAX" name="adv_startingTax" value={formData.adv_startingTax} placeholder="20%" onChange={handleInputChange} />
                                <FormInput label="Tax Drop Increment" name="adv_taxDropAmount" value={formData.adv_taxDropAmount} placeholder="-1%" onChange={handleInputChange} />
                                <FormInput label="Every X Seconds" name="adv_taxDropBlocks" value={formData.adv_taxDropBlocks} placeholder="e.g 60 seconds" onChange={handleInputChange} />
                            </div>
                            
                            {/* Final Tax and Tax Wallet */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput label="Final TAX" name="adv_finalTax" value={formData.adv_finalTax} placeholder="5%" onChange={handleInputChange} />
                                <FormInput label="Tax Reciever" name="adv_taxWallet" value={formData.adv_taxWallet} placeholder="0x38hfn84bv&cruirt85nt..." onChange={handleInputChange} />
                            </div>
                            
                            {/* MaxWallet Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput label="Starting MaxWallet" name="adv_startingMaxWallet" value={formData.adv_startingMaxWallet} placeholder="0.5%" onChange={handleInputChange} />
                                <FormInput label="MaxWallet Increase" name="adv_maxWalletIncreaseAmount" value={formData.adv_maxWalletIncreaseAmount} placeholder="+0.1%" onChange={handleInputChange} />
                                <FormInput label="Every X Seconds" name="adv_maxWalletBlocks" value={formData.adv_maxWalletBlocks} placeholder="e.g 60 seconds" onChange={handleInputChange} />
                            </div>
                            
                            {/* MaxTX Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput label="Starting MaxTX" name="adv_startingMaxTx" value={formData.adv_startingMaxTx} placeholder="0.1%" onChange={handleInputChange} />
                                <FormInput label="MaxTX increase" name="adv_maxTxIncreaseAmount" value={formData.adv_maxTxIncreaseAmount} placeholder="+0.1%" onChange={handleInputChange} />
                                <FormInput label="Every X Seconds" name="adv_maxTxBlocks" value={formData.adv_maxTxBlocks} placeholder="e.g 60 seconds" onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};