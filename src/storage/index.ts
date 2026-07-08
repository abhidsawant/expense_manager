import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, Category, Expense } from '../types';

const SETTINGS_KEY   = '@expenseflow/v1/settings';
const CATEGORIES_KEY = '@expenseflow/v1/categories';
const EXPENSES_KEY   = '@expenseflow/v1/expenses';
const SCHEMA_KEY     = '@expenseflow/v1/schema_version';
const RATES_KEY      = '@expenseflow/v1/exchange_rates';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food',     name: 'Food',      color: '#A855F7', icon: 'restaurant',      is_default: true },
  { id: 'transport',name: 'Transport', color: '#22D3EE', icon: 'car',             is_default: true },
  { id: 'shopping', name: 'Shopping',  color: '#EC4899', icon: 'bag-handle',      is_default: true },
  { id: 'health',   name: 'Health',    color: '#4ADE80', icon: 'medkit',          is_default: true },
  { id: 'entertainment', name: 'Fun',  color: '#FACC15', icon: 'game-controller', is_default: true },
  { id: 'bills',    name: 'Bills',     color: '#F87171', icon: 'receipt',         is_default: true },
  { id: 'other',    name: 'Other',     color: '#9CA3AF', icon: 'ellipsis-horizontal', is_default: true },
];

export async function getSettings(): Promise<Settings | null> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export async function getCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
}

export async function setCategories(cats: Category[]): Promise<void> {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

export async function getExpenses(): Promise<Expense[]> {
  const raw = await AsyncStorage.getItem(EXPENSES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function setExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export type CachedRates = { rates: Record<string, number>; base: string; fetchedAt: number };

export async function getCachedRates(): Promise<CachedRates | null> {
  const raw = await AsyncStorage.getItem(RATES_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setCachedRates(data: CachedRates): Promise<void> {
  await AsyncStorage.setItem(RATES_KEY, JSON.stringify(data));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([SETTINGS_KEY, CATEGORIES_KEY, EXPENSES_KEY, SCHEMA_KEY]);
}
