'use client';
import React, { useState, useEffect, FC, useMemo } from 'react';
import { createPortal } from 'react-dom';

// Import components
import { ModalHeader } from './ModalHeader';
import { ModalFooter } from './ModalFooter';
import { ModalStyles } from './ModalStyles';
import { TokenTypeSection } from './TokenTypeSection';
import { TokenInfoSection } from './TokenInfoSection';
import { KitchenSection } from './KitchenSection';
import { LaunchDateTimeSection } from './LaunchDateTimeSection';
import { GraduationMarketCapSection } from './GraduationMarketCapSection';
import { LiquiditySection } from './LiquiditySection';
import { MetadataAndSocialsSection } from './MetadataAndSocialsSection';
import { calculateFees } from './feeCalculation';


// The Modal Component
export interface CreateTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTokenModal: FC<CreateTokenModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);
    const [tokenType, setTokenType] = useState<'tax' | 'no-tax'>('tax');
    const [removeSuffix, setRemoveSuffix] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const [formData, setFormData] = useState({
        // Standard fields
        name: '',
        symbol: '',
        supply: '',
        startingTax: '',
        timeActive1: '',
        finalTax: '',
        startingMaxTx: '',
        maxTimeActive: '',
        finalMaxTx: '',
        startingMaxWallet: '',
        maxWalletTimeActive: '',
        finalMaxWallet: '',
        taxReceiver: '',
        launchDate: '',
        launchTime: '',
        marketCap: '',
        lock: false,
        lockTime: '',
        burn: false,
        description: '',
        telegram: '',
        website: '',
        twitter: '',

        // Advanced fields
        adv_startingTax: '',
        adv_taxDropAmount: '',
        adv_taxDropBlocks: '',
        adv_finalTax: '',
        adv_taxWallet: '',
        adv_startingMaxWallet: '',
        adv_maxWalletIncreaseAmount: '',
        adv_maxWalletBlocks: '',
        adv_startingMaxTx: '',
        adv_maxTxIncreaseAmount: '',
        adv_maxTxBlocks: '',
        adv_removeUnitsAfter: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
    };

    // Calculate fees based on current selections
    const feeCalculation = useMemo(() => {
        return calculateFees(tokenType, isAdvancedOpen, removeSuffix);
    }, [tokenType, isAdvancedOpen, removeSuffix]);

    // Effect to handle token type changes
    useEffect(() => {
        if (tokenType === 'no-tax') {
            setFormData(prev => ({ ...prev, finalTax: '0' }));
        }
    }, [tokenType]);

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
            <div
                className="bg-[#411e02] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] text-amber-100 border border-amber-800/50 flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <ModalHeader onClose={onClose} />

                {/* Form Body - Scrollable */}
                <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8">
                    <div className="space-y-8">
                        {/* Token Type Section */}
                        <TokenTypeSection tokenType={tokenType} setTokenType={setTokenType} />

                        {/* Other Sections */}
                        <TokenInfoSection 
                            formData={formData} 
                            handleInputChange={handleInputChange} 
                        />
                        
                        <KitchenSection 
                            formData={formData} 
                            handleInputChange={handleInputChange} 
                            tokenType={tokenType}
                            isAdvancedOpen={isAdvancedOpen}
                            setIsAdvancedOpen={setIsAdvancedOpen}
                        />
                        
                        <LaunchDateTimeSection 
                            formData={formData} 
                            handleInputChange={handleInputChange} 
                        />
                        
                        <GraduationMarketCapSection 
                            formData={formData} 
                            handleInputChange={handleInputChange} 
                        />
                        
                        <LiquiditySection 
                            formData={formData} 
                            handleCheckboxChange={handleCheckboxChange} 
                            handleInputChange={handleInputChange} 
                        />
                        
                        <MetadataAndSocialsSection 
                            formData={formData} 
                            handleInputChange={handleInputChange}
                            removeSuffix={removeSuffix}
                            setRemoveSuffix={setRemoveSuffix}
                        />
                    </div>


                </div>

                {/* Footer */}
                <ModalFooter feeCalculation={feeCalculation} />
            </div>
            
            {/* Styles for the custom scrollbar */}
            <ModalStyles />
        </div>
    );

    return createPortal(
        modalContent,
        document.body
    );
};

export default CreateTokenModal;