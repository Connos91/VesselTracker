import { describe, expect, it } from 'vitest';
import { parseVessel } from '../../data/parseVessel';
import { SEED_VESSELS } from '../../data/seedVessels';
import { glyphForMotion, isUnderWay, isVesselType } from '../vessel';

const vesselNamed = (name: string) => {
  const vessel = SEED_VESSELS.find((candidate) => candidate.name === name);
  if (vessel === undefined) throw new Error(`No seed vessel named ${name}`);
  return vessel;
};

describe('under-way discrimination', () => {
  it('models a moving vessel with a course and heading', () => {
    const motion = vesselNamed('Aegean Star').motion;
    expect(motion.kind).toBe('under-way');
    if (!isUnderWay(motion)) throw new Error('expected an under-way vessel');
    expect(motion.heading).toBe(85);
    expect(motion.courseOverGround).toBe(87);
    expect(motion.status).toBe('Under way using engine');
  });

  it('models a moored vessel with no heading at all', () => {
    const motion = vesselNamed('Port Sentinel').motion;
    expect(motion.kind).toBe('stationary');
    expect(isUnderWay(motion)).toBe(false);
    expect(motion).not.toHaveProperty('heading');
  });

  it('treats an anchored vessel with residual speed as stationary', () => {
    expect(vesselNamed('Nostos').motion.kind).toBe('stationary');
  });
});

describe('glyphForMotion', () => {
  it('draws under-way vessels as an arrow rotated to the heading', () => {
    expect(glyphForMotion(vesselNamed('Blue Horizon').motion)).toEqual({
      shape: 'arrow',
      rotationDegrees: 109,
    });
  });

  it('draws vessels that are not under way as a circle', () => {
    expect(glyphForMotion(vesselNamed('Nostos').motion)).toEqual({ shape: 'circle' });
    expect(glyphForMotion(vesselNamed('Port Sentinel').motion)).toEqual({ shape: 'circle' });
  });
});

describe('seed data boundary', () => {
  it('parses every seed row into branded domain values', () => {
    expect(SEED_VESSELS).toHaveLength(9);
    expect(vesselNamed('Ocean Pearl').mmsi).toBe('211234567');
    expect(vesselNamed('Ocean Pearl').imo).toBe('IMO9456789');
    expect(vesselNamed('Ocean Pearl').position.latitude).toBe(34.4321);
  });

  it('rejects a malformed record at the boundary', () => {
    expect(() =>
      parseVessel({
        id: 'vessel-bad',
        name: 'Bad Data',
        mmsi: '123',
        imo: 'IMO9999999',
        type: 'Cargo',
        lat: 34,
        lon: 33,
        speed: 1,
        course: 10,
        heading: 10,
        destination: 'Nowhere',
        status: 'Under way using engine',
        wind: { from: 265, speed: 14.5 },
        machinery: {
          engines: 1,
          ratedKw: 7800,
          ratedRpm: 105,
          serviceSpeedKn: 13.5,
          hotelKw: 220,
          deckKw: 180,
          navigationKw: 18,
        },
      }),
    ).toThrow(RangeError);
  });
});

describe('isVesselType', () => {
  it('accepts known types and rejects anything else', () => {
    expect(isVesselType('Tanker')).toBe(true);
    expect(isVesselType('Submarine')).toBe(false);
    expect(isVesselType(42)).toBe(false);
  });
});
