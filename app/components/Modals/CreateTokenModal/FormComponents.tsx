'use client';
import React, { FC } from 'react';

// Helper component for form rows to keep the main component cleaner
export const FormRow: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col sm:flex-row gap-4 w-full">{children}</div>
);

// Helper component for input fields
export interface FormInputProps {
    label: string;
    placeholder: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    containerClassName?: string;
    type?: string;
    disabled?: boolean;
}

export const FormInput: FC<FormInputProps> = ({ 
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
export const FileUploadButton: FC<{ label: string; dimensions: string }> = ({ label, dimensions }) => {
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
export const FormCheckbox: FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => {
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

// Option box (radio button style) for mutually exclusive options
export const FormOptionBox: FC<{ label: string; selected: boolean; onChange: () => void; }> = ({ label, selected, onChange }) => {
    return (
        <div className="flex flex-col w-full">
            <div
                className="flex items-center text-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-amber-900/10 transition-colors"
                onClick={onChange}
            >
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? 'bg-amber-500 border-amber-400' : 'bg-transparent border-amber-500/50'}`}>
                    {selected && <div className="w-3 h-3 rounded-full bg-[#411e02]" />}
                </div>
                <span className="text-sm text-amber-200">{label}</span>
            </div>
        </div>
    );
};