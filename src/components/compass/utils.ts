import { assertNever } from '../../domain/assertNever';
import { formatBearing, formatSpeed } from '../../domain/format';
import type { CompassDegrees } from '../../domain/primitives';
import type { ApparentWind } from '../../domain/wind';
import type { CompassCard } from './compassCard';
import { CENTER, RADIANS_PER_DEGREE } from './constants';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export const pointAt = (bearing: number, radius: number): Point => {
  const angle = bearing * RADIANS_PER_DEGREE;
  return {
    x: CENTER + radius * Math.sin(angle),
    y: CENTER - radius * Math.cos(angle),
  };
};

export const radialPath = (bearing: number, from: number, to: number): string => {
  const start = pointAt(bearing, from);
  const end = pointAt(bearing, to);
  return `M${start.x.toFixed(2)} ${start.y.toFixed(2)} L${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

export const polygonPoints = (points: readonly Point[]): string => {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
};

export const cardRotation = (card: CompassCard): number => {
  switch (card.kind) {
    case 'heading-up':
      return card.heading;
    case 'north-up':
      return 0;
    default:
      return assertNever(card, 'compass card');
  }
};

const spokenBearing = (bearing: CompassDegrees): string => {
  return `${formatBearing(bearing).replace('°', '')} degrees`;
};

const windPhrase = (wind: ApparentWind): string => {
  switch (wind.kind) {
    case 'ambient':
      return `wind ${formatSpeed(wind.speed)} from ${spokenBearing(wind.fromDirection)}`;
    case 'relative':
      return `apparent wind ${formatSpeed(wind.speed)} from ${spokenBearing(wind.fromDirection)}, ${wind.sector}`;
    default:
      return assertNever(wind, 'apparent wind');
  }
};

export const describeCompass = (card: CompassCard, wind: ApparentWind): string => {
  switch (card.kind) {
    case 'heading-up':
      return `Compass card turned to a heading of ${spokenBearing(card.heading)}. Course over ground ${spokenBearing(card.courseOverGround)}, ${windPhrase(wind)}.`;
    case 'north-up':
      return `Compass card, north up: the vessel is not under way, so it has no heading. The card shows ${windPhrase(wind)}.`;
    default:
      return assertNever(card, 'compass card');
  }
};
