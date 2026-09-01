import { assertNever } from '../../domain/assertNever';
import {
  formatBearing,
  formatDecimalDegrees,
  formatPosition,
  formatSpeed,
} from '../../domain/format';
import type { Vessel, VesselMotion } from '../../domain/vessel';
import { NOT_UNDER_WAY } from './constants';

export interface DetailRow {
  readonly term: string;
  readonly value: string;
}

const motionRows = (motion: VesselMotion): readonly DetailRow[] => {
  switch (motion.kind) {
    case 'under-way':
      return [
        { term: 'Navigational status', value: motion.status },
        { term: 'Speed over ground', value: formatSpeed(motion.speedOverGround) },
        { term: 'Course over ground', value: formatBearing(motion.courseOverGround) },
        { term: 'True heading', value: formatBearing(motion.heading) },
      ];
    case 'stationary':
      return [
        { term: 'Navigational status', value: motion.status },
        { term: 'Speed over ground', value: formatSpeed(motion.speedOverGround) },
        { term: 'Course over ground', value: NOT_UNDER_WAY },
        { term: 'True heading', value: NOT_UNDER_WAY },
      ];
    default:
      return assertNever(motion, 'vessel motion');
  }
};

export const detailRows = (vessel: Vessel): readonly DetailRow[] => {
  return [
    { term: 'MMSI', value: vessel.mmsi },
    { term: 'IMO number', value: vessel.imo },
    { term: 'Vessel type', value: vessel.type },
    { term: 'Position (DMS)', value: formatPosition(vessel.position) },
    { term: 'Position (decimal)', value: formatDecimalDegrees(vessel.position) },
    ...motionRows(vessel.motion),
    { term: 'Destination', value: vessel.destination },
  ];
};

export const selectionAnnouncement = (vessel: Vessel | null): string => {
  if (vessel === null) return '';
  return `${vessel.name} selected. ${vessel.type}, ${vessel.motion.status}, making ${formatSpeed(vessel.motion.speedOverGround)}.`;
};
