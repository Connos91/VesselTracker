import type { LatLngBoundsExpression, PathOptions } from 'leaflet';

export const FALLBACK_BOUNDS: LatLngBoundsExpression = [
  [34.2, 32.2],
  [35.4, 34.3],
];

export const FIT_PADDING: [number, number] = [48, 48];

export const DEPARTURE_STYLE: PathOptions = { className: 'track-departure' };

export const DEPARTURE_RADIUS = 4.5;

export const SELECTED_Z = 1000;
export const PULSE_Z = 900;

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const TILE_MAX_ZOOM = 19;
