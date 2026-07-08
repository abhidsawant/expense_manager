import { useContext, useEffect } from 'react';
import { SettingsContext } from '../state/ThemeContext';
import { setCachedRates } from '../storage';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', SGD: 'S$',
};

export function symbolForCode(code: string) {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export async function fetchRates(base: string): Promise<Record<string, number>> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
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
