"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TradingChartIndexPage() {
  const router = useRouter();

  // Redirect to home page immediately on page load
  useEffect(() => {
    router.replace('/');
  }, [router]);

  // Don't render anything while redirecting
  return null;
}
