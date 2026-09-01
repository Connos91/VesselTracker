import { THEME_PREFERENCES } from '../../domain/theme';
import type { ThemePreference } from '../../domain/theme';
import type { UseThemeResult } from '../../hooks/useTheme';

const THEME_LABELS = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
} as const satisfies Record<ThemePreference, string>;

export interface ThemeToggleProps {
  readonly theme: UseThemeResult;
}

const ThemeToggle = ({ theme }: ThemeToggleProps) => {
  return (
    <div
      className="flex gap-[2px] rounded-[8px] border border-line p-[2px]"
      role="group"
      aria-label="Theme"
    >
      {THEME_PREFERENCES.map((preference) => (
        <button
          key={preference}
          className="cursor-pointer rounded-[6px] bg-transparent px-[0.6rem] py-1 text-[0.78rem] text-ink-muted hover:text-ink aria-pressed:bg-accent-soft aria-pressed:font-semibold aria-pressed:text-accent"
          {...theme.getThemeOptionProps(preference)}
        >
          {THEME_LABELS[preference]}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
