import { describe, expect, it } from 'vitest';
import { toCompassDegrees, toKilowatts, toKnots, toRpm } from '../primitives';
import {
  propellerLawLoad,
  propulsionFuelRate,
  propulsionPower,
  propulsionState,
  specificConsumption,
} from '../propulsion';
import type { MainEngines, UnderWayStatus, VesselMotion } from '../vessel';

const ENGINES: MainEngines = {
  count: 1,
  ratedPower: toKilowatts(10_000),
  ratedShaftSpeed: toRpm(100),
  serviceSpeed: toKnots(15),
};

const underWay = (status: UnderWayStatus, speed: number): VesselMotion => {
  return {
    kind: 'under-way',
    status,
    speedOverGround: toKnots(speed),
    courseOverGround: toCompassDegrees(90),
    heading: toCompassDegrees(90),
  };
};

const AT_ANCHOR: VesselMotion = {
  kind: 'stationary',
  status: 'At anchor',
  speedOverGround: toKnots(0.2),
};

describe('propellerLawLoad', () => {
  it('puts the vessel on the service rating at its service speed', () => {
    expect(propellerLawLoad(ENGINES, toKnots(15))).toBeCloseTo(0.85, 6);
  });

  it('follows the cube of speed: twice as fast asks for eight times the power', () => {
    const slow = propellerLawLoad(ENGINES, toKnots(6));
    const fast = propellerLawLoad(ENGINES, toKnots(12));
    expect(fast / slow).toBeCloseTo(8, 6);
  });

  it('cannot ask for more than the engine has', () => {
    expect(propellerLawLoad(ENGINES, toKnots(40))).toBe(1);
  });
});

describe('specificConsumption', () => {
  it('is at its best near four-fifths load and worse either side', () => {
    const best = specificConsumption(0.8);
    expect(best).toBeLessThan(specificConsumption(0.3));
    expect(best).toBeLessThan(specificConsumption(1));
    expect(best).toBeCloseTo(180, 6);
  });
});

describe('propulsionState', () => {
  it('derives load, shaft speed and fuel for a vessel under engine', () => {
    const state = propulsionState(ENGINES, underWay('Under way using engine', 15));

    if (state.kind !== 'running') throw new Error('expected running engines');
    expect(state.rule).toBe('propeller-law');
    expect(state.load).toBeCloseTo(85, 6);
    expect(state.power).toBeCloseTo(8500, 6);
    expect(state.shaftSpeed).toBeCloseTo(100 * Math.cbrt(0.85), 6);
    expect(state.fuelRate).toBeCloseTo((8500 * state.specificConsumption) / 1000, 6);
  });

  it('stops the main engine of a vessel making way under sail', () => {
    const state = propulsionState(ENGINES, underWay('Under way sailing', 6));

    expect(state).toEqual({ kind: 'stopped', reason: 'under-sail' });
  });

  it('stops the main engine of a vessel that is not under way', () => {
    const state = propulsionState(ENGINES, AT_ANCHOR);

    expect(state).toEqual({ kind: 'stopped', reason: 'not-under-way' });
  });

  it('loads a trawler from its gear, not from its speed over ground', () => {
    const slow = propulsionState(ENGINES, underWay('Engaged in fishing', 2));
    const faster = propulsionState(ENGINES, underWay('Engaged in fishing', 4));

    if (slow.kind !== 'running' || faster.kind !== 'running') {
      throw new Error('expected running engines');
    }
    expect(slow.rule).toBe('gear-load');
    expect(slow.load).toBeCloseTo(75, 6);
    expect(faster.load).toBe(slow.load);
  });

  it('reports no power and no fuel while the engines are stopped', () => {
    const state = propulsionState(ENGINES, AT_ANCHOR);

    expect(propulsionPower(state)).toBe(0);
    expect(propulsionFuelRate(state)).toBe(0);
  });

  it('burns fuel in proportion to the work done', () => {
    const state = propulsionState(ENGINES, underWay('Under way using engine', 15));

    if (state.kind !== 'running') throw new Error('expected running engines');
    expect(propulsionPower(state)).toBe(state.power);
    expect(propulsionFuelRate(state)).toBe(state.fuelRate);
  });
});
