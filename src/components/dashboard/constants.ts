import type { EnergyBudget } from '../../domain/energy';
import type { Reading } from './utils';

export const HIGH_LOAD_PERCENT = 90;

export const DASH_SECTION =
  'flex flex-col gap-[0.55rem] [&:not(:first-child)]:border-t [&:not(:first-child)]:border-line [&:not(:first-child)]:pt-[0.85rem]';

export const ENERGY_COLORS = {
  propulsion: 'bg-viz-blue',
  hotel: 'bg-viz-orange',
  'deck-machinery': 'bg-viz-aqua',
  navigation: 'bg-viz-yellow',
} as const satisfies Record<EnergyBudget['consumers'][number]['id'], string>;

export const KEY_COLORS = {
  heading: 'bg-ink',
  course: 'bg-viz-blue',
  wind: 'bg-viz-orange',
} as const satisfies Record<NonNullable<Reading['key']>, string>;
