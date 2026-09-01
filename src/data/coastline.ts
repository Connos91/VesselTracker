import { greatCircleDistance } from '../domain/geo';
import { toLatitude, toLongitude, toNauticalMiles } from '../domain/primitives';
import type { NauticalMiles } from '../domain/primitives';
import type { Position } from '../domain/vessel';

const at = (latitude: number, longitude: number): Position => {
  return { latitude: toLatitude(latitude), longitude: toLongitude(longitude) };
};

interface LandDisc {
  readonly kind: 'disc';
  readonly name: string;
  readonly centre: Position;
  readonly radius: NauticalMiles;
}

interface LandOutline {
  readonly kind: 'outline';
  readonly name: string;
  readonly boundary: readonly Position[];
}

export type Landmass = LandDisc | LandOutline;

const disc = (name: string, latitude: number, longitude: number, radius: number): LandDisc => {
  return {
    kind: 'disc',
    name,
    centre: at(latitude, longitude),
    radius: toNauticalMiles(radius),
  };
};

const outline = (
  name: string,
  boundary: readonly (readonly [number, number])[],
): LandOutline => {
  return {
    kind: 'outline',
    name,
    boundary: boundary.map(([latitude, longitude]) => at(latitude, longitude)),
  };
};

const CYPRUS = outline('Cyprus', [
  [35.06, 32.33],
  [35.18, 32.62],
  [35.3, 32.92],
  [35.28, 33.25],
  [35.26, 33.6],
  [35.3, 33.92],
  [35.45, 34.18],
  [35.58, 34.45],
  [35.5, 34.28],
  [35.32, 33.95],
  [35.2, 33.9],
  [35.12, 33.92],
  [35.03, 33.98],
  [34.99, 34.04],
  [34.95, 34.06],
  [34.97, 34.0],
  [34.89, 33.85],
  [34.9, 33.65],
  [34.84, 33.61],
  [34.73, 33.55],
  [34.73, 33.45],
  [34.73, 33.3],
  [34.71, 33.15],
  [34.68, 33.05],
  [34.65, 33.02],
  [34.6, 33.01],
  [34.57, 33.02],
  [34.57, 32.97],
  [34.61, 32.94],
  [34.66, 32.96],
  [34.68, 32.88],
  [34.66, 32.75],
  [34.62, 32.65],
  [34.7, 32.57],
  [34.76, 32.43],
  [34.89, 32.34],
  [35.0, 32.31],
]);

const ATTICA = outline('Attica', [
  [37.95, 23.65],
  [37.88, 23.77],
  [37.82, 23.8],
  [37.74, 23.95],
  [37.66, 24.04],
  [37.76, 24.06],
  [37.9, 23.97],
  [38.0, 23.82],
  [38.0, 23.62],
]);

export const LANDMASSES: readonly Landmass[] = [
  CYPRUS,
  ATTICA,
  disc('Salamis', 37.945, 23.5, 5),
  disc('Aegina', 37.735, 23.485, 4.5),
  disc('Kea', 37.65, 24.35, 5.5),
  disc('Kythnos', 37.385, 24.425, 4.5),
  disc('Serifos', 37.165, 24.495, 3.5),
  disc('Sifnos', 36.96, 24.705, 5),
  disc('Milos', 36.71, 24.465, 6.5),
  disc('Kimolos', 36.805, 24.575, 2.5),
  disc('Paros', 37.05, 25.2, 7.5),
  disc('Naxos', 37.05, 25.475, 8),
  disc('Folegandros', 36.63, 24.91, 4),
  disc('Sikinos', 36.69, 25.135, 3),
  disc('Ios', 36.715, 25.325, 5.5),
  disc('Santorini', 36.405, 25.405, 5.5),
  disc('Anafi', 36.37, 25.785, 3.5),
  disc('Amorgos (west)', 36.82, 25.85, 3),
  disc('Amorgos (east)', 36.9, 25.97, 3),
  disc('Astypalaia', 36.565, 26.355, 5),
  disc('Crete (east)', 35.2, 25.95, 14),
  disc('Crete (north-east)', 35.2, 26.2, 10),
  disc('Kasos', 35.4, 26.935, 4),
  disc('Karpathos (south)', 35.5, 27.13, 5),
  disc('Karpathos (middle)', 35.65, 27.16, 5),
  disc('Karpathos (north)', 35.8, 27.2, 4.5),
  disc('Saria', 35.87, 27.22, 2),
  disc('Rhodes (south)', 36.0, 27.85, 9),
  disc('Rhodes (north)', 36.35, 28.1, 9),
  disc('Anatolia (Antalya)', 36.6, 30.5, 12),
  disc('Anatolia (Silifke)', 36.5, 32.5, 12),
  disc('Nile delta', 31.15, 32.3, 6),
  disc('Sinai', 31.0, 33.2, 8),
];

const insideOutline = (position: Position, land: LandOutline): boolean => {
  let inside = false;
  for (let index = 0; index < land.boundary.length; index += 1) {
    const previous = land.boundary[(index + land.boundary.length - 1) % land.boundary.length];
    const current = land.boundary[index];
    if (previous === undefined || current === undefined) continue;

    const straddles =
      current.latitude > position.latitude !== previous.latitude > position.latitude;
    if (!straddles) continue;

    const crossing =
      current.longitude +
      ((position.latitude - current.latitude) / (previous.latitude - current.latitude)) *
        (previous.longitude - current.longitude);
    if (position.longitude < crossing) inside = !inside;
  }
  return inside;
};

export const landUnder = (position: Position): Landmass | null => {
  for (const land of LANDMASSES) {
    const aground =
      land.kind === 'disc'
        ? greatCircleDistance(position, land.centre) <= land.radius
        : insideOutline(position, land);
    if (aground) return land;
  }
  return null;
};
