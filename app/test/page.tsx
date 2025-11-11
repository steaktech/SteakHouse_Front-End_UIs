"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Use environment variable for WebSocket URL
const BACKEND_URL = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL || "http://localhost:3000";

interface TokenInfo {
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  virtualEth: number;
}

interface Trade {
  type: "BUY" | "SELL";
  name: string;
  symbol: string;
  total_supply: number;
  amountEth: number;
  amountTokens: number;
  price: number;
  marketCap: number;
  circulatingSupply: number;
  virtualEth: number;
  txHash: string;
}

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TokenPage() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load history when token changes
  useEffect(() => {
    if (!selectedToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    fetch(`${apiUrl}/token/${selectedToken}/chart?timeframe=1m&limit=100`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched history:", data);
        setCandles(data.candles || []);
        setTrades(data.trades || []);

        if (data.trades && data.trades.length > 0) {
          const latest = data.trades[0];
          setTokenInfo({
            name: latest.name,
            symbol: latest.symbol,
            price: latest.price,
            marketCap: latest.marketCap,
            circulatingSupply: latest.circulatingSupply,
            totalSupply: latest.total_supply,
            virtualEth: latest.virtualEth,
          });
        }
      })
      .catch((err) => console.error("Failed to fetch chart history:", err));
  }, [selectedToken]);

  // WebSocket subscription
  useEffect(() => {
    if (!selectedToken) return;

    console.log("Connecting to WebSocket:", BACKEND_URL);
    const s = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    
    setSocket(s);

    // Connection handlers
    s.on("connect", () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
      s.emit("subscribe", selectedToken.toLowerCase());
      console.log("Subscribed to token:", selectedToken.toLowerCase());
    });

    s.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    s.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    });

    // Trade handler
    s.on("trade", (trade: Trade) => {
      console.log("New trade received:", trade);
      setTrades((prev) => [trade, ...prev].slice(0, 50));

      // Update token info on new trades
      setTokenInfo({
        name: trade.name,
        symbol: trade.symbol,
        price: trade.price,
        marketCap: trade.marketCap,
        circulatingSupply: trade.circulatingSupply,
        totalSupply: trade.total_supply,
        virtualEth: trade.virtualEth,
      });
    });

    // Chart update handler
    s.on("chartUpdate", ({ timeframe, candle }: { timeframe: string; candle: Candle }) => {
      console.log("Chart update received:", timeframe, candle);
      setCandles((prev) => {
        const idx = prev.findIndex((c) => c.timestamp === candle.timestamp);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = candle;
          return updated;
        }
        return [...prev, candle];
      });
    });

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (selectedToken) {
        s.emit("unsubscribe", selectedToken.toLowerCase());
      }
      s.disconnect();
    };
  }, [selectedToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedToken(searchInput.trim());
      setCandles([]);
      setTrades([]);
      setTokenInfo(null);
    }
  };

  const handleBack = () => {
    if (socket && selectedToken) {
      socket.emit("unsubscribe", selectedToken.toLowerCase());
      socket.disconnect();
    }
    setSelectedToken(null);
    setCandles([]);
    setTrades([]);
    setTokenInfo(null);
    setSocket(null);
    setIsConnected(false);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">WebSocket Test Page</h1>
        <p className="text-sm text-gray-600">WebSocket URL: {BACKEND_URL}</p>
        {selectedToken && (
          <p className="text-sm">
            Connection Status: 
            <span className={`ml-2 font-semibold ${isConnected ? "text-green-600" : "text-red-600"}`}>
              {isConnected ? "Connected ✓" : "Disconnected ✗"}
            </span>
          </p>
        )}
      </div>

      {!selectedToken ? (
        // Search form
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter token address (e.g., 0x1234...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full max-w-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded transition-colors"
            >
              Load
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Enter a token address to start receiving real-time updates
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Token: {selectedToken}</h2>
              <p className="text-xs text-gray-500">{selectedToken}</p>
            </div>
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Token Info */}
          {tokenInfo && (
            <div className="my-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-white border p-4 rounded-lg shadow">
              <div>
                <span className="font-semibold text-gray-700">Name:</span> {tokenInfo.name} ({tokenInfo.symbol})
              </div>
              <div>
                <span className="font-semibold text-gray-700">Price:</span> ${parseFloat(tokenInfo.price.toString()).toFixed(6)}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Market Cap:</span> ${Number(tokenInfo.marketCap).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Circ. Supply:</span> {Number(tokenInfo.circulatingSupply).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Supply:</span> {Number(tokenInfo.totalSupply).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Virtual ETH (POL):</span> {Number(tokenInfo.virtualEth).toLocaleString()}
              </div>
            </div>
          )}

          {/* Chart Data */}
          <div className="my-4 bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Candle Data (1m) - {candles.length} candles</h3>
            {candles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Time</th>
                      <th className="p-2 text-right">Open</th>
                      <th className="p-2 text-right">High</th>
                      <th className="p-2 text-right">Low</th>
                      <th className="p-2 text-right">Close</th>
                      <th className="p-2 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candles.slice(0, 10).map((candle, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(candle.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2 text-right font-mono">${candle.open.toFixed(6)}</td>
                        <td className="p-2 text-right font-mono text-green-600">${candle.high.toFixed(6)}</td>
                        <td className="p-2 text-right font-mono text-red-600">${candle.low.toFixed(6)}</td>
                        <td className="p-2 text-right font-mono font-semibold">${candle.close.toFixed(6)}</td>
                        <td className="p-2 text-right">{candle.volume.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {candles.length > 10 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Showing 10 of {candles.length} candles
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No candle data available yet</p>
            )}
          </div>

          {/* Trades */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Recent Trades ({trades.length})</h2>
            {trades.length > 0 ? (
              <ul className="mt-2 max-h-96 overflow-y-auto">
                {trades.map((t, idx) => (
                  <li 
                    key={idx} 
                    className={`border-b py-2 text-sm hover:bg-gray-50 ${
                      t.type === 'BUY' ? 'border-l-4 border-green-500 pl-2' : 'border-l-4 border-red-500 pl-2'
                    }`}
                  >
                    <span className={`font-semibold ${t.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                      [{t.type}]
                    </span>{' '}
                    {t.amountEth.toFixed(4)} ETH / {t.amountTokens.toLocaleString()} {t.symbol} @ ${t.price.toFixed(6)}
                    <br />
                    <span className="text-xs text-gray-500">
                      tx: {t.txHash.slice(0, 10)}...{t.txHash.slice(-8)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No trades yet. Waiting for real-time updates...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
