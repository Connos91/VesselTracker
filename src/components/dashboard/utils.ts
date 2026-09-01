import { assertNever } from '../../domain/assertNever';
import { formatBearing, formatSpeed } from '../../domain/format';
import type { PropulsionState } from '../../domain/propulsion';
import type { MainEngines, Vessel, VesselMotion } from '../../domain/vessel';
import { beaufortForce, type ApparentWind } from '../../domain/wind';

export interface Reading {
  readonly term: string;
  readonly value: string;
  readonly key?: 'heading' | 'course' | 'wind';
}

export const motionReadings = (motion: VesselMotion): readonly Reading[] => {
  switch (motion.kind) {
    case 'under-way':
      return [
        { term: 'True heading', value: formatBearing(motion.heading), key: 'heading' },
        {
          term: 'Course over ground',
          value: formatBearing(motion.courseOverGround),
          key: 'course',
        },
      ];
    case 'stationary':
      return [{ term: 'Heading', value: 'Not under way' }];
    default:
      return assertNever(motion, 'vessel motion');
  }
};

export const speedCaption = (motion: VesselMotion, engines: MainEngines): string => {
  switch (motion.kind) {
    case 'under-way':
      return `of the ${formatSpeed(engines.serviceSpeed)} service speed`;
    case 'stationary':
      return `Not under way — service speed is ${formatSpeed(engines.serviceSpeed)}`;
    default:
      return assertNever(motion, 'vessel motion');
  }
};

export const windReadings = (vessel: Vessel, wind: ApparentWind): readonly Reading[] => {
  const force = beaufortForce(vessel.wind.speed);
  const trueWind: Reading = {
    term: 'True wind',
    value: `${formatSpeed(vessel.wind.speed)} from ${formatBearing(vessel.wind.fromDirection)}`,
  };
  const beaufort: Reading = {
    term: 'Beaufort',
    value: `Force ${force.force} — ${force.description}`,
  };

  switch (wind.kind) {
    case 'relative':
      return [
        {
          term: 'Apparent wind',
          value: `${formatSpeed(wind.speed)} from ${formatBearing(wind.fromDirection)}`,
          key: 'wind',
        },
        {
          term: 'Relative to the bow',
          value: `${formatBearing(wind.offBow)} — ${wind.sector}`,
        },
        trueWind,
        beaufort,
      ];
    case 'ambient':
      return [{ ...trueWind, key: 'wind' }, beaufort];
    default:
      return assertNever(wind, 'apparent wind');
  }
};

export const windNote = (wind: ApparentWind): string => {
  switch (wind.kind) {
    case 'relative':
      return 'Apparent wind is the true wind plus the wind the vessel makes for itself along its course.';
    case 'ambient':
      return 'The vessel is not making way, so the anemometer reads the true wind and there is no bow to measure it against.';
    default:
      return assertNever(wind, 'apparent wind');
  }
};

export const loadRuleNote = (propulsion: PropulsionState): string => {
  switch (propulsion.kind) {
    case 'running':
      switch (propulsion.rule) {
        case 'propeller-law':
          return 'Load modelled from the propeller law: delivered power varies with the cube of speed, anchored at the service speed.';
        case 'gear-load':
          return 'Load modelled from the gear: a trawler tows its net at a steady fraction of the rating, whatever the speed over ground.';
        default:
          return assertNever(propulsion.rule, 'engine load rule');
      }
    case 'stopped':
      switch (propulsion.reason) {
        case 'under-sail':
          return 'Main engine stopped: the vessel is making way under sail.';
        case 'not-under-way':
          return 'Main engine stopped: the vessel is not under way. Only the generators are running.';
        default:
          return assertNever(propulsion.reason, 'stopped engine reason');
      }
    default:
      return assertNever(propulsion, 'propulsion state');
  }
};
