import { latLngBounds } from 'leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import type { Position, Vessel } from '../../domain/vessel';
import { FALLBACK_BOUNDS } from './constants';

export const toTuple = (position: Position): LatLngTuple => {
  return [position.latitude, position.longitude];
};

export const boundsForVessels = (vessels: readonly Vessel[]): LatLngBoundsExpression => {
  if (vessels.length === 0) return FALLBACK_BOUNDS;
  return latLngBounds(vessels.map((vessel) => toTuple(vessel.position)));
};

export const prefersReducedMotion = (): boolean => {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};
