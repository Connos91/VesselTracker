import { assertNever } from './assertNever';
import { propulsionFuelRate, propulsionPower, type PropulsionState } from './propulsion';
import { toKilogramsPerHour, toKilowatts, toPercent } from './primitives';
import type { KilogramsPerHour, Kilowatts, Percent } from './primitives';
import type { ElectricalLoads, Machinery, VesselMotion } from './vessel';

const GENERATOR_CONSUMPTION = 215;
const CARBON_FACTOR = 3.114;

export const ENERGY_CONSUMER_IDS = [
  'propulsion',
  'hotel',
  'deck-machinery',
  'navigation',
] as const;

export type EnergyConsumerId = (typeof ENERGY_CONSUMER_IDS)[number];

export interface EnergyConsumer {
  readonly id: EnergyConsumerId;
  readonly name: string;
  readonly detail: string;
  readonly power: Kilowatts;
  readonly share: Percent;
}

export interface EnergyBudget {
  readonly consumers: readonly EnergyConsumer[];
  readonly totalPower: Kilowatts;
  readonly electricalPower: Kilowatts;
  readonly fuelRate: KilogramsPerHour;
}

interface Duty {
  readonly factor: number;
  readonly detail: string;
}

const deckMachineryDuty = (motion: VesselMotion): Duty => {
  switch (motion.status) {
    case 'Under way using engine':
    case 'Under way sailing':
    case 'Restricted manoeuvrability':
      return { factor: 0.25, detail: 'Winches and cranes on standby at sea' };
    case 'Engaged in fishing':
      return { factor: 1, detail: 'Trawl winches and refrigeration working' };
    case 'Moored':
      return { factor: 1, detail: 'Cargo handling alongside' };
    case 'At anchor':
      return { factor: 0.35, detail: 'Windlass and deck lighting at anchor' };
    case 'Aground':
      return { factor: 0.35, detail: 'Deck lighting and emergency services' };
    default:
      return assertNever(motion, 'vessel motion');
  }
};

const propulsionDetail = (state: PropulsionState): string => {
  switch (state.kind) {
    case 'running':
      switch (state.rule) {
        case 'propeller-law':
          return 'Main engine driving the shaft';
        case 'gear-load':
          return 'Main engine towing the trawl';
        default:
          return assertNever(state.rule, 'engine load rule');
      }
    case 'stopped':
      switch (state.reason) {
        case 'under-sail':
          return 'Main engine stopped — making way under sail';
        case 'not-under-way':
          return 'Main engine stopped — vessel is not under way';
        default:
          return assertNever(state.reason, 'stopped engine reason');
      }
    default:
      return assertNever(state, 'propulsion state');
  }
};

const electricalDemand = (loads: ElectricalLoads, duty: Duty): Kilowatts => {
  return toKilowatts(loads.hotel + loads.deckMachinery * duty.factor + loads.navigation);
};

export const energyBudget = (
  machinery: Machinery,
  motion: VesselMotion,
  propulsion: PropulsionState,
): EnergyBudget => {
  const { electrical } = machinery;
  const duty = deckMachineryDuty(motion);
  const shaftPower = propulsionPower(propulsion);
  const electricalPower = electricalDemand(electrical, duty);
  const total = shaftPower + electricalPower;

  const share = (power: number): Percent => toPercent(total === 0 ? 0 : (power / total) * 100);

  const consumers: readonly EnergyConsumer[] = [
    {
      id: 'propulsion',
      name: 'Propulsion',
      detail: propulsionDetail(propulsion),
      power: shaftPower,
      share: share(shaftPower),
    },
    {
      id: 'hotel',
      name: 'Hotel and accommodation',
      detail: 'Air conditioning, galley, lighting',
      power: electrical.hotel,
      share: share(electrical.hotel),
    },
    {
      id: 'deck-machinery',
      name: 'Deck and cargo machinery',
      detail: duty.detail,
      power: toKilowatts(electrical.deckMachinery * duty.factor),
      share: share(electrical.deckMachinery * duty.factor),
    },
    {
      id: 'navigation',
      name: 'Navigation and control',
      detail: 'Bridge electronics, radar, steering gear',
      power: electrical.navigation,
      share: share(electrical.navigation),
    },
  ];

  return {
    consumers,
    totalPower: toKilowatts(total),
    electricalPower,
    fuelRate: toKilogramsPerHour(
      propulsionFuelRate(propulsion) + (electricalPower * GENERATOR_CONSUMPTION) / 1000,
    ),
  };
};

export const carbonDioxideRate = (fuelRate: KilogramsPerHour): KilogramsPerHour => {
  return toKilogramsPerHour(fuelRate * CARBON_FACTOR);
};
