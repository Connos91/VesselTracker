import { greatCircleDistance, initialBearing, interpolatePosition } from './geo';
import { toKnots, toMilliseconds, toNauticalMiles, toTimestamp } from './primitives';
import type {
  CompassDegrees,
  Knots,
  Milliseconds,
  NauticalMiles,
  Timestamp,
} from './primitives';
import type { Position } from './vessel';

const MILLISECONDS_PER_HOUR = 3_600_000;

export interface TrackFix {
  readonly at: Timestamp;
  readonly position: Position;
  readonly distanceRun: NauticalMiles;
}

export interface VoyageLeg {
  readonly from: TrackFix;
  readonly to: TrackFix;
  readonly distance: NauticalMiles;
  readonly course: CompassDegrees;
  readonly speed: Knots;
}

export interface Voyage {
  readonly from: string;
  readonly to: string;
  readonly fixes: readonly [TrackFix, TrackFix, ...TrackFix[]];
  readonly legs: readonly [VoyageLeg, ...VoyageLeg[]];
  readonly departedAt: Timestamp;
  readonly reportedAt: Timestamp;
  readonly duration: Milliseconds;
  readonly distance: NauticalMiles;
}

export interface TrackReport {
  readonly at: Timestamp;
  readonly position: Position;
}

export interface VoyagePlan {
  readonly from: string;
  readonly to: string;
  readonly track: readonly TrackReport[];
}

const fixAfter = (previous: TrackFix, report: TrackReport): TrackFix => {
  if (report.at <= previous.at) {
    throw new RangeError(
      `Track fixes must advance in time: ${new Date(report.at).toISOString()} does not follow ${new Date(previous.at).toISOString()}`,
    );
  }
  const distance = greatCircleDistance(previous.position, report.position);
  return {
    at: report.at,
    position: report.position,
    distanceRun: toNauticalMiles(previous.distanceRun + distance),
  };
};

const legBetween = (from: TrackFix, to: TrackFix): VoyageLeg => {
  const distance = toNauticalMiles(to.distanceRun - from.distanceRun);
  const hours = (to.at - from.at) / MILLISECONDS_PER_HOUR;
  return {
    from,
    to,
    distance,
    course: initialBearing(from.position, to.position),
    speed: toKnots(distance / hours),
  };
};

export const buildVoyage = (plan: VoyagePlan): Voyage => {
  const [departure, second, ...rest] = plan.track;
  if (departure === undefined || second === undefined) {
    throw new RangeError(
      `A voyage needs at least two track fixes, ${plan.track.length} given for ${plan.from} to ${plan.to}`,
    );
  }

  const first: TrackFix = {
    at: departure.at,
    position: departure.position,
    distanceRun: toNauticalMiles(0),
  };
  const secondFix = fixAfter(first, second);

  const laterFixes: TrackFix[] = [];
  const laterLegs: VoyageLeg[] = [];
  let last: TrackFix = secondFix;
  for (const report of rest) {
    const next = fixAfter(last, report);
    laterFixes.push(next);
    laterLegs.push(legBetween(last, next));
    last = next;
  }

  const fixes: readonly [TrackFix, TrackFix, ...TrackFix[]] = [first, secondFix, ...laterFixes];
  const legs: readonly [VoyageLeg, ...VoyageLeg[]] = [
    legBetween(first, secondFix),
    ...laterLegs,
  ];

  return {
    from: plan.from,
    to: plan.to,
    fixes,
    legs,
    departedAt: first.at,
    reportedAt: last.at,
    duration: toMilliseconds(last.at - first.at),
    distance: last.distanceRun,
  };
};

export interface VoyageSample {
  readonly at: Timestamp;
  readonly position: Position;
  readonly course: CompassDegrees;
  readonly speed: Knots;
  readonly distanceRun: NauticalMiles;
  readonly elapsed: Milliseconds;
}

const legAt = (voyage: Voyage, time: Timestamp): VoyageLeg => {
  let current: VoyageLeg = voyage.legs[0];
  for (const leg of voyage.legs) {
    if (leg.from.at > time) break;
    current = leg;
  }
  return current;
};

export const sampleVoyage = (voyage: Voyage, elapsed: number): VoyageSample => {
  const run = toMilliseconds(Math.min(Math.max(elapsed, 0), voyage.duration));
  const time = toTimestamp(voyage.departedAt + run);
  const leg = legAt(voyage, time);

  const span = leg.to.at - leg.from.at;
  const fraction = span === 0 ? 1 : (time - leg.from.at) / span;

  return {
    at: time,
    position: interpolatePosition(leg.from.position, leg.to.position, fraction),
    course: leg.course,
    speed: leg.speed,
    distanceRun: toNauticalMiles(leg.from.distanceRun + leg.distance * fraction),
    elapsed: run,
  };
};

export const trackRun = (voyage: Voyage, sample: VoyageSample): readonly Position[] => {
  const run = voyage.fixes.filter((fix) => fix.at < sample.at).map((fix) => fix.position);
  return [...run, sample.position];
};

export const trackRoute = (voyage: Voyage): readonly Position[] => {
  return voyage.fixes.map((fix) => fix.position);
};
