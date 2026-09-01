import type { VesselType } from '../domain/vessel';

export const VESSEL_TYPE_COLOR = {
  Cargo: 'var(--vessel-cargo)',
  Tanker: 'var(--vessel-tanker)',
  Passenger: 'var(--vessel-passenger)',
  Tug: 'var(--vessel-tug)',
  Fishing: 'var(--vessel-fishing)',
  Sailing: 'var(--vessel-sailing)',
} as const satisfies Record<VesselType, string>;

export const VESSEL_TYPE_CLASS = {
  Cargo: 'vessel-cargo',
  Tanker: 'vessel-tanker',
  Passenger: 'vessel-passenger',
  Tug: 'vessel-tug',
  Fishing: 'vessel-fishing',
  Sailing: 'vessel-sailing',
} as const satisfies Record<VesselType, string>;

export const colorForVesselType = (type: VesselType): string => VESSEL_TYPE_COLOR[type];

export const classForVesselType = (type: VesselType): string => VESSEL_TYPE_CLASS[type];
