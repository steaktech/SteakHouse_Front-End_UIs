import React from 'react';
import { useTokenData } from '@/app/hooks/useTokenData';
import type { Trade } from '@/app/types/token';

interface TradeHistoryProps {
  tokenAddress: string;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ tokenAddress }) => {
  const { data: tokenData, isLoading, error } = useTokenData(tokenAddress);

  // Helper functions
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(6);
  };

  const formatTxHash = (hash: string): string => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatUSD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace('$', '')) : value;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };
  return (
    <div className="bg-[#190900] box-shadow-1 w-full h-full rounded-lg p-4 overflow-hidden border border-amber-600/30 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        Trade History
      </h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <span className="ml-3 text-amber-400">Loading trades...</span>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center p-4">
          <p>Error loading trades: {error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-80 trade-history-scrollbar pr-1">
          <table className="w-full text-left text-sm">
            <thead className="text-amber-400 sticky top-0 bg-[#190900] z-10 border-b border-amber-600/30">
              <tr>
                <th className="p-2 font-normal">Date</th>
                <th className="p-2 font-normal">Type</th>
                <th className="p-2 font-normal">Amount ETH</th>
                <th className="p-2 font-normal">Amount Tokens</th>
                <th className="p-2 font-normal">USD Value</th>
                <th className="p-2 font-normal">TX</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {tokenData?.recentTrades?.map((trade: Trade, index: number) => (
                <tr key={`${trade.txHash}-${index}`} className="hover:bg-[#3d1e01]/30">
                  <td className="p-2 text-amber-400 text-xs">{formatDate(trade.timestamp)}</td>
                  <td className={`p-2 font-semibold ${trade.type === 'BUY' ? 'text-[#29f266]' : 'text-[#ff3b3b]'}`}>
                    {trade.type}
                  </td>
                  <td className={`p-2 font-semibold ${trade.type === 'BUY' ? 'text-[#29f266]' : 'text-[#ff3b3b]'}`}>
                    {formatNumber(trade.amountEth)}
                  </td>
                  <td className={`p-2 font-semibold ${trade.type === 'BUY' ? 'text-[#29f266]' : 'text-[#ff3b3b]'}`}>
                    {formatNumber(trade.amountTokens)}
                  </td>
                  <td className={`p-2 font-semibold ${trade.type === 'BUY' ? 'text-[#29f266]' : 'text-[#ff3b3b]'}`}>
                    {formatUSD(trade.usdValue)}
                  </td>
                  <td className="p-2 text-amber-400 font-mono text-xs">
                    <a 
                      href={`https://etherscan.io/tx/${trade.txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-amber-300 cursor-pointer"
                    >
                      {formatTxHash(trade.txHash)}
                    </a>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-amber-400">
                    No trades available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 