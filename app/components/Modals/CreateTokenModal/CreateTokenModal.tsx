'use client';
import React, { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';

// Helper component for form rows to keep the main component cleaner
const FormRow: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col sm:flex-row gap-4 w-full">{children}</div>
);

// Helper component for input fields
interface FormInputProps {
    label: string;
    placeholder: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    containerClassName?: string;
    type?: string;
}

const FormInput: FC<FormInputProps & { disabled?: boolean }> = ({ 
    label, 
    placeholder, 
    name, 
    value, 
    onChange, 
    containerClassName = 'w-full', 
    type = 'text',
    disabled = false 
}) => (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        <label htmlFor={name} className="text-sm text-amber-300/80 font-medium">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 placeholder-amber-400/30 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
    </div>
);

// Smaller file upload button
const FileUploadButton: FC<{ label: string; dimensions: string }> = ({ label, dimensions }) => {
    const inputId = `file-upload-${label}`;
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm text-amber-300/80 font-medium capitalize">
                {label} <span className="text-amber-400/60 font-normal">{dimensions}</span>
            </label>
            <label htmlFor={inputId} className="cursor-pointer bg-[#2a1f14] border border-amber-600/30 text-amber-200 rounded-lg focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 w-full p-2.5 h-20 flex flex-col items-center justify-center gap-1 text-center hover:bg-amber-900/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <input id={inputId} name={label} type="file" className="sr-only" />
            </label>
        </div>
    );
};

// Checkbox without the outer box
const FormCheckbox: FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => {
    return (
        <div className="flex flex-col w-full">
            <div
                className="flex items-center text-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-amber-900/10 transition-colors"
                onClick={onChange}
            >
                <div className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${checked ? 'bg-amber-500 border-amber-400' : 'bg-transparent border-amber-500/50'}`}>
                    {checked && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#411e02]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>}
                </div>
                <span className="text-sm text-amber-200">{label}</span>
            </div>
        </div>
    );
};


// The Modal Component
export interface CreateTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Add a type for the fields to allow isTextarea and fullWidth
interface SectionField {
    label: string;
    placeholder: string;
    name: string;
    value: string;
    fullWidth?: boolean;
    isTextarea?: boolean;
}

const CreateTokenModal: FC<CreateTokenModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);
    const [tokenType, setTokenType] = useState<'tax' | 'no-tax'>('tax');
    const [removeSuffix, setRemoveSuffix] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false); // State for advanced dropdown

    const [formData, setFormData] = useState({
        // Standard fields
        name: 'STEAK TOKEN',
        symbol: 'STEAK',
        supply: '10,000,000',
        startingTax: '20%',
        timeActive1: '10m',
        finalTax: '2%',
        startingMaxTx: '0.5%',
        maxTimeActive: '3m',
        finalMaxTx: '2%',
        startingMaxWallet: '0.5%',
        maxWalletTimeActive: '3m',
        finalMaxWallet: '2%',
        taxReceiver: '0x76c...4457d',
        launchDate: '2025-07-20',
        launchTime: '16:00',
        marketCap: '500,000',
        lock: false,
        lockTime: '365 days',
        burn: false,
        description: 'Steakhouse finance ($STEAK) is the heart of the ecosystem used for governance and rewards.',
        telegram: 't.me/steak',
        website: 'steak.com',
        twitter: 'x.com/steak',

        // Advanced fields
        adv_startingTax: '20%',
        adv_taxDropAmount: '-1%',
        adv_taxDropBlocks: '10',
        adv_finalTax: '5%',
        adv_taxWallet: '0x77rb3bf4y7tg.....',
        adv_startingMaxWallet: '0.5%',
        adv_maxWalletIncreaseAmount: '+0.1%',
        adv_startingMaxTx: '0.1%',
        adv_maxTxIncreaseAmount: '+0.1%',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
    };

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

                {/* Form Body - Scrollable */}
                <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8">
                    <div className="space-y-8">
                        {/* Section Wrapper */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg">Token Type</h3>
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

                        {/* Other Sections */}
                        {[
                            { title: 'Token Info', fields: [
                                { label: 'name', placeholder: 'STEAK TOKEN', name: 'name', value: formData.name },
                                { label: 'symbol', placeholder: 'STEAK', name: 'symbol', value: formData.symbol },
                                { label: 'supply', placeholder: '10,000,000', name: 'supply', value: formData.supply },
                            ] as SectionField[] },
                            { title: 'Kitchen (Virtual Curve)', fields: [
                                { label: 'starting tax', placeholder: '20%', name: 'startingTax', value: formData.startingTax },
                                { label: 'tax time active', placeholder: '10m', name: 'timeActive1', value: formData.timeActive1 },
                                { label: 'final tax', placeholder: '2%', name: 'finalTax', value: formData.finalTax },
                                { label: 'starting maxtx', placeholder: '0.5%', name: 'startingMaxTx', value: formData.startingMaxTx },
                                { label: 'max time active', placeholder: '3s', name: 'maxTimeActive', value: formData.maxTimeActive },
                                { label: 'final maxtx', placeholder: '2%', name: 'finalMaxTx', value: formData.finalMaxTx },
                                { label: 'starting maxwallet', placeholder: '0.5%', name: 'startingMaxWallet', value: formData.startingMaxWallet },
                                { label: 'maxwallet time active', placeholder: '3s', name: 'maxWalletTimeActive', value: formData.maxWalletTimeActive },
                                { label: 'final max wallet', placeholder: '2%', name: 'finalMaxWallet', value: formData.finalMaxWallet },
                                { label: 'tax reciever', placeholder: '0x...', name: 'taxReceiver', value: formData.taxReceiver, fullWidth: true },
                            ] as SectionField[] },
                            { title: 'Launch DateTime', fields: [] as SectionField[] },
                            { title: 'Graduation Market Cap', fields: [
                                { label: 'market cap', placeholder: '$ 500,000', name: 'marketCap', value: formData.marketCap },
                            ] as SectionField[] },
                            { title: 'Liquidity', fields: [
                            ] as SectionField[] },
                            { title: 'Metadata and Socials', fields: [
                                { label: 'token description', placeholder: 'Your token description...', name: 'description', value: formData.description, fullWidth: true, isTextarea: true },
                                { label: 'telegram', placeholder: 't.me/yourgroup', name: 'telegram', value: formData.telegram },
                                { label: 'website', placeholder: 'yourdomain.com', name: 'website', value: formData.website },
                                { label: 'x / twitter', placeholder: 'x.com/yourprofile', name: 'twitter', value: formData.twitter },
                            ] as SectionField[] },
                        ].map(section => (
                            <div key={section.title} className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6 first:border-t-0 first:pt-0">
                                <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap">{section.title}</h3>
                                <div className="w-full md:w-3/4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {section.fields.map(field => (
                                            field.isTextarea ? (
                                                <div key={field.name} className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                                                    <label htmlFor={field.name} className="text-sm text-amber-300/80 font-medium">{field.label}</label>
                                                    <textarea
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.value}
                                                        onChange={handleInputChange}
                                                        placeholder={field.placeholder}
                                                        rows={3}
                                                        className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 placeholder-amber-400/30"
                                                    />
                                                </div>
                                            ) : (
                                                <FormInput
                                                    key={field.name}
                                                    label={field.label}
                                                    placeholder={field.placeholder}
                                                    name={field.name}
                                                    value={field.value}
                                                    onChange={handleInputChange}
                                                    containerClassName={field.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}
                                                    disabled={field.name === 'finalTax' && tokenType === 'no-tax'}
                                                />
                                            )
                                        ))}
                                    </div>

                                    {section.title === 'Launch DateTime' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm text-amber-300/80 font-medium">Launch Date</label>
                                                <input
                                                    type="date"
                                                    name="launchDate"
                                                    value={formData.launchDate}
                                                    onChange={handleInputChange}
                                                    className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 date-input-custom"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm text-amber-300/80 font-medium">Launch Time</label>
                                                <input
                                                    type="time"
                                                    name="launchTime"
                                                    value={formData.launchTime}
                                                    onChange={handleInputChange}
                                                    className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 time-input-custom"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.title === 'Metadata and Socials' && (
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <FileUploadButton label="logo" dimensions="500 x 500 px" />
                                            <FileUploadButton label="banner" dimensions="1500 x 500 px" />
                                            <FormCheckbox
                                                label="remove ...StEaK suffix"
                                                checked={removeSuffix}
                                                onChange={() => setRemoveSuffix(prev => !prev)}
                                            />
                                        </div>
                                    )}
                                    
                                    {section.title === 'Kitchen (Virtual Curve)' && (
                                        <div className="mt-6 border-t border-amber-800/30 pt-6">
                                            <button
                                                onClick={() => setIsAdvancedOpen(prev => !prev)}
                                                className="w-full flex justify-between items-center text-lg font-bold text-amber-300 hover:text-amber-100 transition-colors py-2"
                                            >
                                                <span>[ADVANCED]</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {isAdvancedOpen && (
                                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <FormInput label="Starting TAX" name="adv_startingTax" value={formData.adv_startingTax} placeholder="20%" onChange={handleInputChange} />
                                                    <FormInput label="Tax Drop" name="adv_taxDropAmount" value={formData.adv_taxDropAmount} placeholder="-1%" onChange={handleInputChange} />
                                                    <FormInput label="Final TAX" name="adv_finalTax" value={formData.adv_finalTax} placeholder="5%" onChange={handleInputChange} />
                                                    <FormInput label="TAX wallet" name="adv_taxWallet" value={formData.adv_taxWallet} placeholder="0x..." onChange={handleInputChange} containerClassName="sm:col-span-2 lg:col-span-3" />
                                                    <FormInput label="Starting max wallet" name="adv_startingMaxWallet" value={formData.adv_startingMaxWallet} placeholder="0.5%" onChange={handleInputChange} />
                                                    <FormInput label="Max wallet increase" name="adv_maxWalletIncreaseAmount" value={formData.adv_maxWalletIncreaseAmount} placeholder="+0.1%" onChange={handleInputChange} />
                                                    <FormInput label="Starting maxTX" name="adv_startingMaxTx" value={formData.adv_startingMaxTx} placeholder="0.1%" onChange={handleInputChange} />
                                                    <FormInput label="maxTX increase" name="adv_maxTxIncreaseAmount" value={formData.adv_maxTxIncreaseAmount} placeholder="+0.1%" onChange={handleInputChange} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {section.title === 'Liquidity' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormCheckbox
                                                label="Lock liquidity"
                                                checked={formData.lock as boolean}
                                                onChange={() => handleCheckboxChange('lock')}
                                            />
                                            <FormCheckbox
                                                label="Burn liquidity"
                                                checked={formData.burn as boolean}
                                                onChange={() => handleCheckboxChange('burn')}
                                            />
                                            {/* Only show lock time if lock is checked */}
                                            {formData.lock && (
                                                <FormInput
                                                    label="lock time"
                                                    placeholder="365 days"
                                                    name="lockTime"
                                                    value={formData.lockTime as string}
                                                    onChange={handleInputChange}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>


                </div>

                {/* Footer */}
                <div className="bg-[#6e3e12] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/images/fuel-icon.png" alt="Fuel" className="w-12 h-12" />
                        <div className="text-xs text-amber-300/80">
                            <p><span className="font-semibold text-amber-200">GWEI:</span> 2 <span className="font-semibold text-amber-200 ml-2">Token Creation Fee:</span> $3</p>
                            <p><span className="font-semibold text-amber-200">Cost:</span> $8 <span className="font-semibold text-amber-200 ml-2">Remove Suffix:</span> $5</p>
                            <p className="font-bold text-amber-200 mt-1">TOTAL COST: 0.0054 ETH</p>
                        </div>
                    </div>
                    <button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-[#3a2d1d] font-bold py-3 px-12 rounded-lg transition-all duration-300 shadow-lg shadow-amber-900/50">
                        Confirm
                    </button>
                </div>
            </div>
            {/* Styles for the custom scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #2a1f14;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #d97706;
                    border-radius: 10px;
                    border: 2px solid #2a1f14;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #d97706 #2a1f14;
                }
                
                /* Custom styles for date input */
                .date-input-custom::-webkit-calendar-picker-indicator {
                    filter: invert(0.8) sepia(1) saturate(5) hue-rotate(20deg) brightness(0.8);
                    cursor: pointer;
                    opacity: 0.7;
                }
                
                .date-input-custom::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
                
                /* Custom styles for time input */
                .time-input-custom::-webkit-calendar-picker-indicator {
                    filter: invert(0.8) sepia(1) saturate(5) hue-rotate(20deg) brightness(0.8);
                    cursor: pointer;
                    opacity: 0.7;
                }
                
                .time-input-custom::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
                
                /* Override default focus styles */
                input[type="date"]:focus, input[type="time"]:focus {
                    color: #fcd34d;
                    border-color: #d97706;
                }
                
                /* For Firefox */
                input[type="date"], input[type="time"] {
                    color-scheme: dark;
                }
            `}</style>
        </div>
    );

    return createPortal(
        modalContent,
        document.body
    );
};

export default CreateTokenModal;