import { toMilliseconds } from '../domain/primitives';
import type { VesselType } from '../domain/vessel';

export const FLEET_QUERY_KEY = ['ais', 'fleet'] as const;
export const FLEET_STALE_TIME = 60_000;
export const THEME_STORAGE_KEY = 'vessel-map:theme';

export const ALL_TYPES = 'All' as const;
export type VesselTypeFilter = VesselType | typeof ALL_TYPES;

export const SEARCH_PARAM_QUERY = 'q';
export const SEARCH_PARAM_TYPE = 'type';

export const SEARCH_PARAM_SELECTED = 'selected';

export const NO_DURATION = toMilliseconds(0);
export const MILLISECONDS_PER_MINUTE = 60_000;
export const MILLISECONDS_PER_HOUR = 3_600_000;

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const TIMELINE_STEPS = [
  [6 * MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE],
  [24 * MILLISECONDS_PER_HOUR, 5 * MILLISECONDS_PER_MINUTE],
] as const satisfies readonly (readonly [number, number])[];

export const COARSE_TIMELINE_STEP = 15 * MILLISECONDS_PER_MINUTE;
