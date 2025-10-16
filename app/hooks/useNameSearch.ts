"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Token } from '@/app/types/token';
import { searchTokensByName } from '@/app/lib/api/services/tokenService';

interface UseNameSearchOptions {
  enabled?: boolean;
  pageSize?: number;
  debounceMs?: number;
}

interface UseNameSearchReturn {
  data: Token[];
  isLoading: boolean;
  error: Error | null;
}

export function useNameSearch(query: string, options: UseNameSearchOptions = {}): UseNameSearchReturn {
  const { enabled = true, pageSize = 10, debounceMs = 300 } = options;

  const [data, setData] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQueryRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) {
      // Reset state when disabled
      setData([]);
      setIsLoading(false);
      setError(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const q = query.trim();
    if (q.length < 2) {
      setData([]);
      setIsLoading(false);
      setError(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        currentQueryRef.current = q;
        const res = await searchTokensByName(q, 1, pageSize);
        // Only set data if query hasn't changed mid-flight
        if (currentQueryRef.current === q) {
          setData(res.items || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to search tokens by name'));
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, enabled, pageSize, debounceMs]);

  return { data, isLoading, error };
}
