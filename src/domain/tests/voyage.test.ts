import { describe, expect, it } from 'vitest';
import { landUnder } from '../../data/coastline';
import { SEED_VESSELS } from '../../data/seedVessels';
import { greatCircleDistance } from '../geo';
import { parseTimestamp, toLatitude, toLongitude } from '../primitives';
import type { Vessel } from '../vessel';
import { formatDecimalDegrees, formatDuration } from '../format';
import { buildVoyage, sampleVoyage, trackRoute, trackRun } from '../voyage';
import type { TrackReport, Voyage } from '../voyage';

const report = (iso: string, latitude: number, longitude: number): TrackReport => {
  return {
    at: parseTimestamp(iso),
    position: { latitude: toLatitude(latitude), longitude: toLongitude(longitude) },
  };
};

const corner = (): Voyage => {
  return buildVoyage({
    from: 'A',
    to: 'B',
    track: [
      report('2026-08-30T00:00:00Z', 0, 0),
      report('2026-08-30T02:00:00Z', 0, 1),
      report('2026-08-30T04:00:00Z', 1, 1),
    ],
  });
};

const elementAt = <Item>(items: readonly Item[], index: number): Item => {
  const item = items[index];
  if (item === undefined) throw new Error(`No element at index ${index}`);
  return item;
};

const vesselNamed = (name: string): Vessel => {
  const vessel = SEED_VESSELS.find((candidate) => candidate.name === name);
  if (vessel === undefined) throw new Error(`No seed vessel named ${name}`);
  return vessel;
};

const voyageOf = (name: string): Voyage => {
  const { voyage } = vesselNamed(name);
  if (voyage === null) throw new Error(`${name} has no voyage`);
  return voyage;
};

describe('buildVoyage', () => {
  it('derives distance, course and speed from the fixes alone', () => {
    const voyage = corner();

    expect(voyage.legs).toHaveLength(2);
    expect(voyage.legs[0].course).toBeCloseTo(90, 6);
    expect(voyage.legs[0].distance).toBeCloseTo(60, 1);
    expect(voyage.legs[0].speed).toBeCloseTo(30, 1);
    expect(elementAt(voyage.legs, 1).course).toBeCloseTo(0, 6);
  });

  it('accumulates the distance run and the duration over the whole track', () => {
    const voyage = corner();

    expect(voyage.distance).toBeCloseTo(120, 0);
    expect(voyage.duration).toBe(4 * 3_600_000);
    expect(voyage.departedAt).toBe(parseTimestamp('2026-08-30T00:00:00Z'));
    expect(voyage.reportedAt).toBe(parseTimestamp('2026-08-30T04:00:00Z'));
    expect(voyage.fixes[0].distanceRun).toBe(0);
  });

  it('rejects a track with nothing to play back', () => {
    expect(() => buildVoyage({ from: 'A', to: 'B', track: [] })).toThrow(RangeError);
    expect(() =>
      buildVoyage({ from: 'A', to: 'B', track: [report('2026-08-30T00:00:00Z', 0, 0)] }),
    ).toThrow(RangeError);
  });

  it('rejects fixes that do not advance in time', () => {
    expect(() =>
      buildVoyage({
        from: 'A',
        to: 'B',
        track: [report('2026-08-30T02:00:00Z', 0, 0), report('2026-08-30T01:00:00Z', 0, 1)],
      }),
    ).toThrow(RangeError);
  });
});

describe('sampleVoyage', () => {
  it('sits on the departure at the start and the last fix at the end', () => {
    const voyage = corner();

    const departure = sampleVoyage(voyage, 0);
    expect(departure.position).toEqual(voyage.fixes[0].position);
    expect(departure.distanceRun).toBe(0);
    expect(departure.at).toBe(voyage.departedAt);

    const arrival = sampleVoyage(voyage, voyage.duration);
    expect(arrival.position).toEqual(elementAt(voyage.fixes, 2).position);
    expect(arrival.distanceRun).toBeCloseTo(voyage.distance, 6);
    expect(arrival.at).toBe(voyage.reportedAt);
  });

  it('clamps to the record rather than extrapolating past either end', () => {
    const voyage = corner();

    expect(sampleVoyage(voyage, -50_000_000)).toEqual(sampleVoyage(voyage, 0));
    expect(sampleVoyage(voyage, 50_000_000)).toEqual(sampleVoyage(voyage, voyage.duration));
  });

  it('interpolates along the leg it is on, and takes that leg’s course and speed', () => {
    const voyage = corner();
    const middle = sampleVoyage(voyage, 3_600_000);

    expect(middle.position.longitude).toBeCloseTo(0.5, 6);
    expect(middle.position.latitude).toBeCloseTo(0, 6);
    expect(middle.course).toBeCloseTo(90, 6);
    expect(middle.distanceRun).toBeCloseTo(30, 1);
    expect(middle.elapsed).toBe(3_600_000);
  });

  it('changes leg at the fix between them', () => {
    const voyage = corner();

    expect(sampleVoyage(voyage, 2 * 3_600_000).course).toBeCloseTo(0, 6);
    expect(sampleVoyage(voyage, 3 * 3_600_000).position.latitude).toBeCloseTo(0.5, 4);
  });
});

describe('the track behind and ahead of the vessel', () => {
  it('draws the whole recorded track as the route', () => {
    const voyage = corner();
    expect(trackRoute(voyage)).toEqual(voyage.fixes.map((fix) => fix.position));
  });

  it('ends the run at the vessel, not at the last fix it passed', () => {
    const voyage = corner();
    const sample = sampleVoyage(voyage, 3_600_000);
    const run = trackRun(voyage, sample);

    expect(run).toHaveLength(2);
    expect(run[0]).toEqual(voyage.fixes[0].position);
    expect(run[1]).toEqual(sample.position);
  });

  it('covers the whole route once the passage has been played out', () => {
    const voyage = corner();
    expect(trackRun(voyage, sampleVoyage(voyage, voyage.duration))).toEqual(trackRoute(voyage));
  });
});

describe('the seeded passages', () => {
  it('ends every track on the vessel it belongs to', () => {
    for (const vessel of SEED_VESSELS) {
      if (vessel.voyage === null) continue;
      const arrival = sampleVoyage(vessel.voyage, vessel.voyage.duration);
      expect(arrival.position).toEqual(vessel.position);
    }
  });

  it('runs Blue Horizon down the Aegean from Piraeus in a day and a bit', () => {
    const voyage = voyageOf('Blue Horizon');

    expect(voyage.from).toBe('Piraeus');
    expect(voyage.to).toBe('Haifa');
    expect(voyage.duration / 3_600_000).toBeCloseTo(28.25, 2);
    expect(voyage.distance).toBeCloseTo(554.3, 1);
    expect(voyage.distance).toBeGreaterThan(
      greatCircleDistance(voyage.fixes[0].position, vesselNamed('Blue Horizon').position),
    );
  });

  it('keeps every seeded leg at a speed a vessel of its type could hold', () => {
    for (const vessel of SEED_VESSELS) {
      if (vessel.voyage === null) continue;
      for (const leg of vessel.voyage.legs) {
        expect(leg.speed).toBeGreaterThan(0);
        expect(leg.speed).toBeLessThanOrEqual(vessel.machinery.engines.serviceSpeed);
      }
    }
  });

  it('leaves the final leg on the course the vessel is reporting now', () => {
    // independently — that they agree is a property of the data, not a copy.
    for (const vessel of SEED_VESSELS) {
      if (vessel.voyage === null || vessel.motion.kind !== 'under-way') continue;
      const legs = vessel.voyage.legs;
      const last = elementAt(legs, legs.length - 1);
      const difference = Math.abs(last.course - vessel.motion.courseOverGround);
      expect(Math.min(difference, 360 - difference)).toBeLessThan(15);
    }
  });
});

describe('the seeded passages stay at sea', () => {
  const SAMPLE_INTERVAL = 2 * 60_000;

  it('never puts a vessel over land, at any moment of any track', () => {
    for (const vessel of SEED_VESSELS) {
      const { voyage } = vessel;
      if (voyage === null) continue;

      for (let elapsed = 0; elapsed <= voyage.duration; elapsed += SAMPLE_INTERVAL) {
        const sample = sampleVoyage(voyage, elapsed);
        const land = landUnder(sample.position);
        if (land !== null) {
          throw new Error(
            `${vessel.name} is over ${land.name} at ${formatDuration(sample.elapsed)} into the ${voyage.from} to ${voyage.to} passage, at ${formatDecimalDegrees(sample.position)}`,
          );
        }
      }
    }
  });

  it('leaves and arrives on the water too', () => {
    for (const vessel of SEED_VESSELS) {
      if (vessel.voyage === null) continue;
      for (const fix of vessel.voyage.fixes) {
        expect(landUnder(fix.position)).toBeNull();
      }
    }
  });
});
