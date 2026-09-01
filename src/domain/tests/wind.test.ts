import { describe, expect, it } from 'vitest';
import { SEED_VESSELS } from '../../data/seedVessels';
import { toCompassDegrees, toKnots } from '../primitives';
import type { UnderWayMotion, VesselMotion, WindObservation } from '../vessel';
import { apparentWind, beaufortForce, windSector } from '../wind';

const wind = (from: number, speed: number): WindObservation => {
  return { fromDirection: toCompassDegrees(from), speed: toKnots(speed) };
};

const steaming = (course: number, speed: number): UnderWayMotion => {
  return {
    kind: 'under-way',
    status: 'Under way using engine',
    speedOverGround: toKnots(speed),
    courseOverGround: toCompassDegrees(course),
    heading: toCompassDegrees(course),
  };
};

const MOORED: VesselMotion = {
  kind: 'stationary',
  status: 'Moored',
  speedOverGround: toKnots(0),
};

const vesselNamed = (name: string) => {
  const vessel = SEED_VESSELS.find((candidate) => candidate.name === name);
  if (vessel === undefined) throw new Error(`No seed vessel named ${name}`);
  return vessel;
};

describe('apparentWind', () => {
  it('reads the true wind, with no bow to measure against, when not under way', () => {
    const observed = apparentWind(wind(270, 12), MOORED);

    expect(observed.kind).toBe('ambient');
    expect(observed.speed).toBe(12);
    expect(observed.fromDirection).toBe(270);
    expect(observed).not.toHaveProperty('offBow');
  });

  it('adds the vessel’s own speed to a head wind', () => {
    const observed = apparentWind(wind(0, 10), steaming(0, 10));

    expect(observed.speed).toBeCloseTo(20, 6);
    expect(observed.fromDirection).toBeCloseTo(0, 6);
    if (observed.kind !== 'relative') throw new Error('expected a relative wind');
    expect(observed.offBow).toBeCloseTo(0, 6);
    expect(observed.sector).toBe('ahead');
  });

  it('cancels a following wind the vessel is keeping pace with', () => {
    const observed = apparentWind(wind(180, 10), steaming(0, 10));

    expect(observed.speed).toBe(0);
    expect(observed.fromDirection).toBe(180);

    if (observed.kind !== 'relative') throw new Error('expected a relative wind');
    expect(observed.sector).toBe('astern');
  });

  it('draws a beam wind forward as the vessel makes way', () => {
    const observed = apparentWind(wind(90, 10), steaming(0, 10));

    expect(observed.speed).toBeCloseTo(Math.hypot(10, 10), 6);
    expect(observed.fromDirection).toBeCloseTo(45, 6);
    if (observed.kind !== 'relative') throw new Error('expected a relative wind');
    expect(observed.sector).toBe('on the starboard bow');
  });

  it('measures the angle off the bow from the heading, not the course', () => {
    const crabbing: UnderWayMotion = {
      kind: 'under-way',
      status: 'Under way using engine',
      speedOverGround: toKnots(10),
      courseOverGround: toCompassDegrees(0),
      heading: toCompassDegrees(10),
    };
    const observed = apparentWind(wind(0, 10), crabbing);

    if (observed.kind !== 'relative') throw new Error('expected a relative wind');
    expect(observed.fromDirection).toBeCloseTo(0, 6);
    expect(observed.offBow).toBeCloseTo(350, 6);
    expect(observed.sector).toBe('ahead');
  });

  it('leaves almost nothing on a vessel running before the wind', () => {
    const observed = apparentWind(
      vesselNamed('Aegean Star').wind,
      vesselNamed('Aegean Star').motion,
    );

    expect(observed.speed).toBeCloseTo(2.2, 1);
    expect(observed.fromDirection).toBeCloseTo(253, 0);
    if (observed.kind !== 'relative') throw new Error('expected a relative wind');
    expect(observed.sector).toBe('astern');
  });
});

describe('windSector', () => {
  it('names the eight points around the bow', () => {
    expect(windSector(toCompassDegrees(0))).toBe('ahead');
    expect(windSector(toCompassDegrees(45))).toBe('on the starboard bow');
    expect(windSector(toCompassDegrees(90))).toBe('on the starboard beam');
    expect(windSector(toCompassDegrees(135))).toBe('on the starboard quarter');
    expect(windSector(toCompassDegrees(180))).toBe('astern');
    expect(windSector(toCompassDegrees(225))).toBe('on the port quarter');
    expect(windSector(toCompassDegrees(270))).toBe('on the port beam');
    expect(windSector(toCompassDegrees(315))).toBe('on the port bow');
  });

  it('wraps the last half sector back round to ahead', () => {
    expect(windSector(toCompassDegrees(22))).toBe('ahead');
    expect(windSector(toCompassDegrees(23))).toBe('on the starboard bow');
    expect(windSector(toCompassDegrees(337))).toBe('on the port bow');
    expect(windSector(toCompassDegrees(338))).toBe('ahead');
    expect(windSector(toCompassDegrees(359.9))).toBe('ahead');
  });
});

describe('beaufortForce', () => {
  it('places a speed in the force that claims it', () => {
    expect(beaufortForce(toKnots(0))).toEqual({ force: 0, description: 'Calm' });
    expect(beaufortForce(toKnots(3))).toEqual({ force: 1, description: 'Light air' });
    expect(beaufortForce(toKnots(14.5))).toEqual({ force: 4, description: 'Moderate breeze' });
    expect(beaufortForce(toKnots(30))).toEqual({ force: 7, description: 'Near gale' });
  });

  it('puts the boundary speed in the higher force', () => {
    expect(beaufortForce(toKnots(16.9)).force).toBe(4);
    expect(beaufortForce(toKnots(17)).force).toBe(5);
    expect(beaufortForce(toKnots(63.9)).force).toBe(11);
    expect(beaufortForce(toKnots(64)).force).toBe(12);
  });

  it('has nowhere above hurricane force to go', () => {
    expect(beaufortForce(toKnots(140))).toEqual({ force: 12, description: 'Hurricane force' });
  });
});
