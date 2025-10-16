'use client';

import React, { useState, useEffect, FC, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './TrendingSearchModal.module.css';
import {
    TrendingSearchModalProps,
    FilterField,
    NumberInputFieldProps,
    SearchModalState,
    StepperUtils,
    ModalEventHandlers,
    FilterValues,
    MODAL_CONSTANTS,
    ValidationResult,
    StepperKeyEvent
} from './types';

// Data for rendering the filter input fields dynamically
const filterFields: FilterField[] = [
    { id: 'age_hours', label: 'Age', unit: 'hrs', step: MODAL_CONSTANTS.DEFAULT_STEP },
    { id: 'liquidity', label: 'Liquidity', unit: '$', step: '1000' },
    { id: 'volume', label: 'Volume', unit: '$', step: '1000' },
    { id: 'marketcap', label: 'Market Cap', unit: '$', step: '1000' },
    { id: 'tax', label: 'Tax', unit: '%', step: MODAL_CONSTANTS.DECIMAL_STEP },
    { id: 'price_change', label: 'Price Change', unit: '%', step: MODAL_CONSTANTS.DECIMAL_STEP },
];

/**
 * Utility functions for stepper calculations
 */
const createStepperUtils = (value: string, step: string, onChange: (value: string) => void): StepperUtils => {
    const stepDecimals = (stepValue: number): number => {
        if (!isFinite(stepValue) || stepValue <= 0) return 0;
        const s = String(stepValue);
        if (s.includes('e') || s.includes('E')) {
            const n = Number(stepValue);
            const parts = n.toString().split('.');
            return parts[1]?.length ?? 0;
        }
        const idx = s.indexOf('.');
        return idx === -1 ? 0 : s.length - idx - 1;
    };

    const snapToStep = (value: number, stepValue: number, base = 0): number => {
        const d = stepDecimals(stepValue);
        const m = 10 ** d;
        const v = Math.round((Number(value) - base) * m);
        const s = Math.round(Number(stepValue) * m);
        if (s === 0) return Number(value);
        const q = Math.round(v / s);
        return (q * s) / m + base;
    };

    const formatValue = (val: number, stepValue: number): string => {
        const d = stepDecimals(stepValue);
        const clean = Math.abs(val) < 1e-12 ? 0 : val;
        return clean.toFixed(d);
    };

    const computeNext = (direction: 'up' | 'down', multiplier = 1): string => {
        const stepValue = Number(step) > 0 ? Number(step) : 1;
        const current = value === '' ? 0 : Number(value);
        const sign = direction === 'up' ? 1 : -1;
        
        if ((current <= 0 || Math.abs(current) < 1e-12) && sign < 0) {
            return formatValue(0, stepValue);
        }
        
        let target = current + sign * stepValue * multiplier;
        target = snapToStep(target, stepValue, 0);
        
        // Clamp to minimum 0
        if (target < 0) target = 0;
        
        return formatValue(target, stepValue);
    };

    return {
        stepDecimals,
        snapToStep,
        formatValue,
        computeNext
    };
};

/**
 * Validate input value
 */
const validateInput = (value: string, min?: string, max?: string): ValidationResult => {
    const numValue = Number(value);
    
    if (value.trim() === '') {
        return { isValid: true, sanitizedValue: '' };
    }
    
    if (isNaN(numValue)) {
        return { 
            isValid: false, 
            errorMessage: 'Please enter a valid number',
            sanitizedValue: ''
        };
    }
    
    if (min !== undefined && numValue < Number(min)) {
        return { 
            isValid: false, 
            errorMessage: `Value must be at least ${min}`,
            sanitizedValue: min
        };
    }
    
    if (max !== undefined && numValue > Number(max)) {
        return { 
            isValid: false, 
            errorMessage: `Value must be at most ${max}`,
            sanitizedValue: max
        };
    }
    
    return { isValid: true, sanitizedValue: value };
};

/**
 * Number input field with steppers
 */
const NumberInputField: FC<NumberInputFieldProps> = ({ 
    value, 
    onChange, 
    placeholder, 
    unit, 
    step, 
    ariaLabel,
    min = "0",
    max,
    disabled = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isPressing = useRef(false);

    // Create stepper utilities
    const stepperUtils = createStepperUtils(value, step, onChange);

    const handleInputChange = useCallback((inputValue: string) => {
        const validation = validateInput(inputValue, min, max);
        if (validation.isValid) {
            onChange(inputValue);
        } else if (validation.sanitizedValue !== undefined) {
            onChange(validation.sanitizedValue);
        }
    }, [onChange, min, max]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key as StepperKeyEvent;
        if (key !== 'ArrowUp' && key !== 'ArrowDown') return;
        
        e.preventDefault();
        if (disabled) return;
        
        const direction = key === 'ArrowUp' ? 'up' : 'down';
        const multiplier = e.shiftKey ? MODAL_CONSTANTS.SHIFT_MULTIPLIER : 1;
        const newValue = stepperUtils.computeNext(direction, multiplier);
        handleInputChange(newValue);
    }, [disabled, stepperUtils, handleInputChange]);

    const pressStart = useCallback((direction: 'up' | 'down') => {
        if (isPressing.current || disabled) return;
        
        isPressing.current = true;
        const newValue = stepperUtils.computeNext(direction, 1);
        handleInputChange(newValue);
        
        timerRef.current = setInterval(() => {
            const nextValue = stepperUtils.computeNext(direction, 1);
            handleInputChange(nextValue);
        }, MODAL_CONSTANTS.STEPPER_INTERVAL);
    }, [disabled, stepperUtils, handleInputChange]);

    const pressEnd = useCallback(() => {
        if (!isPressing.current) return;
        
        isPressing.current = false;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.field}>
        <input
                ref={inputRef}
                className={styles.input}
                type="number"
                step={step}
                min={min}
                max={max}
                placeholder={placeholder}
                aria-label={ariaLabel}
                value={value}
                disabled={disabled}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {unit && <span className={styles.suffix}>{unit}</span>}
            <div className={styles.steppers}>
                <StepperButton
                    direction="up"
                    onPress={pressStart}
                    disabled={disabled}
                    onPointerEnd={pressEnd}
                />
                <StepperButton
                    direction="down"
                    onPress={pressStart}
                    disabled={disabled}
                    onPointerEnd={pressEnd}
                />
            </div>
    </div>
);
};

/**
 * Stepper button component
 */
const StepperButton: FC<{
    direction: 'up' | 'down';
    onPress: (direction: 'up' | 'down') => void;
    onPointerEnd: () => void;
    disabled?: boolean;
}> = ({ direction, onPress, onPointerEnd, disabled = false }) => {
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (disabled) return;
        
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onPress(direction);
    }, [direction, onPress, disabled]);

    const iconPath = direction === 'up' 
        ? "M6 14l6-6 6 6" 
        : "M6 10l6 6 6-6";

    return (
        <div
            className={styles.step}
            onPointerDown={handlePointerDown}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onPointerLeave={onPointerEnd}
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            <svg viewBox="0 0 24 24">
                <path
                    d={iconPath}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                />
    </svg>
        </div>
);
};

/**
 * Custom hook for modal state management
 */
const useModalState = (onClose: () => void, onClearAll?: () => void): SearchModalState & ModalEventHandlers => {
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState<FilterValues>({});
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleFilterChange = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSearchChange = useCallback((newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
    }, []);

    const handleApply = useCallback(() => {
        const payload: FilterValues = {};
        
        // Convert filter values to the format expected by the API
        Object.entries(filters).forEach(([key, value]) => {
            if (value.trim()) {
                // Convert field names to API format
                if (key.endsWith('Min')) {
                    const fieldName = key.replace('Min', '');
                    const apiKey = `min_${fieldName}`;
                    payload[apiKey] = value;
                } else if (key.endsWith('Max')) {
                    const fieldName = key.replace('Max', '');
                    const apiKey = `max_${fieldName}`;
                    payload[apiKey] = value;
                } else {
                    payload[key] = value;
                }
            }
        });
        
        console.log('Apply filters:', payload);
        return payload;
    }, [filters]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleClearFilters = useCallback(() => {
        setFilters({});
        if (onClearAll) {
            onClearAll();
            onClose();
        }
    }, [onClearAll, onClose]);

    return {
        mounted,
        filters,
        searchTerm,
        handleFilterChange,
        handleApply,
        handleCancel,
        handleClearFilters,
        handleSearchChange
    };
};

/**
 * Filter the fields based on search term
 */
const useFilteredFields = (searchTerm: string): FilterField[] => {
    return useMemo(() => {
        if (!searchTerm.trim()) {
            return filterFields;
        }
        
        return filterFields.filter(field =>
            field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            field.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);
};

/**
 * TrendingSearchModal Component
 *
 * This component renders the filter selection modal based on the exact reference design.
 */
const TrendingSearchModal: FC<TrendingSearchModalProps> = ({ isOpen, onClose, onApply, onClearAll }) => {
    const {
        mounted,
        filters,
        searchTerm,
        handleFilterChange,
        handleApply,
        handleCancel,
        handleClearFilters,
        handleSearchChange
    } = useModalState(onClose, onClearAll);

    const filteredFields = useFilteredFields(searchTerm);

    const onApplyWithCallback = useCallback(() => {
        const payload = handleApply();
        onApply(payload);
        onClose();
    }, [handleApply, onApply, onClose]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className={styles.root} onClick={onClose}>
            <section
                className={styles.modal}
                role="dialog"
                aria-labelledby="modal-title"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <header className={styles.header}>
                    <div className={styles.title} id="modal-title">
                        <span className={styles.dot}></span>
                        Customize Filters
                            </div>
                    <div className={styles.search} role="search">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                            <input
                            aria-label="Search"
                            type="search"
                                placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    <button
                        className={styles.iconBtn}
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                        </button>
                </header>

                <div className={styles.content}>
                    <div className={styles.grid}>
                        {filteredFields.map(field => (
                            <React.Fragment key={field.id}>
                                <div className={styles.label}>{field.label}</div>
                                <div className={styles.range}>
                                    <NumberInputField
                                        value={filters[`${field.id}Min`] || ''}
                                        onChange={(value) => handleFilterChange(`${field.id}Min`, value)}
                                        placeholder="min"
                                        unit={field.unit}
                                        step={field.step}
                                        ariaLabel={`${field.label} min`}
                                    />
                                    <NumberInputField
                                        value={filters[`${field.id}Max`] || ''}
                                        onChange={(value) => handleFilterChange(`${field.id}Max`, value)}
                                        placeholder="max"
                                        unit={field.unit}
                                        step={field.step}
                                        ariaLabel={`${field.label} max`}
                                    />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button 
                        className={`${styles.btn} ${styles.btnGhost}`} 
                        type="button" 
                        onClick={handleClearFilters}
                    >
                        Clear All
                    </button>
                    <div className="flex gap-2">
                        <button 
                            className={`${styles.btn} ${styles.btnGhost}`} 
                            type="button" 
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button 
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            type="button"
                            onClick={onApplyWithCallback}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default TrendingSearchModal;
