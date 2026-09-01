import { assertNever } from '../domain/assertNever';
import {
  parseTimestamp,
  toCompassDegrees,
  toImoNumber,
  toKilowatts,
  toKnots,
  toLatitude,
  toLongitude,
  toMmsi,
  toRpm,
  toVesselId,
} from '../domain/primitives';
import type {
  Machinery,
  NavigationalStatus,
  Position,
  StationaryStatus,
  UnderWayStatus,
  Vessel,
  VesselType,
  WindObservation,
} from '../domain/vessel';
import { buildVoyage } from '../domain/voyage';
import type { TrackReport, Voyage } from '../domain/voyage';

interface RawWind {
  readonly from: number;
  readonly speed: number;
}

interface RawMachinery {
  readonly engines: number;
  readonly ratedKw: number;
  readonly ratedRpm: number;
  readonly serviceSpeedKn: number;
  readonly hotelKw: number;
  readonly deckKw: number;
  readonly navigationKw: number;
}

interface RawTrackFix {
  readonly at: string;
  readonly lat: number;
  readonly lon: number;
}

interface RawVoyage {
  readonly from: string;
  readonly to: string;
  readonly track: readonly RawTrackFix[];
}

interface RawVesselBase {
  readonly id: string;
  readonly name: string;
  readonly mmsi: string;
  readonly imo: string;
  readonly type: VesselType;
  readonly lat: number;
  readonly lon: number;
  readonly speed: number;
  readonly destination: string;
  readonly status: NavigationalStatus;
  readonly wind: RawWind;
  readonly machinery: RawMachinery;
  readonly voyage?: RawVoyage;
}

export type RawVessel =
  | (Omit<RawVesselBase, 'status'> & {
      readonly status: UnderWayStatus;
      readonly course: number;
      readonly heading: number;
    })
  | (Omit<RawVesselBase, 'status'> & { readonly status: StationaryStatus });

const parsePosition = (lat: number, lon: number): Position => {
  return { latitude: toLatitude(lat), longitude: toLongitude(lon) };
};

const parseTrackFix = (raw: RawTrackFix): TrackReport => {
  return { at: parseTimestamp(raw.at), position: parsePosition(raw.lat, raw.lon) };
};

const parseVoyage = (raw: RawVoyage, position: Position): Voyage => {
  const voyage = buildVoyage({
    from: raw.from,
    to: raw.to,
    track: raw.track.map(parseTrackFix),
  });
  const last = voyage.fixes[voyage.fixes.length - 1];
  if (
    last === undefined ||
    last.position.latitude !== position.latitude ||
    last.position.longitude !== position.longitude
  ) {
    throw new RangeError(
      `The last fix of the ${raw.from} to ${raw.to} track is not the vessel's position`,
    );
  }
  return voyage;
};

const parseWind = (raw: RawWind): WindObservation => {
  return { fromDirection: toCompassDegrees(raw.from), speed: toKnots(raw.speed) };
};

const parseMachinery = (raw: RawMachinery): Machinery => {
  if (!Number.isInteger(raw.engines) || raw.engines < 1) {
    throw new RangeError(`Invalid engine count: ${JSON.stringify(raw.engines)}`);
  }
  return {
    engines: {
      count: raw.engines,
      ratedPower: toKilowatts(raw.ratedKw),
      ratedShaftSpeed: toRpm(raw.ratedRpm),
      serviceSpeed: toKnots(raw.serviceSpeedKn),
    },
    electrical: {
      hotel: toKilowatts(raw.hotelKw),
      deckMachinery: toKilowatts(raw.deckKw),
      navigation: toKilowatts(raw.navigationKw),
    },
  };
};

export const parseVessel = (raw: RawVessel): Vessel => {
  const position = parsePosition(raw.lat, raw.lon);
  const identity = {
    id: toVesselId(raw.id),
    name: raw.name,
    mmsi: toMmsi(raw.mmsi),
    imo: toImoNumber(raw.imo),
    type: raw.type,
    destination: raw.destination,
    position,
    wind: parseWind(raw.wind),
    machinery: parseMachinery(raw.machinery),
    voyage: raw.voyage === undefined ? null : parseVoyage(raw.voyage, position),
  } as const;

  switch (raw.status) {
    case 'Under way using engine':
    case 'Under way sailing':
    case 'Engaged in fishing':
    case 'Restricted manoeuvrability':
      return {
        ...identity,
        motion: {
          kind: 'under-way',
          status: raw.status,
          speedOverGround: toKnots(raw.speed),
          courseOverGround: toCompassDegrees(raw.course),
          heading: toCompassDegrees(raw.heading),
        },
      };
    case 'At anchor':
    case 'Moored':
    case 'Aground':
      return {
        ...identity,
        motion: {
          kind: 'stationary',
          status: raw.status,
          speedOverGround: toKnots(raw.speed),
        },
      };
    default:
      return assertNever(raw, 'raw vessel status');
  }
};
