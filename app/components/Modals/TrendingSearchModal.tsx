'use client';

import React, { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the TrendingSearchModal component.
 * @param isOpen - Controls the visibility of the modal.
 * @param onClose - Function to call when the modal should be closed.
 * @param onApply - Function to call with the filter values when the user clicks "Apply".
 */
export interface TrendingSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: Record<string, string>) => void;
}

// Data for rendering the filter input fields dynamically.
const filterFields = [
    { id: 'liquidity', label: 'Liquidity', unit: '$' },
    { id: 'marketCap', label: 'Market cap', unit: '' },
    { id: 'tax', label: 'Tax', unit: '%' },
    { id: 'pairAge', label: 'Pair Age', unit: 'min' },
    { id: 'txns', label: 'Txns', unit: '' },
    { id: 'buys', label: 'Buys', unit: '' },
    { id: 'sells', label: 'Sells', unit: '' },
    { id: 'volume', label: 'Volume', unit: '$' },
    { id: 'change', label: 'Change', unit: '%' },
];

/**
 * A reusable input component for a min/max range.
 * It combines two input fields into one visual block with a vertical separator.
 */
const RangeInput: FC<{
    minPlaceholder: string;
    maxPlaceholder: string;
    minValue: string;
    maxValue: string;
    onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ minPlaceholder, maxPlaceholder, minValue, maxValue, onMinChange, onMaxChange }) => (
    <div className="flex bg-[#502600] border border-[#89572c] rounded-md w-full focus-within:ring-2 focus-within:ring-yellow-600 transition">
        <input
            type="text"
            placeholder={minPlaceholder}
            value={minValue}
            onChange={onMinChange}
            className="bg-transparent px-3 py-2 w-1/2 text-white placeholder-gray-400 focus:outline-none"
        />
        <div className="border-l border-[#89572c]"></div>
        <input
            type="text"
            placeholder={maxPlaceholder}
            value={maxValue}
            onChange={onMaxChange}
            className="bg-transparent px-3 py-2 w-1/2 text-white placeholder-gray-400 focus:outline-none"
        />
    </div>
);

/**
 * SearchIcon SVG component.
 */
const SearchIcon = () => (
    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
);

/**
 * CloseIcon SVG component.
 */
const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

/**
 * TrendingSearchModal Component
 *
 * This component renders the filter selection modal based on the provided UI image.
 * It uses a dark, rich brown theme with golden accents.
 */
const TrendingSearchModal: FC<TrendingSearchModalProps> = ({ isOpen, onClose, onApply }) => {
    const [mounted, setMounted] = useState(false);
    // State to hold all filter values.
    const [filters, setFilters] = useState<Record<string, string>>({});

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

    // Handler to update a specific filter's value.
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    // Handler for the apply button.
    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 font-sans"
            onClick={onClose}
        >
            {/* Main container for the modal with the specified dark brown background and border */}
            <div
                className="bg-[rgb(49,25,0)] text-white font-sans rounded-2xl p-6 max-w-lg w-full mx-auto shadow-2xl border-2 border-[rgb(106,61,11)]/80 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-amber-100">Customize Filters</h2>
                    <div className="flex items-center space-x-4">
                         {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-[#94580a] border border-yellow-800/60 rounded-full py-2 pl-10 pr-4 text-white placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition w-40"
                            />
                        </div>
                         {/* Close Button with a rounded rectangle shape */}
                        <button onClick={onClose} className="bg-[rgb(74,38,0)] p-1.5 rounded-lg text-amber-300 hover:bg-yellow-800/80 hover:text-white transition-colors">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Header separator */}
                <div className="border-b border-yellow-800/40 my-4 -mx-6"></div>

                {/* Filter Grid */}
                <div className="space-y-3">
                    {filterFields.map(field => (
                        <div key={field.id} className="flex items-center gap-x-4">
                           {/* Labels are inline with textboxes */}
                           <label className="text-amber-100/80 text-sm font-medium min-w-[80px] text-left">
                               {field.label}
                           </label>
                           <div className="flex-1">
                               <RangeInput
                                    minPlaceholder={`min ${field.unit}`}
                                    maxPlaceholder={`max ${field.unit}`}
                                    minValue={filters[`${field.id}Min`] || ''}
                                    maxValue={filters[`${field.id}Max`] || ''}
                                    onMinChange={(e) => handleFilterChange(`${field.id}Min`, e.target.value)}
                                    onMaxChange={(e) => handleFilterChange(`${field.id}Max`, e.target.value)}
                               />
                           </div>
                        </div>
                    ))}
                </div>

                {/* Modal Footer with Action Buttons - now centered */}
                <div className="flex justify-center items-center mt-8 space-x-4">
                    <button 
                        onClick={handleApply}
                        className="bg-[#502600] border-2 border-[#6e4218] text-amber-200 font-bold py-2 px-8 rounded-lg hover:bg-[#6e4218] transition-colors"
                    >
                        Apply
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-[#502600] border-2 border-[#6e4218] text-amber-200 font-bold py-2 px-6 rounded-lg hover:bg-[#6e4218] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default TrendingSearchModal;
