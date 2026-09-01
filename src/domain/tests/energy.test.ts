import { describe, expect, it } from 'vitest';
import { carbonDioxideRate, energyBudget, ENERGY_CONSUMER_IDS } from '../energy';
import {
  toCompassDegrees,
  toKilogramsPerHour,
  toKilowatts,
  toKnots,
  toRpm,
} from '../primitives';
import { propulsionState } from '../propulsion';
import type { Machinery, NavigationalStatus, VesselMotion } from '../vessel';

const MACHINERY: Machinery = {
  engines: {
    count: 1,
    ratedPower: toKilowatts(10_000),
    ratedShaftSpeed: toRpm(100),
    serviceSpeed: toKnots(15),
  },
  electrical: {
    hotel: toKilowatts(200),
    deckMachinery: toKilowatts(400),
    navigation: toKilowatts(20),
  },
};

const motion = (status: NavigationalStatus, speed: number): VesselMotion => {
  switch (status) {
    case 'At anchor':
    case 'Moored':
    case 'Aground':
      return { kind: 'stationary', status, speedOverGround: toKnots(speed) };
    default:
      return {
        kind: 'under-way',
        status,
        speedOverGround: toKnots(speed),
        courseOverGround: toCompassDegrees(90),
        heading: toCompassDegrees(90),
      };
  }
};

const budgetFor = (status: NavigationalStatus, speed: number) => {
  const where = motion(status, speed);
  return energyBudget(MACHINERY, where, propulsionState(MACHINERY.engines, where));
};

const consumer = (status: NavigationalStatus, speed: number, id: string) => {
  const found = budgetFor(status, speed).consumers.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`No consumer ${id}`);
  return found;
};

describe('energyBudget', () => {
  it('always reports the same four consumers in the same order', () => {
    const atSea = budgetFor('Under way using engine', 15);
    const alongside = budgetFor('Moored', 0);

    expect(atSea.consumers.map((each) => each.id)).toEqual([...ENERGY_CONSUMER_IDS]);
    expect(alongside.consumers.map((each) => each.id)).toEqual([...ENERGY_CONSUMER_IDS]);
  });

  it('adds up: the consumers are the total, and their shares are all of it', () => {
    const budget = budgetFor('Under way using engine', 12);
    const summed = budget.consumers.reduce((total, each) => total + each.power, 0);
    const shares = budget.consumers.reduce((total, each) => total + each.share, 0);

    expect(summed).toBeCloseTo(budget.totalPower, 6);
    expect(shares).toBeCloseTo(100, 6);
  });

  it('runs the deck machinery on standby at sea and in earnest alongside', () => {
    expect(consumer('Under way using engine', 12, 'deck-machinery').power).toBeCloseTo(100, 6);
    expect(consumer('Moored', 0, 'deck-machinery').power).toBeCloseTo(400, 6);
    expect(consumer('At anchor', 0, 'deck-machinery').power).toBeCloseTo(140, 6);
    expect(consumer('Engaged in fishing', 3, 'deck-machinery').power).toBeCloseTo(400, 6);
  });

  it('says why each load is what it is', () => {
    expect(consumer('Moored', 0, 'deck-machinery').detail).toBe('Cargo handling alongside');
    expect(consumer('Moored', 0, 'propulsion').detail).toContain('not under way');
    expect(consumer('Under way sailing', 6, 'propulsion').detail).toContain('under sail');
  });

  it('leaves the whole budget to the generators when the engines are stopped', () => {
    const budget = budgetFor('Moored', 0);

    expect(consumer('Moored', 0, 'propulsion').power).toBe(0);
    expect(budget.totalPower).toBeCloseTo(620, 6);
    expect(budget.electricalPower).toBeCloseTo(620, 6);
    expect(budget.fuelRate).toBeCloseTo((620 * 215) / 1000, 6);
  });

  it('bills the main engine and the generators to the same fuel figure', () => {
    const where = motion('Under way using engine', 15);
    const propulsion = propulsionState(MACHINERY.engines, where);
    const budget = energyBudget(MACHINERY, where, propulsion);

    if (propulsion.kind !== 'running') throw new Error('expected running engines');
    expect(budget.fuelRate).toBeCloseTo(
      propulsion.fuelRate + (budget.electricalPower * 215) / 1000,
      6,
    );
    expect(budget.totalPower).toBeCloseTo(propulsion.power + budget.electricalPower, 6);
  });
});

describe('carbonDioxideRate', () => {
  it('follows the fuel by a fixed factor', () => {
    expect(carbonDioxideRate(toKilogramsPerHour(1000))).toBeCloseTo(3114, 6);
    expect(carbonDioxideRate(toKilogramsPerHour(0))).toBe(0);
  });
});
