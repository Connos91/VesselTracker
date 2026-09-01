import { assertNever } from './assertNever';

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export const parseThemePreference = (raw: string | null): ThemePreference =>
  THEME_PREFERENCES.find((candidate) => candidate === raw) ?? DEFAULT_THEME_PREFERENCE;

export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean,
): Theme => {
  switch (preference) {
    case 'system':
      return systemPrefersDark ? 'dark' : 'light';
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    default:
      return assertNever(preference, 'theme preference');
  }
};

export const themeAttribute = (preference: ThemePreference): Theme | null =>
  preference === 'system' ? null : preference;
