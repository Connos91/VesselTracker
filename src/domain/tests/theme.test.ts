import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_PREFERENCE,
  parseThemePreference,
  resolveTheme,
  themeAttribute,
} from '../theme';

describe('parseThemePreference', () => {
  it('takes the three it offers', () => {
    expect(parseThemePreference('system')).toBe('system');
    expect(parseThemePreference('light')).toBe('light');
    expect(parseThemePreference('dark')).toBe('dark');
  });

  it('falls back to following the system for anything else', () => {
    expect(parseThemePreference(null)).toBe(DEFAULT_THEME_PREFERENCE);
    expect(parseThemePreference('')).toBe(DEFAULT_THEME_PREFERENCE);
    expect(parseThemePreference('sepia')).toBe(DEFAULT_THEME_PREFERENCE);
    expect(parseThemePreference('DARK')).toBe(DEFAULT_THEME_PREFERENCE);
  });
});

describe('resolveTheme', () => {
  it('reads the system setting when asked to follow it', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('ignores the system setting when a choice has been made', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('themeAttribute', () => {
  it('says nothing at all for the system preference', () => {
    expect(themeAttribute('system')).toBeNull();
  });

  it('states an explicit choice, so it outranks the system either way', () => {
    expect(themeAttribute('dark')).toBe('dark');
    expect(themeAttribute('light')).toBe('light');
  });
});
