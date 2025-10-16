/**
 * Types and interfaces for the TrendingSearchModal component
 */

import { ReactNode } from 'react';

/**
 * Props for the TrendingSearchModal component
 */
export interface TrendingSearchModalProps {
    /** Controls the visibility of the modal */
    isOpen: boolean;
    /** Function to call when the modal should be closed */
    onClose: () => void;
    /** Function to call with the filter values when the user clicks "Apply" */
    onApply: (filters: FilterValues) => void;
    /** Function to call when the user clicks "Clear All" to reset all filters */
    onClearAll?: () => void;
}

/**
 * Configuration for a filter field
 */
export interface FilterField {
    /** Unique identifier for the filter field */
    id: string;
    /** Display label for the filter field */
    label: string;
    /** Unit symbol to display (e.g., '$', '%', 'min') */
    unit: string;
    /** Step value for number inputs */
    step: string;
    /** Optional description for the filter field */
    description?: string;
}

/**
 * Props for the NumberInputField component
 */
export interface NumberInputFieldProps {
    /** Current value of the input field */
    value: string;
    /** Callback function when the value changes */
    onChange: (value: string) => void;
    /** Placeholder text for the input */
    placeholder: string;
    /** Unit symbol to display (optional) */
    unit?: string;
    /** Step value for number increments */
    step: string;
    /** Aria label for accessibility */
    ariaLabel: string;
    /** Minimum allowed value (optional) */
    min?: string;
    /** Maximum allowed value (optional) */
    max?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
}

/**
 * Props for the StepperButton component
 */
export interface StepperButtonProps {
    /** Direction of the stepper (up or down) */
    direction: 'up' | 'down';
    /** Callback function when the stepper is pressed */
    onPress: (direction: 'up' | 'down') => void;
    /** Whether the stepper is disabled */
    disabled?: boolean;
    /** Custom CSS class name */
    className?: string;
}

/**
 * Filter values object structure
 */
export type FilterValues = Record<string, string>;

/**
 * Filter range structure for min/max values
 */
export interface FilterRange {
    min?: string;
    max?: string;
}

/**
 * Complete filter state structure
 */
export interface FilterState {
    liquidity: FilterRange;
    marketCap: FilterRange;
    tax: FilterRange;
    pairAge: FilterRange;
    txns: FilterRange;
    volume: FilterRange;
    change: FilterRange;
}

/**
 * Search modal state interface
 */
export interface SearchModalState {
    /** Whether the modal is mounted */
    mounted: boolean;
    /** Current filter values */
    filters: FilterValues;
    /** Search term for filtering fields */
    searchTerm: string;
}

/**
 * Stepper utility functions interface
 */
export interface StepperUtils {
    /** Calculate decimal places for a step value */
    stepDecimals: (stepValue: number) => number;
    /** Snap value to nearest step */
    snapToStep: (value: number, stepValue: number, base?: number) => number;
    /** Format value with proper decimal places */
    formatValue: (val: number, stepValue: number) => string;
    /** Compute next value based on direction and multiplier */
    computeNext: (direction: 'up' | 'down', multiplier?: number) => string;
}

/**
 * Modal event handlers interface
 */
export interface ModalEventHandlers {
    /** Handle filter value changes */
    handleFilterChange: (key: string, value: string) => void;
    /** Handle apply button click - returns the filter payload */
    handleApply: () => FilterValues;
    /** Handle cancel button click */
    handleCancel: () => void;
    /** Handle clear all filters button click */
    handleClearFilters: () => void;
    /** Handle search term changes */
    handleSearchChange: (searchTerm: string) => void;
}

/**
 * Theme color values used in the modal
 */
export interface ModalTheme {
    background: string;
    panel: string;
    panel2: string;
    accent: string;
    accent2: string;
    text: string;
    muted: string;
    line: string;
    shadowLg: string;
    focus: string;
}

/**
 * Modal size configuration
 */
export interface ModalSize {
    width: number;
    height: number;
    maxWidth: string;
    maxHeight: string;
}

/**
 * Responsive breakpoints
 */
export interface Breakpoints {
    mobile: number;
    tablet: number;
    desktop: number;
    largeDesktop: number;
}

/**
 * Configuration constants
 */
export const MODAL_CONSTANTS = {
    /** Default step interval for stepper hold action (ms) */
    STEPPER_INTERVAL: 160,
    /** Multiplier when shift key is held */
    SHIFT_MULTIPLIER: 10,
    /** Default step value for inputs */
    DEFAULT_STEP: '1',
    /** Decimal step value for percentage inputs */
    DECIMAL_STEP: '0.1',
} as const;

/**
 * Filter field categories
 */
export enum FilterCategory {
    FINANCIAL = 'financial',
    VOLUME = 'volume',
    TIME = 'time',
    PERCENTAGE = 'percentage',
}

/**
 * Input validation result
 */
export interface ValidationResult {
    /** Whether the input is valid */
    isValid: boolean;
    /** Error message if invalid */
    errorMessage?: string;
    /** Sanitized value */
    sanitizedValue?: string;
}

/**
 * Keyboard event types for stepper controls
 */
export type StepperKeyEvent = 'ArrowUp' | 'ArrowDown';

/**
 * Pointer event types for stepper controls
 */
export type StepperPointerEvent = 'pointerdown' | 'pointerup' | 'pointercancel' | 'pointerleave';

/**
 * Modal animation states
 */
export enum ModalAnimationState {
    ENTERING = 'entering',
    ENTERED = 'entered',
    EXITING = 'exiting',
    EXITED = 'exited',
}
