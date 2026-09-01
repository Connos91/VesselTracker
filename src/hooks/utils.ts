import { useSyncExternalStore } from 'react';
import { duressCodeFor } from '../data/duressCodes';
import { codeLength, codeProgress, WATCH_OFF } from '../domain/duress';
import type { DuressWatch } from '../domain/duress';
import type { Milliseconds, VesselId } from '../domain/primitives';
import type { Vessel } from '../domain/vessel';
import { VESSEL_TYPES } from '../domain/vessel';
import {
  alertAcknowledged,
  cabinActionReported,
  watchClosed,
  watchOpened,
  watchToggled,
} from '../store/duressSlice';
import type { DuressState } from '../store/duressSlice';
import type { AppDispatch } from '../store/store';
import { ALL_TYPES, COARSE_TIMELINE_STEP, TIMELINE_STEPS } from './constants';
import type { VesselTypeFilter } from './constants';
import type { PressableProps, SearchParamPatch, VesselDuress } from './types';

type Listener = () => void;

export type StoreSource = (listener: Listener) => () => void;

export interface ExternalStore<Snapshot> {
  readonly subscribe: StoreSource;
  readonly getSnapshot: () => Snapshot;
  readonly getServerSnapshot: () => Snapshot;
  readonly notify: () => void;
}

export const createExternalStore = <Snapshot>(
  read: () => Snapshot,
  serverSnapshot: Snapshot,
  source: StoreSource = () => () => undefined,
): ExternalStore<Snapshot> => {
  const listeners = new Set<Listener>();

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      const unsubscribe = source(listener);
      return () => {
        listeners.delete(listener);
        unsubscribe();
      };
    },
    getSnapshot: read,
    getServerSnapshot: () => serverSnapshot,
    notify: () => {
      for (const listener of [...listeners]) listener();
    },
  };
};

export const useExternalStore = <Snapshot>(store: ExternalStore<Snapshot>): Snapshot => {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
};

export const windowEvent = (type: 'popstate' | 'storage'): StoreSource => {
  return (listener) => {
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  };
};

const matchMediaOrNull = (query: string): MediaQueryList | null => {
  return typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;
};

export const mediaQuery = (query: string): StoreSource => {
  return (listener) => {
    const list = matchMediaOrNull(query);
    if (list === null) return () => undefined;
    list.addEventListener('change', listener);
    return () => list.removeEventListener('change', listener);
  };
};

export const matchesMedia = (query: string): boolean => {
  return matchMediaOrNull(query)?.matches ?? false;
};

export const readStoredText = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStoredText = (key: string, value: string | null): void => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {}
};

export const patchSearch = (search: string, patch: SearchParamPatch): string => {
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
  }
  return params.toString();
};

export const currentHref = (): string => {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
};

export const hrefWithSearch = (query: string): string => {
  return `${window.location.pathname}${query === '' ? '' : `?${query}`}${window.location.hash}`;
};

export const pressableProps = (isPressed: boolean, onClick: () => void): PressableProps => {
  return { type: 'button', 'aria-pressed': isPressed, onClick };
};

export const parseVesselTypeFilter = (raw: string | null): VesselTypeFilter => {
  if (raw === null) return ALL_TYPES;
  const normalised = raw.toLowerCase();
  return VESSEL_TYPES.find((type) => type.toLowerCase() === normalised) ?? ALL_TYPES;
};

export const matchesFilters = (
  vessel: Vessel,
  filter: VesselTypeFilter,
  needle: string,
): boolean => {
  if (filter !== ALL_TYPES && vessel.type !== filter) return false;
  if (needle === '') return true;
  return [vessel.name, vessel.mmsi, vessel.imo, vessel.destination].some((field) =>
    field.toLowerCase().includes(needle),
  );
};

export const timelineStep = (duration: Milliseconds): number => {
  return TIMELINE_STEPS.find(([limit]) => duration <= limit)?.[1] ?? COARSE_TIMELINE_STEP;
};

export const watchFor = (watches: DuressState['watches'], vesselId: VesselId): DuressWatch => {
  return watches[vesselId] ?? WATCH_OFF;
};

export const vesselDuress = (
  vessel: Vessel,
  watch: DuressWatch,
  dispatch: AppDispatch,
): VesselDuress => {
  const code = duressCodeFor(vessel.id);
  const recent = watch.kind === 'watching' ? watch.recent : [];

  return {
    vessel,
    code,
    watch,
    progress: code === null ? 0 : codeProgress(recent, code),
    required: code === null ? 0 : codeLength(code),
    isArmed: watch.kind === 'watching',
    isRaised: watch.kind === 'raised',
    arm: () => dispatch(watchOpened(vessel.id)),
    disarm: () => dispatch(watchClosed(vessel.id)),
    toggleArmed: () => dispatch(watchToggled(vessel.id)),
    acknowledge: () => dispatch(alertAcknowledged(vessel.id)),
    report: (action) => {
      dispatch(cabinActionReported({ vesselId: vessel.id, action, at: Date.now() }));
    },
  };
};
