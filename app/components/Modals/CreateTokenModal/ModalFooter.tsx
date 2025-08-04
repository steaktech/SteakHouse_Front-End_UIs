'use client';
import React, { FC } from 'react';

interface FeeCalculation {
    tokenCreationFee: number;
    tokenCreationFeeEth: number;
    removeSuffixFee: number;
    removeSuffixFeeEth: number;
    totalCostUsd: number;
    totalCostEth: number;
}

interface ModalFooterProps {
    feeCalculation: FeeCalculation;
}

export const ModalFooter: FC<ModalFooterProps> = ({ feeCalculation }) => {
    return (
        <div className="bg-[#6e3e12] py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <img src="/images/fuel-icon.png" alt="Fuel" className="w-18 h-18" />
                <div className="text-md text-amber-300/80">
                    <p>
                        <span className="font-semibold text-amber-200">GWEI:</span> 2 
                        <span className="font-semibold text-amber-200 ml-2">Token Creation Fee:</span> ${feeCalculation.tokenCreationFee.toFixed(2)}
                    </p>
                    <p>
                        <span className="font-semibold text-amber-200">Cost:</span> ${feeCalculation.tokenCreationFee.toFixed(2)} 
                        {feeCalculation.removeSuffixFee > 0 && (
                            <span className="font-semibold text-amber-200 ml-2">Remove Suffix:</span>
                        )}
                        {feeCalculation.removeSuffixFee > 0 && ` $${feeCalculation.removeSuffixFee.toFixed(2)}`}
                    </p>
                    <p className="font-bold text-amber-200 mt-1">
                        TOTAL COST: {feeCalculation.totalCostEth.toFixed(4)} ETH (${feeCalculation.totalCostUsd.toFixed(2)})
                    </p>
                </div>
            </div>
            <button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-[#3a2d1d] font-bold py-3 px-12 rounded-lg transition-all duration-300 shadow-lg shadow-amber-900/50">
                Confirm
            </button>
        </div>
    );
};