import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsContext } from '../state/ThemeContext';
import { setCachedRates } from '../storage';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CURRENCIES_KEY = '@expenseflow/v1/currencies';

// Fallback symbols for codes not covered by Intl.NumberFormat
const SYMBOL_OVERRIDES: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', SGD: 'S$',
};

export function symbolForCode(code: string): string {
  if (SYMBOL_OVERRIDES[code]) return SYMBOL_OVERRIDES[code];
  try {
    const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0);
    const sym = parts.find(p => p.type === 'currency')?.value;
    if (sym && sym !== code) return sym;
  } catch {}
  return code;
}

// { 'USD': 'US Dollar', 'EUR': 'Euro', ... }
export type CurrencyMap = Record<string, string>;

async function loadCurrencies(): Promise<CurrencyMap> {
  const raw = await AsyncStorage.getItem(CURRENCIES_KEY);
  if (raw) {
    const { data, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt < CACHE_TTL_MS) return data;
  }
  const res = await fetch('https://api.frankfurter.app/currencies');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: CurrencyMap = await res.json();
  await AsyncStorage.setItem(CURRENCIES_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  return data;
}

const FALLBACK_CURRENCIES: CurrencyMap = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  INR: 'Indian Rupee', AUD: 'Australian Dollar', CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc', CNY: 'Chinese Yuan', SGD: 'Singapore Dollar',
};

export function useCurrencies(): { currencies: CurrencyMap; loading: boolean; error: string | null; retry: () => void } {
  const [currencies, setCurrencies] = useState<CurrencyMap>(FALLBACK_CURRENCIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadCurrencies()
      .then(data => { if (!cancelled) setCurrencies(data); })
      .catch(() => { if (!cancelled) setError('Unable to load currencies'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attempt]);

  return { currencies, loading, error, retry: () => setAttempt(a => a + 1) };
}

export async function fetchRates(base: string): Promise<Record<string, number>> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return { ...json.rates, [base]: 1 };
}

export function convertCents(
  cents: number,
  from: string,
  to: string,
  rates: Record<string, number>,
  base: string,
): number {
  if (from === to) return Math.round(cents);
  if (!rates || Object.keys(rates).length === 0) return Math.round(cents);
  const toBase = from === base ? 1 : 1 / (rates[from] ?? 1);
  const fromBase = to === base ? 1 : (rates[to] ?? 1);
  return Math.round(cents * toBase * fromBase);
}

const RATE_CACHE_PREFIX = '@expenseflow/v1/rate';

export function useExchangeRate(from: string, to: string) {
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (from === to) {
      setRate(1); setDate(null); setLoading(false); setOffline(false);
      return;
    }
    let cancelled = false;
    const key = `${RATE_CACHE_PREFIX}/${from}/${to}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    async function load() {
      setLoading(true); setError(null); setOffline(false);
      try {
        const res = await fetch(`https://api.frankfurter.dev/latest?from=${from}&to=${to}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const r = data.rates[to] as number;
        if (!cancelled) {
          setRate(r); setDate(data.date); setOffline(false);
          await AsyncStorage.setItem(key, JSON.stringify({ rate: r, date: data.date }));
        }
      } catch (e) {
        console.error('useExchangeRate fetch failed:', e);
        const raw = await AsyncStorage.getItem(key);
        if (!cancelled) {
          if (raw) {
            const cached = JSON.parse(raw);
            setRate(cached.rate); setDate(cached.date); setOffline(true);
          } else {
            setError('Unable to fetch exchange rate');
          }
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, [from, to]);

  return { rate, date, loading, error, offline };
}

export function useExchangeRates() {
  const { settings, dispatch } = useContext(SettingsContext);
  const base = settings.baseCurrency ?? 'USD';
  const display = settings.displayCurrency ?? base;

  useEffect(() => {
    const stale = Date.now() - (settings.ratesFetchedAt ?? 0) > CACHE_TTL_MS;
    if (!stale) return;
    fetchRates(base)
      .then(rates => {
        dispatch({ type: 'UPDATE', payload: { exchangeRates: rates, ratesFetchedAt: Date.now() } });
        setCachedRates({ rates, base, fetchedAt: Date.now() });
      })
      .catch(() => {});
  }, [base]);

  function convert(cents: number, fromCurrency: string): number {
    return convertCents(cents, fromCurrency, display, settings.exchangeRates ?? {}, base);
  }

  return {
    convert,
    displayCurrency: display,
    baseCurrency: base,
    baseSymbol: symbolForCode(base),
    displaySymbol: symbolForCode(display),
  };
}
