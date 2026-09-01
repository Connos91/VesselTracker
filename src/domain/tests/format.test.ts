import { describe, expect, it } from 'vitest';
import {
  formatBearing,
  formatDecimalDegrees,
  formatDistance,
  formatDuration,
  formatInstant,
  formatLatitude,
  formatLongitude,
  formatPosition,
  formatSpeed,
  toDegreesMinutesSeconds,
} from '../format';
import {
  parseTimestamp,
  toCompassDegrees,
  toKnots,
  toLatitude,
  toLongitude,
  toMilliseconds,
  toNauticalMiles,
} from '../primitives';

describe('toDegreesMinutesSeconds', () => {
  it('splits an angle into degrees, minutes and seconds', () => {
    const dms = toDegreesMinutesSeconds(34.6712);
    expect(dms.degrees).toBe(34);
    expect(dms.minutes).toBe(40);
    expect(dms.seconds).toBeCloseTo(16.3, 5);
  });

  it('carries into the degrees instead of emitting 60 seconds', () => {
    expect(toDegreesMinutesSeconds(34.99999999)).toEqual({
      degrees: 35,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('formatLatitude', () => {
  it('renders northern latitudes with two degree digits', () => {
    expect(formatLatitude(toLatitude(34.6712))).toBe(`34° 40' 16.3" N`);
  });

  it('renders southern latitudes with an S hemisphere', () => {
    expect(formatLatitude(toLatitude(-34.6712))).toBe(`34° 40' 16.3" S`);
  });

  it('zero-pads minutes and seconds', () => {
    expect(formatLatitude(toLatitude(5.5))).toBe(`05° 30' 00.0" N`);
  });
});

describe('formatLongitude', () => {
  it('renders eastern longitudes with three degree digits', () => {
    expect(formatLongitude(toLongitude(33.0413))).toBe(`033° 02' 28.7" E`);
  });

  it('renders western longitudes with a W hemisphere', () => {
    expect(formatLongitude(toLongitude(-0.5))).toBe(`000° 30' 00.0" W`);
  });
});

describe('formatPosition', () => {
  it('joins latitude and longitude', () => {
    const position = {
      latitude: toLatitude(34.6712),
      longitude: toLongitude(33.0413),
    };
    expect(formatPosition(position)).toBe(`34° 40' 16.3" N, 033° 02' 28.7" E`);
    expect(formatDecimalDegrees(position)).toBe('34.6712° N, 33.0413° E');
  });
});

describe('scalar formatters', () => {
  it('formats speed in knots to one decimal', () => {
    expect(formatSpeed(toKnots(12.4))).toBe('12.4 kn');
    expect(formatSpeed(toKnots(0))).toBe('0.0 kn');
  });

  it('formats bearings zero-padded to three digits', () => {
    expect(formatBearing(toCompassDegrees(87))).toBe('087°');
    expect(formatBearing(toCompassDegrees(275))).toBe('275°');
    expect(formatBearing(toCompassDegrees(0))).toBe('000°');
  });
});

describe('branded constructors reject out-of-range input', () => {
  it('rejects impossible coordinates and bearings', () => {
    expect(() => toLatitude(91)).toThrow(RangeError);
    expect(() => toLongitude(-181)).toThrow(RangeError);
    expect(() => toCompassDegrees(360)).toThrow(RangeError);
    expect(() => toKnots(-1)).toThrow(RangeError);
  });
});

describe('the passage formatters', () => {
  it('formats a distance, keeping a decimal on a short leg', () => {
    expect(formatDistance(toNauticalMiles(502.9))).toBe('503 nm');
    expect(formatDistance(toNauticalMiles(2.94))).toBe('2.9 nm');
    expect(formatDistance(toNauticalMiles(0))).toBe('0 nm');
  });

  it('formats a span in hours and padded minutes', () => {
    expect(formatDuration(toMilliseconds(26 * 3_600_000 + 60_000))).toBe('26 h 01 min');
    expect(formatDuration(toMilliseconds(44 * 60_000))).toBe('44 min');
    expect(formatDuration(toMilliseconds(0))).toBe('0 min');
  });

  it('formats an instant in UTC, whatever the reader’s time zone', () => {
    expect(formatInstant(parseTimestamp('2026-08-30T09:40:00Z'))).toBe('30 Aug 09:40 UTC');
    expect(formatInstant(parseTimestamp('2026-01-05T00:05:00Z'))).toBe('05 Jan 00:05 UTC');
  });

  it('rejects an instant that is not a time', () => {
    expect(() => parseTimestamp('yesterday')).toThrow(RangeError);
  });
});
