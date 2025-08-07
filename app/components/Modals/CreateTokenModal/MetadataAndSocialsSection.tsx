'use client';
import React, { FC } from 'react';
import { FormInput, FileUploadButton, FormCheckbox } from './FormComponents';
import { InfoIcon } from './InfoIcon';
import Image from 'next/image';

interface MetadataAndSocialsSectionProps {
    formData: {
        description: string;
        telegram: string;
        website: string;
        twitter: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    removeSuffix: boolean;
    setRemoveSuffix: (value: boolean) => void;
}

export const MetadataAndSocialsSection: FC<MetadataAndSocialsSectionProps> = ({ 
    formData, 
    handleInputChange, 
    removeSuffix, 
    setRemoveSuffix 
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
                <Image 
                    src="/images/modal-icons/metadata-website-webp.webp" 
                    alt="Token Type" 
                    width={30} 
                    height={30} 
                    className="inline-block"
                /> Metadata & Socials
                <InfoIcon 
                    title="Metadata & Socials"
                    content="Add your website and social links, upload a banner and logo, and write a short description. Let your community know who you are and why you're cooking."
                />
            </h3>
            <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Token Description - Full Width */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                        <label htmlFor="description" className="text-sm text-amber-300/80 font-medium">token description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Your token description..."
                            rows={3}
                            className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 placeholder-amber-400/30"
                        />
                    </div>
                    
                    {/* Social Links */}
                    <FormInput 
                        label="telegram" 
                        placeholder="t.me/yourgroup" 
                        name="telegram" 
                        value={formData.telegram} 
                        onChange={handleInputChange} 
                    />
                    <FormInput 
                        label="website" 
                        placeholder="yourdomain.com" 
                        name="website" 
                        value={formData.website} 
                        onChange={handleInputChange} 
                    />
                    <FormInput 
                        label="x / twitter" 
                        placeholder="x.com/yourprofile" 
                        name="twitter" 
                        value={formData.twitter} 
                        onChange={handleInputChange} 
                    />
                </div>

                {/* File Uploads and Remove Suffix */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FileUploadButton label="logo" dimensions="500 x 500 px" />
                    <FileUploadButton label="banner" dimensions="1500 x 500 px" />
                    <FormCheckbox
                        label="remove steak header"
                        checked={removeSuffix}
                        onChange={() => setRemoveSuffix(!removeSuffix)}
                    />
                </div>
            </div>
        </div>
    );
};