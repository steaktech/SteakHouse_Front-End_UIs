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

const FormInput: FC<FormInputProps> = ({ label, placeholder, name, value, onChange, containerClassName = 'w-full', type = 'text' }) => (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        <label htmlFor={name} className="text-sm text-amber-300/80 font-medium">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 placeholder-amber-400/30"
        />
    </div>
);

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
    const [formData, setFormData] = useState({
        name: 'STEAK TOKEN',
        symbol: 'STEAK',
        supply: '10,000,000',
        startingTax: '20%',
        timeActive1: '10m',
        maxWallet: '0.5%',
        timeActive2: '3s',
        finalTax: '2%',
        maxTx: '0.1%',
        taxReceiver: '0x76c...4457d',
        launchDate: '20/09/2023',
        launchTime: '16:00',
        marketCap: '500,000',
        lock: '100%',
        lockTime: '365 days',
        burn: '0%',
        description: 'Steakhouse finance ($STEAK) is the heart of the ecosystem used for governance and rewards.',
        telegram: 't.me/steak',
        website: 'steak.com',
        twitter: 'x.com/steak',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                                { label: 'time active', placeholder: '10m', name: 'timeActive1', value: formData.timeActive1 },
                                { label: 'max wallet', placeholder: '0.5%', name: 'maxWallet', value: formData.maxWallet },
                                { label: 'time active', placeholder: '3s', name: 'timeActive2', value: formData.timeActive2 },
                                { label: 'final tax', placeholder: '2%', name: 'finalTax', value: formData.finalTax },
                                { label: 'max tx', placeholder: '0.1%', name: 'maxTx', value: formData.maxTx },
                                { label: 'tax reciever', placeholder: '0x...', name: 'taxReceiver', value: formData.taxReceiver, fullWidth: true },
                            ] as SectionField[] },
                            { title: 'Launch DateTime', fields: [
                                { label: 'date: DD/MM/YYYY', placeholder: '20/09/2023', name: 'launchDate', value: formData.launchDate },
                                { label: 'time: HH/MM', placeholder: '16:00', name: 'launchTime', value: formData.launchTime },
                            ] as SectionField[] },
                            { title: 'Graduation Market Cap', fields: [
                                { label: 'market cap', placeholder: '$ 500,000', name: 'marketCap', value: formData.marketCap },
                            ] as SectionField[] },
                            { title: 'Liquidity', fields: [
                                { label: 'lock', placeholder: '100%', name: 'lock', value: formData.lock },
                                { label: 'lock time', placeholder: '365 days', name: 'lockTime', value: formData.lockTime },
                                { label: 'burn', placeholder: '0%', name: 'burn', value: formData.burn },
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
                                <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="bg-[#6e3e12] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-amber-300/80">
                        <p><span className="font-semibold text-amber-200">GWEI:</span> 2 <span className="font-semibold text-amber-200 ml-2">Token Creation Fee:</span> $3</p>
                        <p><span className="font-semibold text-amber-200">Cost:</span> $8 <span className="font-semibold text-amber-200 ml-2">Remove Suffix:</span> $5</p>
                        <p className="font-bold text-amber-200 mt-1">TOTAL COST: 0.0054 ETH</p>
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
            `}</style>
        </div>
    );

    return createPortal(
        modalContent,
        document.body
    );
};

export default CreateTokenModal;
