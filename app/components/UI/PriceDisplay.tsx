// components/UI/PriceDisplay.tsx

import React from 'react';
import { useBasicPriceData } from '@/app/hooks/usePriceData';

interface PriceDisplayProps {
  /** Whether to show the price data */
  enabled?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Show loading state */
  showLoading?: boolean;
}

/**
 * Reusable component for displaying current gas price and ETH value
 * Can be used anywhere in the application
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  enabled = true,
  className = '',
  orientation = 'horizontal',
  showLoading = true,
}) => {
  const { formattedGasPrice, formattedEthPrice, loading, error } = useBasicPriceData(enabled);

  if (!enabled) return null;

  if (error && !formattedGasPrice && !formattedEthPrice) {
    return (
      <div className={`text-red-400 text-sm ${className}`}>
        Failed to load price data
      </div>
    );
  }

  if (loading && showLoading) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        Loading prices...
      </div>
    );
  }

  const containerClass = orientation === 'vertical' 
    ? 'flex flex-col gap-2' 
    : 'flex gap-4 items-center';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg text-sm">
        <span>⛽ Gas:</span>
        <span>{formattedGasPrice}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="inline">
          <path d="M12 1.75l-6.25 10.5L12 16l6.25-3.75L12 1.75zM5.75 13.5L12 22.25l6.25-8.75L12 17.25 5.75 13.5z"/>
        </svg>
        <span>ETH: {formattedEthPrice}</span>
      </div>
    </div>
  );
};

export default PriceDisplay;
