'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig, getWagmiConfig } from '../config/wagmi';
import { ReactNode, useState, useEffect } from 'react';

interface Props {
  children: ReactNode;
}

export default function WagmiProviderWrapper({ children }: Props) {
  const [mounted, setMounted] = useState(false);
  
  // Create a new QueryClient instance to avoid SSR hydration issues
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Use effect to ensure we're mounted before using client-side config
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use SSR-safe config initially, then client config after mount
  const config = mounted ? getWagmiConfig() : wagmiConfig;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
