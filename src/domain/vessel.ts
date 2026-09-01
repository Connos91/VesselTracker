import { assertNever } from './assertNever';
import type {
  CompassDegrees,
  ImoNumber,
  Kilowatts,
  Knots,
  Latitude,
  Longitude,
  Mmsi,
  Rpm,
  VesselId,
} from './primitives';
import type { Voyage } from './voyage';

export const VESSEL_TYPES = [
  'Cargo',
  'Tanker',
  'Passenger',
  'Tug',
  'Fishing',
  'Sailing',
] as const;

export type VesselType = (typeof VESSEL_TYPES)[number];

export const UNDER_WAY_STATUSES = [
  'Under way using engine',
  'Under way sailing',
  'Engaged in fishing',
  'Restricted manoeuvrability',
] as const;

export const STATIONARY_STATUSES = ['At anchor', 'Moored', 'Aground'] as const;

export type UnderWayStatus = (typeof UNDER_WAY_STATUSES)[number];
export type StationaryStatus = (typeof STATIONARY_STATUSES)[number];
export type NavigationalStatus = UnderWayStatus | StationaryStatus;

export interface Position {
  readonly latitude: Latitude;
  readonly longitude: Longitude;
}

export interface UnderWayMotion {
  readonly kind: 'under-way';
  readonly status: UnderWayStatus;
  readonly speedOverGround: Knots;
  readonly courseOverGround: CompassDegrees;
  readonly heading: CompassDegrees;
}

export interface StationaryMotion {
  readonly kind: 'stationary';
  readonly status: StationaryStatus;
  readonly speedOverGround: Knots;
}

export type VesselMotion = UnderWayMotion | StationaryMotion;
export interface WindObservation {
  readonly fromDirection: CompassDegrees;
  readonly speed: Knots;
}

export interface MainEngines {
  readonly count: number;
  readonly ratedPower: Kilowatts;
  readonly ratedShaftSpeed: Rpm;
  readonly serviceSpeed: Knots;
}

export interface ElectricalLoads {
  readonly hotel: Kilowatts;
  readonly deckMachinery: Kilowatts;
  readonly navigation: Kilowatts;
}

export interface Machinery {
  readonly engines: MainEngines;
  readonly electrical: ElectricalLoads;
}

export interface Vessel {
  readonly id: VesselId;
  readonly name: string;
  readonly mmsi: Mmsi;
  readonly imo: ImoNumber;
  readonly type: VesselType;
  readonly destination: string;
  readonly position: Position;
  readonly motion: VesselMotion;
  readonly wind: WindObservation;
  readonly machinery: Machinery;
  readonly voyage: Voyage | null;
}

export type VesselGlyph =
  | { readonly shape: 'arrow'; readonly rotationDegrees: CompassDegrees }
  | { readonly shape: 'circle' };

export const glyphForMotion = (motion: VesselMotion): VesselGlyph => {
  switch (motion.kind) {
    case 'under-way':
      return { shape: 'arrow', rotationDegrees: motion.heading };
    case 'stationary':
      return { shape: 'circle' };
    default:
      return assertNever(motion, 'vessel motion');
  }
};

export const isUnderWay = (motion: VesselMotion): motion is UnderWayMotion =>
  motion.kind === 'under-way';

export const isVesselType = (value: unknown): value is VesselType =>
  VESSEL_TYPES.some((candidate) => candidate === value);
