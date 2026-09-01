import { toCompassDegrees, toLatitude, toLongitude, toNauticalMiles } from './primitives';
import type { CompassDegrees, NauticalMiles } from './primitives';
import type { Position } from './vessel';

const EARTH_RADIUS_NAUTICAL_MILES = 3440.065;
const RADIANS_PER_DEGREE = Math.PI / 180;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const COINCIDENT_RADIANS = 1e-12;

export const normaliseBearing = (degrees: number): CompassDegrees => {
  return toCompassDegrees(((degrees % 360) + 360) % 360);
};

interface PositionRadians {
  readonly latitude: number;
  readonly longitude: number;
}

const toRadians = (position: Position): PositionRadians => {
  return {
    latitude: position.latitude * RADIANS_PER_DEGREE,
    longitude: position.longitude * RADIANS_PER_DEGREE,
  };
};

const angularDistance = (from: PositionRadians, to: PositionRadians): number => {
  const deltaLatitude = to.latitude - from.latitude;
  const deltaLongitude = to.longitude - from.longitude;
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(from.latitude) * Math.cos(to.latitude) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(haversine)));
};

export const greatCircleDistance = (from: Position, to: Position): NauticalMiles => {
  const angle = angularDistance(toRadians(from), toRadians(to));
  return toNauticalMiles(angle * EARTH_RADIUS_NAUTICAL_MILES);
};

export const initialBearing = (from: Position, to: Position): CompassDegrees => {
  const start = toRadians(from);
  const end = toRadians(to);
  const deltaLongitude = end.longitude - start.longitude;
  const y = Math.sin(deltaLongitude) * Math.cos(end.latitude);
  const x =
    Math.cos(start.latitude) * Math.sin(end.latitude) -
    Math.sin(start.latitude) * Math.cos(end.latitude) * Math.cos(deltaLongitude);
  return normaliseBearing(Math.atan2(y, x) * DEGREES_PER_RADIAN);
};

export const interpolatePosition = (
  from: Position,
  to: Position,
  fraction: number,
): Position => {
  if (!Number.isFinite(fraction) || fraction <= 0) return from;
  if (fraction >= 1) return to;

  const start = toRadians(from);
  const end = toRadians(to);
  const angle = angularDistance(start, end);
  if (angle < COINCIDENT_RADIANS) return from;

  const sine = Math.sin(angle);
  const before = Math.sin((1 - fraction) * angle) / sine;
  const after = Math.sin(fraction * angle) / sine;

  const x =
    before * Math.cos(start.latitude) * Math.cos(start.longitude) +
    after * Math.cos(end.latitude) * Math.cos(end.longitude);
  const y =
    before * Math.cos(start.latitude) * Math.sin(start.longitude) +
    after * Math.cos(end.latitude) * Math.sin(end.longitude);
  const z = before * Math.sin(start.latitude) + after * Math.sin(end.latitude);

  return {
    latitude: toLatitude(Math.atan2(z, Math.hypot(x, y)) * DEGREES_PER_RADIAN),
    longitude: toLongitude(Math.atan2(y, x) * DEGREES_PER_RADIAN),
  };
};
