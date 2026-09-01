import { assertNever } from './assertNever';
import { normaliseBearing } from './geo';
import { toKnots } from './primitives';
import type { CompassDegrees, Knots } from './primitives';
import type { VesselMotion, WindObservation } from './vessel';

export type ApparentWind =
  | {
      readonly kind: 'ambient';
      readonly speed: Knots;
      readonly fromDirection: CompassDegrees;
    }
  | {
      readonly kind: 'relative';
      readonly speed: Knots;
      readonly fromDirection: CompassDegrees;
      readonly offBow: CompassDegrees;
      readonly sector: WindSector;
    };

const SECTORS = [
  'ahead',
  'on the starboard bow',
  'on the starboard beam',
  'on the starboard quarter',
  'astern',
  'on the port quarter',
  'on the port beam',
  'on the port bow',
] as const;

export type WindSector = (typeof SECTORS)[number];

const DEGREES_PER_SECTOR = 360 / SECTORS.length;
const RADIANS_PER_DEGREE = Math.PI / 180;
const CALM_KNOTS = 1e-9;

export const windSector = (offBow: CompassDegrees): WindSector => {
  const index = Math.round(offBow / DEGREES_PER_SECTOR) % SECTORS.length;
  const sector = SECTORS[index];
  if (sector === undefined) throw new RangeError(`Unreachable wind sector ${index}`);
  return sector;
};

export const apparentWind = (wind: WindObservation, motion: VesselMotion): ApparentWind => {
  switch (motion.kind) {
    case 'stationary':
      return { kind: 'ambient', speed: wind.speed, fromDirection: wind.fromDirection };
    case 'under-way': {
      const trueAngle = wind.fromDirection * RADIANS_PER_DEGREE;
      const courseAngle = motion.courseOverGround * RADIANS_PER_DEGREE;
      const north =
        wind.speed * Math.cos(trueAngle) + motion.speedOverGround * Math.cos(courseAngle);
      const east =
        wind.speed * Math.sin(trueAngle) + motion.speedOverGround * Math.sin(courseAngle);

      const magnitude = Math.hypot(north, east);
      const calm = magnitude < CALM_KNOTS;
      const speed = toKnots(calm ? 0 : magnitude);
      const fromDirection = calm
        ? wind.fromDirection
        : normaliseBearing(Math.atan2(east, north) / RADIANS_PER_DEGREE);
      const offBow = normaliseBearing(fromDirection - motion.heading);

      return { kind: 'relative', speed, fromDirection, offBow, sector: windSector(offBow) };
    }
    default:
      return assertNever(motion, 'vessel motion');
  }
};

export interface BeaufortForce {
  readonly force: number;
  readonly description: string;
}

const BEAUFORT_SCALE = [
  { below: 1, force: 0, description: 'Calm' },
  { below: 4, force: 1, description: 'Light air' },
  { below: 7, force: 2, description: 'Light breeze' },
  { below: 11, force: 3, description: 'Gentle breeze' },
  { below: 17, force: 4, description: 'Moderate breeze' },
  { below: 22, force: 5, description: 'Fresh breeze' },
  { below: 28, force: 6, description: 'Strong breeze' },
  { below: 34, force: 7, description: 'Near gale' },
  { below: 41, force: 8, description: 'Gale' },
  { below: 48, force: 9, description: 'Severe gale' },
  { below: 56, force: 10, description: 'Storm' },
  { below: 64, force: 11, description: 'Violent storm' },
] as const;

const HURRICANE_FORCE: BeaufortForce = { force: 12, description: 'Hurricane force' };

export const beaufortForce = (speed: Knots): BeaufortForce => {
  const step = BEAUFORT_SCALE.find((candidate) => speed < candidate.below);
  if (step === undefined) return HURRICANE_FORCE;

  return { force: step.force, description: step.description };
};
