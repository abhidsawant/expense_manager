export type Theme = 'light' | 'dark' | 'system';

export type Settings = {
  username: string;
  theme: Theme;
  currency: string;       // display symbol e.g. '$'
  baseCurrency: string;   // ISO code e.g. 'USD'
  displayCurrency: string; // ISO code e.g. 'INR'
  language: string;
  exchangeRates: Record<string, number>; // rates relative to baseCurrency
  ratesFetchedAt: number; // unix ms timestamp
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
};

export type Expense = {
  id: string;
  amount_cents: number;
  currency: string;       // ISO code the expense was entered in e.g. 'INR'
  category_id: string;
  spent_on: string; // 'YYYY-MM-DD'
  note: string | null;
  receipt_uri: string | null;
  created_at: string;
};
