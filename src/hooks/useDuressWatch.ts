import type { Vessel } from '../domain/vessel';
import { selectWatches } from '../store/duressSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { VesselDuress } from './types';
import { vesselDuress, watchFor } from './utils';

export type { VesselDuress };

export interface UseDuressWatchResult {
  readonly raised: readonly Vessel[];
  readonly isRaisedFor: (vessel: Vessel) => boolean;
  readonly forVessel: (vessel: Vessel) => VesselDuress;
}

export const useDuressWatch = (vessels: readonly Vessel[]): UseDuressWatchResult => {
  const watches = useAppSelector(selectWatches);
  const dispatch = useAppDispatch();

  const isRaisedFor = (vessel: Vessel): boolean =>
    watchFor(watches, vessel.id).kind === 'raised';

  return {
    raised: vessels.filter(isRaisedFor),
    isRaisedFor,
    forVessel: (vessel) => vesselDuress(vessel, watchFor(watches, vessel.id), dispatch),
  };
};
