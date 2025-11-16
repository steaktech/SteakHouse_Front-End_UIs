"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./UI/Botton.module.css";
import { useWallet } from "@/app/hooks/useWallet";
import { useSwitchChain } from "wagmi";

const CreateTokenModal = dynamic(
  () => import("./Modals/CreateTokenModal/CreateTokenModal"),
  { ssr: false }
);
const SteakHouseInfoModal = dynamic(
  () => import("./Modals/SteakHouseInfoModal"),
  { ssr: false }
);
const WalletModal = dynamic(
  () => import("./Modals/WalletModal/WalletModal"),
  { ssr: false }
);

export default function Header() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ETH");
  const networkRef = useRef<HTMLDivElement | null>(null);

  const NETWORK_TO_CHAIN_ID: Record<string, number> = {
    ETH: 1,
    BSC: 56,
    BASE: 8453,
    ARB: 42161,
  };

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (networkRef.current && !networkRef.current.contains(e.target as Node)) {
        setIsNetworkOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsNetworkOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const { isConnected, address, isConnecting, chainId } = useWallet();

  const handleSelectNetwork = (net: string) => {
    setSelectedNetwork(net);
    setIsNetworkOpen(false);

    const targetChainId = NETWORK_TO_CHAIN_ID[net];
    if (!targetChainId) return;

    // Require connection before switching chains
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }

    try {
      if (switchChain) {
        // This triggers the wallet popup to request a chain change
        // wagmi v2 useSwitchChain API
        // @ts-ignore - allow call-time inference regardless of wagmi minor versions
        switchChain({ chainId: targetChainId });
      } else if (typeof window !== 'undefined' && (window as any).ethereum?.request) {
        // Fallback to direct EIP-3326 if needed
        (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + targetChainId.toString(16) }],
        });
      }
    } catch (e) {
      console.error('Failed to switch chain', e);
    }
  };
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Keep selectedNetwork in sync with the actually connected chain
  useEffect(() => {
    if (!chainId) return;
    const match = Object.entries(NETWORK_TO_CHAIN_ID).find(([, id]) => id === chainId);
    if (match && match[0] !== selectedNetwork) setSelectedNetwork(match[0]);
  }, [chainId]);

  const handleLogoClick = () => {
    router.push('/');
  };
  return (
    <>
      {/* <header className="relative w-full h-20 bg-gradient-to-b from-[#4c2001] to-[#723203] shadow-md"> */}
      <header className="relative z-50 w-full h-16 lg:h-12 bg-gradient-to-b from-[#4c2001] to-transparent shadow-md">
        {/* Header Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Logo & Socials Section */}
          <div className="flex items-center">
            {/* Logo Container */}
            <div className="relative w-20 h-16 sm:w-24 sm:h-16 md:w-65 md:h-16 lg:w-52 lg:h-12 pointer-events-none overflow-visible">
              <Image
                src="/images/app-logo.png"
                alt="Logo"
                fill
                className="object-contain pointer-events-auto cursor-pointer md:hidden"
                onClick={handleLogoClick}
              />
              <Image
                src="/images/header-logo-lg.png"
                alt="Logo"
                fill
                className="object-contain pointer-events-auto cursor-pointer hidden md:block overflow-hidden"
                onClick={handleLogoClick}
              />
            </div>

            {/* Social Icons */}
            {/* MODIFIED: Icons are hidden by default, and appear as a flex container on 'sm' screens and larger */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-1.5 ml-4 lg:ml-3">
              {/* Discord Icon */}
              <a
                href="/coming-soon"
                className="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/discord.png"
                  alt="Discord"
                  width={28}
                  height={28}
                  className="object-contain lg:w-5 lg:h-5"
                />
              </a>

              {/* Telegram Icon */}
              <a
                href="https://t.me/steakhouse" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/telegram.png"
                  alt="Telegram"
                  width={28}
                  height={28}
                  className="object-contain lg:w-5 lg:h-5"
                />
              </a>

              {/* Twitter/X Icon */}
              <a
                href="https://x.com/steak_tech" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={28}
                  height={28}
                  className="object-contain lg:w-5 lg:h-5"
                />
              </a>

              {/* GitHub Icon */}
              <a
                href="https://github.com/steaktech" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/github-icon.png"
                  alt="GitHub"
                  width={28}
                  height={28}
                  className="object-contain lg:w-5 lg:h-5"
                />
              </a>

              {/* Medium Icon */}
              <a
                href="https://medium.com/@steakhousefinance" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/medium-icon.png"
                  alt="Medium"
                  width={28}
                  height={28}
                  className="object-contain lg:w-5 lg:h-5"
                />
              </a>

              {/* Info Icon */}
              <div
                onClick={() => setIsInfoModalOpen(true)}
                className="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/info.png"
                  alt="Info"
                  width={28}
                  height={28}
                  className="object-contain lg:w-5 lg:h-5"
                />
              </div>
            </div>
          </div>

          {/* Buttons Section (using the most compact version) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 lg:space-x-2 mb-2 lg:mb-1">
            {/* Create Token Button */}
            <button
              className={`${styles.headerBtn}`}
              onClick={() => setIsModalOpen(true)}
            >
              <div className={styles.headerBtnInner}>
                <span className="text-xs sm:text-sm font-bold mr-1">+</span>
                <span className="hidden sm:inline">Create Token</span>
                <span className="sm:hidden">Create</span>
              </div>
            </button>

            {/* Connect Wallet Button */}
            <button
              className={`${styles.headerBtnGolden}`}
              onClick={() => setIsWalletModalOpen(true)}
              disabled={isConnecting}
            >
              <div className={styles.headerBtnGoldenInner}>
                {isConnecting ? (
                  <>
                    <span className="hidden sm:inline">Connecting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : isConnected && address ? (
                  <>
                    <span className="hidden sm:inline">{formatAddress(address)}</span>
                    <span className="sm:hidden">●</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </div>
            </button>

            {/* Network Dropdown */}
            <div className="relative" ref={networkRef}>
              <button
                className={`${styles.headerBtn} ${styles.headerBtnNetwork}`}
                onClick={() => setIsNetworkOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isNetworkOpen}
              >
                <div className={styles.headerBtnInner}>
                  <Image
                  src={
                      selectedNetwork === "ETH"
                        ? "/images/ethereum-logo-blue.png"
                        : selectedNetwork === "BSC"
                        ? "/images/bsc-chain.png"
                        : selectedNetwork === "BASE"
                        ? "/images/base-chain.png"
                        : "/images/arbitrum-chain.png"
                    }
                    alt=""
                    width={14}
                    height={14}
                    className="sm:mr-2"
                  />
                  <span className="hidden sm:inline">{selectedNetwork}</span>
                  <svg
                    className="ml-1 sm:ml-2 h-2.5 w-2.5 sm:h-3 sm:w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {isNetworkOpen && (
                <div className="absolute z-50 right-0 top-full mt-1 min-w-[120px] w-auto rounded-md border border-yellow-700/30 bg-[#2b1200]/95 text-[#e9af5a] shadow-lg backdrop-blur max-h-[50vh] overflow-auto overscroll-contain">
                  <ul className="py-1">
                    {["ETH", "BSC", "BASE", "ARB"].map((n) => (
                      <li key={n}>
                        <button
                          className="w-full flex items-center text-left px-2 py-1.5 sm:py-2 hover:bg-[#4a2a16] hover:text-[#fff5d6] transition-colors text-xs sm:text-sm"
                          onClick={() => handleSelectNetwork(n)}
                        >
                          <Image
                            src={
                              n === "ETH"
                                ? "/images/ethereum-logo-blue.png"
                                : n === "BSC"
                                ? "/images/bsc-chain.png"
                                : n === "BASE"
                                ? "/images/base-chain.png"
                                : "/images/arbitrum-chain.png"
                            }
                            alt=""
                            width={14}
                            height={14}
                            className="mr-2"
                          />
                          {n}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <CreateTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <SteakHouseInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={isConnected}
      />
    </>
  );
}