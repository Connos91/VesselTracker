import { useQuery } from '@tanstack/react-query';
import { fetchFleet, SNAPSHOT_LOADED_AT } from '../data/aisFeed';
import { SEED_VESSELS } from '../data/seedVessels';
import type { Vessel } from '../domain/vessel';
import { toTimestamp } from '../domain/primitives';
import type { Timestamp } from '../domain/primitives';
import { FLEET_QUERY_KEY, FLEET_STALE_TIME } from './constants';

export interface UseFleetResult {
  readonly vessels: readonly Vessel[];
  readonly isRefreshing: boolean;
  readonly hasFeedError: boolean;
  readonly updatedAt: Timestamp;
  readonly refresh: () => void;
}

export const useFleet = (): UseFleetResult => {
  const query = useQuery({
    queryKey: FLEET_QUERY_KEY,
    queryFn: fetchFleet,
    initialData: SEED_VESSELS,
    initialDataUpdatedAt: SNAPSHOT_LOADED_AT,
    staleTime: FLEET_STALE_TIME,
  });

  return {
    vessels: query.data,
    isRefreshing: query.isFetching,
    hasFeedError: query.isError,
    updatedAt: toTimestamp(query.dataUpdatedAt),
    refresh: () => {
      void query.refetch();
    },
  };
};
