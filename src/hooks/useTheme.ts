import { useEffect } from 'react';
import {
  DEFAULT_THEME_PREFERENCE,
  parseThemePreference,
  resolveTheme,
  themeAttribute,
} from '../domain/theme';
import type { Theme, ThemePreference } from '../domain/theme';
import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from './constants';
import type { PressableProps } from './types';
import {
  createExternalStore,
  matchesMedia,
  mediaQuery,
  pressableProps,
  readStoredText,
  useExternalStore,
  windowEvent,
  writeStoredText,
} from './utils';

const preferenceStore = createExternalStore<string | null>(
  () => readStoredText(THEME_STORAGE_KEY),
  null,
  windowEvent('storage'),
);

const systemSchemeStore = createExternalStore(
  () => matchesMedia(DARK_SCHEME_QUERY),
  false,
  mediaQuery(DARK_SCHEME_QUERY),
);

export interface UseThemeResult {
  readonly preference: ThemePreference;
  readonly theme: Theme;
  readonly setPreference: (preference: ThemePreference) => void;
  readonly getThemeOptionProps: (preference: ThemePreference) => PressableProps;
}

export const useTheme = (): UseThemeResult => {
  const preference = parseThemePreference(useExternalStore(preferenceStore));
  const systemPrefersDark = useExternalStore(systemSchemeStore);

  useEffect(() => {
    const attribute = themeAttribute(preference);
    if (attribute === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', attribute);
  }, [preference]);

  const setPreference = (next: ThemePreference): void => {
    writeStoredText(THEME_STORAGE_KEY, next === DEFAULT_THEME_PREFERENCE ? null : next);
    preferenceStore.notify();
  };

  return {
    preference,
    theme: resolveTheme(preference, systemPrefersDark),
    setPreference,
    getThemeOptionProps: (option) =>
      pressableProps(option === preference, () => setPreference(option)),
  };
};
