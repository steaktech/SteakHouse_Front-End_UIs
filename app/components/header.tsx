import React from 'react';

export default function Header() {
  return (
    <header className="bg-[#0d0600] text-white py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <img src="/images/header_icon.png" alt="Logo" className="h-8 mr-4" />
        <h1 className="text-xl font-bold">Trading Platform</h1>
      </div>
      <nav className="flex items-center space-x-6">
        <a href="/" className="hover:text-yellow-500 transition">Dashboard</a>
        <a href="/trading-chart" className="hover:text-yellow-500 transition">Trading Chart</a>
        <a href="#" className="hover:text-yellow-500 transition">Portfolio</a>
        <a href="#" className="hover:text-yellow-500 transition">Settings</a>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition">
          Connect Wallet
        </button>
      </nav>
    </header>
  );
}
