import React from 'react';
import { MobileTradeHistoryTable } from './MobileTradeHistoryTable';
import type { FullTokenDataResponse, Trade } from '@/app/types/token';

interface TradeHistoryProps {
  tokenAddress?: string;
  tokenData?: FullTokenDataResponse | null;
  trades?: Trade[];
  isLoading?: boolean;
  error?: string | null;
  showToggle?: boolean;
  showLimitOrders?: boolean;
  onToggleChange?: (showLimitOrders: boolean) => void;
  isMobile?: boolean;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({
  tokenAddress,
  tokenData,
  trades,
  isLoading,
  error,
  // The following props are not used by MobileTradeHistoryTable but are kept for interface compatibility
  showToggle,
  showLimitOrders,
  onToggleChange,
  isMobile
}) => {
  return (
    <MobileTradeHistoryTable
      tokenAddress={tokenAddress}
      tokenData={tokenData}
      trades={trades}
      isLoading={isLoading}
      error={error}
      transparent={true}
      disableScroll={true}
    />
  );
};
