import { describe, expect, it } from 'vitest';
import {
  greatCircleDistance,
  initialBearing,
  interpolatePosition,
  normaliseBearing,
} from '../geo';
import { toLatitude, toLongitude } from '../primitives';
import type { Position } from '../vessel';

const at = (latitude: number, longitude: number): Position => {
  return { latitude: toLatitude(latitude), longitude: toLongitude(longitude) };
};

describe('greatCircleDistance', () => {
  it('measures a degree of latitude as sixty nautical miles', () => {
    expect(greatCircleDistance(at(0, 0), at(1, 0))).toBeCloseTo(60, 1);
  });

  it('is zero for a position and itself', () => {
    expect(greatCircleDistance(at(34.6712, 33.0413), at(34.6712, 33.0413))).toBe(0);
  });

  it('is symmetric', () => {
    const piraeus = at(37.94, 23.64);
    const limassol = at(34.65, 33.03);
    expect(greatCircleDistance(piraeus, limassol)).toBeCloseTo(
      greatCircleDistance(limassol, piraeus),
      9,
    );
  });

  it('measures Piraeus to Limassol as the 495 miles a chart gives', () => {
    expect(greatCircleDistance(at(37.94, 23.64), at(34.65, 33.03))).toBeCloseTo(495.2, 1);
  });
});

describe('initialBearing', () => {
  it('reports the cardinal directions', () => {
    expect(initialBearing(at(0, 0), at(1, 0))).toBeCloseTo(0, 6);
    expect(initialBearing(at(0, 0), at(0, 1))).toBeCloseTo(90, 6);
    expect(initialBearing(at(1, 0), at(0, 0))).toBeCloseTo(180, 6);
    expect(initialBearing(at(0, 1), at(0, 0))).toBeCloseTo(270, 6);
  });

  it('leans north of east on an easterly great circle in the northern hemisphere', () => {
    const bearing = initialBearing(at(35, 30), at(35, 33));
    expect(bearing).toBeLessThan(90);
    expect(bearing).toBeGreaterThan(88);
  });
});

describe('interpolatePosition', () => {
  it('returns the ends exactly, and clamps beyond them', () => {
    const from = at(34.5, 32.8);
    const to = at(35.1, 33.4);
    expect(interpolatePosition(from, to, 0)).toEqual(from);
    expect(interpolatePosition(from, to, 1)).toEqual(to);
    expect(interpolatePosition(from, to, -3)).toEqual(from);
    expect(interpolatePosition(from, to, 4)).toEqual(to);
  });

  it('halves a leg along the equator', () => {
    const middle = interpolatePosition(at(0, 0), at(0, 10), 0.5);
    expect(middle.latitude).toBeCloseTo(0, 9);
    expect(middle.longitude).toBeCloseTo(5, 9);
  });

  it('puts the midpoint half the distance from each end', () => {
    const from = at(37.94, 23.64);
    const to = at(34.5903, 32.8735);
    const middle = interpolatePosition(from, to, 0.5);
    const whole = greatCircleDistance(from, to);
    expect(greatCircleDistance(from, middle)).toBeCloseTo(whole / 2, 6);
    expect(greatCircleDistance(middle, to)).toBeCloseTo(whole / 2, 6);
  });

  it('has nothing to interpolate between coincident fixes', () => {
    const fix = at(34.4, 33.1);
    expect(interpolatePosition(fix, { ...fix }, 0.5)).toEqual(fix);
  });
});

describe('normaliseBearing', () => {
  it('wraps in both directions', () => {
    expect(normaliseBearing(0)).toBe(0);
    expect(normaliseBearing(360)).toBe(0);
    expect(normaliseBearing(450)).toBe(90);
    expect(normaliseBearing(-90)).toBe(270);
  });
});
