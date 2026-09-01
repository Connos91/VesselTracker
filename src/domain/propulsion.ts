import { assertNever } from './assertNever';
import {
  toGramsPerKilowattHour,
  toKilogramsPerHour,
  toKilowatts,
  toPercent,
  toRpm,
} from './primitives';
import type {
  GramsPerKilowattHour,
  Kilowatts,
  KilogramsPerHour,
  Knots,
  Percent,
  Rpm,
} from './primitives';
import type { MainEngines, UnderWayMotion, VesselMotion } from './vessel';

const SERVICE_RATING = 0.85;
const TRAWLING_RATING = 0.75;
const OPTIMUM_CONSUMPTION = 180;
const OPTIMUM_LOAD = 0.8;
const PART_LOAD_PENALTY = 0.6;

export type EngineLoadRule = 'propeller-law' | 'gear-load';

export type EnginesStoppedReason = 'under-sail' | 'not-under-way';

export interface EnginesRunning {
  readonly kind: 'running';
  readonly rule: EngineLoadRule;
  readonly power: Kilowatts;
  readonly load: Percent;
  readonly shaftSpeed: Rpm;
  readonly specificConsumption: GramsPerKilowattHour;
  readonly fuelRate: KilogramsPerHour;
}
export interface EnginesStopped {
  readonly kind: 'stopped';
  readonly reason: EnginesStoppedReason;
}
export type PropulsionState = EnginesRunning | EnginesStopped;
export const specificConsumption = (loadFraction: number): GramsPerKilowattHour => {
  const penalty = PART_LOAD_PENALTY * (loadFraction - OPTIMUM_LOAD) ** 2;
  return toGramsPerKilowattHour(OPTIMUM_CONSUMPTION * (1 + penalty));
};
export const propellerLawLoad = (engines: MainEngines, speed: Knots): number => {
  const ratio = speed / engines.serviceSpeed;
  return Math.min(SERVICE_RATING * ratio ** 3, 1);
};

const running = (
  engines: MainEngines,
  loadFraction: number,
  rule: EngineLoadRule,
): EnginesRunning => {
  const power = engines.ratedPower * loadFraction;
  const consumption = specificConsumption(loadFraction);
  return {
    kind: 'running',
    rule,
    power: toKilowatts(power),
    load: toPercent(loadFraction * 100),
    shaftSpeed: toRpm(engines.ratedShaftSpeed * Math.cbrt(loadFraction)),
    specificConsumption: consumption,
    fuelRate: toKilogramsPerHour((power * consumption) / 1000),
  };
};

const underWayPropulsion = (engines: MainEngines, motion: UnderWayMotion): PropulsionState => {
  switch (motion.status) {
    case 'Under way sailing':
      return { kind: 'stopped', reason: 'under-sail' };
    case 'Engaged in fishing':
      return running(engines, TRAWLING_RATING, 'gear-load');
    case 'Under way using engine':
    case 'Restricted manoeuvrability':
      return running(
        engines,
        propellerLawLoad(engines, motion.speedOverGround),
        'propeller-law',
      );
    default:
      return assertNever(motion.status, 'under-way navigational status');
  }
};

export const propulsionState = (
  engines: MainEngines,
  motion: VesselMotion,
): PropulsionState => {
  switch (motion.kind) {
    case 'stationary':
      return { kind: 'stopped', reason: 'not-under-way' };
    case 'under-way':
      return underWayPropulsion(engines, motion);
    default:
      return assertNever(motion, 'vessel motion');
  }
};

export const propulsionPower = (state: PropulsionState): Kilowatts => {
  switch (state.kind) {
    case 'running':
      return state.power;
    case 'stopped':
      return toKilowatts(0);
    default:
      return assertNever(state, 'propulsion state');
  }
};

export const propulsionFuelRate = (state: PropulsionState): KilogramsPerHour => {
  switch (state.kind) {
    case 'running':
      return state.fuelRate;
    case 'stopped':
      return toKilogramsPerHour(0);
    default:
      return assertNever(state, 'propulsion state');
  }
};
