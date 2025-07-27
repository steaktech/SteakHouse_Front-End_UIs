import React from 'react';

// Mock data for the new trade history format
const tradeHistoryData = [
  { id: 1, date: 'Jul 31 07:20:59', type: 'buy', amountETH: '0.034', amountPECA: '20,219,045.00', tx: '0x68a3...7404' },
  { id: 2, date: 'Jul 31 07:20:59', type: 'buy', amountETH: '0.034', amountPECA: '20,219,045.00', tx: '0x68a3...7404' },
  { id: 3, date: 'Jul 31 07:20:59', type: 'sell', amountETH: '0.567', amountPECA: '57,219,045.00', tx: '0x68a3...7404' },
  { id: 4, date: 'Jul 31 07:20:59', type: 'buy', amountETH: '0.078', amountPECA: '65,200,005.00', tx: '0x68a3...7404' },
];

export const TradeHistory: React.FC = () => {
  return (
    <div className="bg-[#190900] box-shadow-1 w-full h-full rounded-lg p-4 overflow-hidden border border-amber-600/30 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        Trade History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-amber-400">
            <tr>
              <th className="p-2 font-normal">Date</th>
              <th className="p-2 font-normal">Type</th>
              <th className="p-2 font-normal">Amount ETH</th>
              <th className="p-2 font-normal">Amount PECA</th>
              <th className="p-2 font-normal">TX</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {tradeHistoryData.map(trade => (
              <tr key={trade.id} className="hover:bg-[#3d1e01]/30">
                <td className="p-2">{trade.date}</td>
                <td className={`p-2 font-semibold ${trade.type === 'buy' ? 'text-[#29f266]' : 'text-red-400'}`}>
                  {trade.type}
                </td>
                <td className={`p-2 font-semibold ${trade.type === 'buy' ? 'text-[#29f266]' : 'text-red-400'}`}>{trade.amountETH}</td>
                <td className={`p-2 font-semibold ${trade.type === 'buy' ? 'text-[#29f266]' : 'text-red-400'}`}>{trade.amountPECA}</td>
                <td className="p-2 text-amber-400 font-mono">{trade.tx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 