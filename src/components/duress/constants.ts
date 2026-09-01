import type { CabinAction } from '../../domain/duress';

export const ACTION_LABELS = {
  'toilet-flush': 'Flush the heads',
  'toilet-light': 'Heads light',
  'cabin-light': 'Cabin light',
  'wash-basin-tap': 'Wash-basin tap',
} as const satisfies Record<CabinAction, string>;

export type LampState = 'raised' | 'watching' | 'off';

export const LAMP_WORDS = {
  raised: 'Duress',
  watching: 'Normal',
  off: 'Not watching',
} as const satisfies Record<LampState, string>;

export const LAMP_STYLES = {
  raised:
    'text-danger uppercase tracking-[0.06em] [&>span]:bg-danger [&>span]:shadow-[0_0_0_3px_var(--danger-soft)] [&>span]:animate-duress-pulse motion-reduce:[&>span]:animate-none',
  watching: 'text-ok [&>span]:bg-ok [&>span]:shadow-[0_0_0_3px_var(--ok-soft)]',
  off: 'text-ink-muted [&>span]:bg-line [&>span]:shadow-[0_0_0_1px_var(--line)_inset]',
} as const satisfies Record<LampState, string>;

export const DURESS_ROW =
  'grid grid-cols-[9.5rem_minmax(0,1fr)] gap-2 border-b border-line py-[0.28rem] text-[0.8rem] last:border-b-0';

export const DURESS_NOTE = 'text-[0.74rem] text-ink-muted';
