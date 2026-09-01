import type {
  CompassDegrees,
  GramsPerKilowattHour,
  Kilowatts,
  KilogramsPerHour,
  Knots,
  Latitude,
  Longitude,
  Milliseconds,
  NauticalMiles,
  Percent,
  Rpm,
  Timestamp,
} from './primitives';
import type { Position } from './vessel';

interface DegreesMinutesSeconds {
  readonly degrees: number;
  readonly minutes: number;
  readonly seconds: number;
}

export const toDegreesMinutesSeconds = (absoluteDegrees: number): DegreesMinutesSeconds => {
  const totalSeconds = Math.round(absoluteDegrees * 36_000) / 10;
  const degrees = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - degrees * 3600) / 60);
  const seconds = totalSeconds - degrees * 3600 - minutes * 60;
  return { degrees, minutes, seconds };
};

const formatDms = (value: number, degreeWidth: number, hemisphere: string): string => {
  const { degrees, minutes, seconds } = toDegreesMinutesSeconds(Math.abs(value));
  const d = String(degrees).padStart(degreeWidth, '0');
  const m = String(minutes).padStart(2, '0');
  const s = seconds.toFixed(1).padStart(4, '0');
  return `${d}° ${m}' ${s}" ${hemisphere}`;
};

export const formatLatitude = (latitude: Latitude): string => {
  return formatDms(latitude, 2, latitude < 0 ? 'S' : 'N');
};

export const formatLongitude = (longitude: Longitude): string => {
  return formatDms(longitude, 3, longitude < 0 ? 'W' : 'E');
};

export const formatPosition = (position: Position): string => {
  return `${formatLatitude(position.latitude)}, ${formatLongitude(position.longitude)}`;
};

export const formatDecimalDegrees = (position: Position): string => {
  const lat = `${Math.abs(position.latitude).toFixed(4)}° ${position.latitude < 0 ? 'S' : 'N'}`;
  const lon = `${Math.abs(position.longitude).toFixed(4)}° ${position.longitude < 0 ? 'W' : 'E'}`;
  return `${lat}, ${lon}`;
};

export const formatSpeed = (speed: Knots): string => {
  return `${speed.toFixed(1)} kn`;
};

export const formatBearing = (bearing: CompassDegrees): string => {
  return `${String(Math.round(bearing)).padStart(3, '0')}°`;
};

const groupThousands = (digits: string): string => {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatMagnitude = (value: number, unit: string): string => {
  if (value === 0) return `0 ${unit}`;
  if (value < 10) return `${value.toFixed(1)} ${unit}`;
  return `${groupThousands(value.toFixed(0))} ${unit}`;
};

export const formatPower = (power: Kilowatts): string => {
  return formatMagnitude(power, 'kW');
};

export const formatPercent = (value: Percent): string => {
  if (value === 0) return '0%';
  return `${value.toFixed(value < 10 ? 1 : 0)}%`;
};

export const formatShaftSpeed = (speed: Rpm): string => {
  return `${groupThousands(speed.toFixed(0))} rpm`;
};

export const formatMassRate = (rate: KilogramsPerHour): string => {
  return formatMagnitude(rate, 'kg/h');
};

export const formatDailyMass = (rate: KilogramsPerHour): string => {
  const perDay = rate * 24;
  if (perDay < 1000) return `${groupThousands(perDay.toFixed(0))} kg/day`;
  return `${(perDay / 1000).toFixed(1)} t/day`;
};

export const formatDailyEnergy = (power: Kilowatts): string => {
  return `${((power * 24) / 1000).toFixed(1)} MWh/day`;
};

export const formatSpecificConsumption = (value: GramsPerKilowattHour): string => {
  return `${value.toFixed(0)} g/kWh`;
};

export const formatDistance = (distance: NauticalMiles): string => {
  return formatMagnitude(distance, 'nm');
};

const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 60_000;

export const formatDuration = (duration: Milliseconds): string => {
  const totalMinutes = Math.round(duration / MILLISECONDS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${minutes} min`;
  return `${groupThousands(String(hours))} h ${String(minutes).padStart(2, '0')} min`;
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const formatInstant = (instant: Timestamp): string => {
  const date = new Date(instant);
  const month = MONTHS[date.getUTCMonth()];
  if (month === undefined) throw new RangeError(`Unreachable month ${date.getUTCMonth()}`);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes} UTC`;
};
