import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RawHoliday = { date: string; localName: string; name: string };

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const cacheKey = (year: number, cc: string) => `@expenseflow/v1/holidays/${year}/${cc}`;

async function loadHolidays(year: number, cc: string, signal: AbortSignal): Promise<RawHoliday[]> {
  const key = cacheKey(year, cc);
  const raw = await AsyncStorage.getItem(key);
  if (raw) {
    const { data, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt < CACHE_TTL_MS) return data;
  }
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${cc}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: RawHoliday[] = await res.json();
  await AsyncStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }));
  return data;
}

export type PublicHolidaysResult = {
  byDate: Map<string, string>; // 'YYYY-MM-DD' -> localName
  loading: boolean;
  error: string | null;
};

const EMPTY_MAP = new Map<string, string>();

export function usePublicHolidays(year: number, cc: string): PublicHolidaysResult {
  const [byDate, setByDate] = useState<Map<string, string>>(EMPTY_MAP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    setLoading(true);
    setError(null);
    loadHolidays(year, cc, controller.signal)
      .then(arr => {
        if (cancelled) return;
        const map = new Map(arr.map(h => [h.date, h.localName || h.name]));
        setByDate(map);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message ?? 'Failed to load holidays');
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, [year, cc]);

  return { byDate, loading, error };
}
