import { latLngBounds } from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { FIT_PADDING } from './constants';
import { prefersReducedMotion } from './utils';

export const PanToSelection = ({
  latitude,
  longitude,
}: {
  readonly latitude: number | null;
  readonly longitude: number | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) return;
    map.panTo([latitude, longitude], { animate: !prefersReducedMotion() });
  }, [map, latitude, longitude]);

  return null;
};

export const FitToRoute = ({ positions }: { readonly positions: LatLngTuple[] }) => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(latLngBounds(positions), {
      padding: FIT_PADDING,
      animate: !prefersReducedMotion(),
    });
  }, [map, positions]);

  return null;
};
