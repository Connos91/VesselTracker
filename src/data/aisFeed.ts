import type { Vessel } from '../domain/vessel';
import { SEED_VESSELS } from './seedVessels';

const FEED_LATENCY = 450;

export const fetchFleet = async (): Promise<readonly Vessel[]> => {
  await new Promise((resolve) => setTimeout(resolve, FEED_LATENCY));
  return SEED_VESSELS;
};

export const SNAPSHOT_LOADED_AT = Date.now();
