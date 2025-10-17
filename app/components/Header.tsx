"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./UI/Botton.module.css";
import { useWallet } from "@/app/hooks/useWallet";

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
  const [selectedNetwork, setSelectedNetwork] = useState<string>("BASE");
  const networkRef = useRef<HTMLDivElement | null>(null);

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

  const handleSelectNetwork = (net: string) => {
    setSelectedNetwork(net);
    setIsNetworkOpen(false);
  };
  
  const { isConnected, address, isConnecting } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
                href="#"
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
                href="#"
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
                href="#"
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
                className={`${styles.headerBtn}`}
                onClick={() => setIsNetworkOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isNetworkOpen}
              >
                <div className={styles.headerBtnInner}>
                  <Image
                    src={
                      selectedNetwork === "ETH"
                        ? "/images/ethereum-logo-blue.blue"
                        : selectedNetwork === "BSC"
                        ? "/images/bsc-chain.png"
                        : selectedNetwork === "BASE"
                        ? "/images/base-chain.png"
                        : "/images/arbitrum-chain.png"
                    }
                    alt=""
                    width={14}
                    height={14}
                    className="mr-2"
                  />
                  <span className="hidden sm:inline">{selectedNetwork}</span>
                  <span className="sm:hidden">Net</span>
                  <svg
                    className="ml-2 h-3 w-3"
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
                <div className="absolute z-50 left-0 top-full mt-2 min-w-full w-auto rounded-lg border border-yellow-700/30 bg-[#2b1200]/95 text-[#e9af5a] shadow-lg backdrop-blur">
                  <ul className="py-1">
                    {["ETH", "BSC", "BASE", "ARB"].map((n) => (
                      <li key={n}>
                        <button
                          className="w-full flex items-center text-left px-2 py-2 hover:bg-[#4a2a16] hover:text-[#fff5d6] transition-colors text-xs sm:text-sm"
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