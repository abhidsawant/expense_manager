import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { Settings } from '../types';
import { getSettings, setSettings, getCachedRates } from '../storage';
import { lightTheme, darkTheme, AppTheme } from '../theme/colors';
import i18n from '../i18n';

type Action =
  | { type: 'HYDRATE'; payload: Settings }
  | { type: 'UPDATE'; payload: Partial<Settings> };

function reducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'HYDRATE': return action.payload;
    case 'UPDATE':  return { ...state, ...action.payload };
    default:        return state;
  }
}

const defaultSettings: Settings = {
  username: '', theme: 'system', currency: '$',
  baseCurrency: 'USD', displayCurrency: 'USD',
  language: 'en', exchangeRates: {}, ratesFetchedAt: 0,
};

export const SettingsContext = createContext<{
  settings: Settings;
  hydrated: boolean;
  dispatch: React.Dispatch<Action>;
}>({ settings: defaultSettings, hydrated: false, dispatch: () => {} });

export const ThemeContext = createContext<AppTheme>(darkTheme);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = useReducer(reducer, defaultSettings);
  const [hydrated, setHydrated] = React.useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    getSettings().then(async data => {
      if (data) {
        // backfill missing fields for existing users
        const cached = await getCachedRates();
        dispatch({
          type: 'HYDRATE', payload: {
            ...defaultSettings,
            ...data,
            ...(cached && !data.ratesFetchedAt ? { exchangeRates: cached.rates, ratesFetchedAt: cached.fetchedAt } : {}),
          },
        });
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) setSettings(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated && settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, hydrated]);

  const resolvedTheme = settings.theme === 'system' ? colorScheme ?? 'dark' : settings.theme;
  const theme = resolvedTheme === 'light' ? lightTheme : darkTheme;

  return (
    <SettingsContext.Provider value={{ settings, hydrated, dispatch }}>
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    </SettingsContext.Provider>
  );
}
