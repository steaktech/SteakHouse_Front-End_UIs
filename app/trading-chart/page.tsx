"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SteakMatrixAnimation from "@/app/components/SteakMatrixAnimation";
import { useTokenData } from "@/app/hooks/useTokenData";
import { normalizeEthereumAddress } from "@/app/lib/utils/addressValidation";

export default function TradingChartSearchPage() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");
  const [queryAddress, setQueryAddress] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Kick off fetch only when we have a validated address
  const { data, isLoading, error } = useTokenData(queryAddress);

  const normalizedInput = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return null;
    return normalizeEthereumAddress(trimmed);
  }, [inputValue]);

  useEffect(() => {
    if (!queryAddress) return;
    if (isLoading) return;

    if (error) {
      // Show a friendly, specific message when token is not found
      setLocalError(error === "Token not found" ? "Token not found" : error);
      return;
    }

    if (data && queryAddress) {
      router.push(`/trading-chart/${queryAddress}`);
    }
  }, [data, error, isLoading, queryAddress, router]);

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLocalError(null);

    if (!inputValue.trim()) {
      setLocalError("Please enter a token address");
      setQueryAddress(null);
      return;
    }

    const normalized = normalizedInput;
    if (!normalized) {
      setLocalError("Enter a valid Ethereum token address");
      setQueryAddress(null);
      return;
    }

    setQueryAddress(normalized);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0b09] text-[#fff1d6]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 relative">
        {/* Steak Matrix Animation Background */}
        <SteakMatrixAnimation />
        
        <div className="w-full max-w-2xl relative" style={{ zIndex: 10 }}>
          <form onSubmit={onSubmit} aria-label="Token search">
            <div className="relative group">
              {/* Animated glow backdrop */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 md:-inset-5 rounded-full bg-[radial-gradient(closest-side,rgba(227,163,74,0.28),rgba(200,128,42,0.18),transparent_70%)] blur-2xl opacity-0 group-hover:opacity-40 group-focus-within:opacity-50 transition-opacity duration-500"
              />

              {/* Gradient ring with subtle scale on hover/focus */}
              <div className="relative rounded-full p-[2px] bg-gradient-to-r from-[#e3a34a]/40 to-[#c8802a]/40 shadow-[0_0_30px_rgba(227,163,74,0.15)] group-hover:shadow-[0_0_48px_rgba(227,163,74,0.28)] group-focus-within:shadow-[0_0_64px_rgba(227,163,74,0.42)] transition-transform duration-300 group-hover:scale-[1.005] group-focus-within:scale-[1.01]">
                <div className="relative rounded-full bg-[#1a140f] border border-[#5a4026]/60 focus-within:border-[#e3a34a]">
                  <label htmlFor="tokenSearch" className="sr-only">
                    Token address
                  </label>
                  <input
                    id="tokenSearch"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Search token by address (0x...)"
                    className="w-full rounded-full bg-transparent border-0 focus:ring-0 focus:outline-none text-base sm:text-lg md:text-xl placeholder-[#a1805b] text-[#fff1d6] py-3 sm:py-3.5 md:py-4 pl-5 pr-20"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    aria-invalid={!!localError}
                    aria-describedby={localError ? "search-error" : undefined}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 h-9 w-14 sm:h-9 sm:w-16 md:h-10 md:w-20 rounded-full bg-gradient-to-r from-[#e3a34a] to-[#c8802a] text-[#2b1300] font-semibold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#e3a34a] focus:ring-offset-2 focus:ring-offset-[#0d0b09] transition-transform duration-200 group-hover:translate-x-[1px] hover:scale-105 active:scale-95 hover:shadow-[0_6px_24px_rgba(227,163,74,0.45)]"
                    aria-label="Go"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span>Go</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-[1px]"
                          aria-hidden="true"
                        >
                          <path d="M13.5 4.5l6 6-6 6m-9-6h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {localError && (
            <p id="search-error" role="alert" className="mt-3 text-sm text-red-400">
              {localError === "Token not found" ? "Token not found" : localError}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}