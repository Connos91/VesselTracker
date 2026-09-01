declare const brand: unique symbol;

export type Brand<Value, Name extends string> = Value & {
  readonly [brand]: Name;
};

export type Latitude = Brand<number, 'Latitude'>;
export type Longitude = Brand<number, 'Longitude'>;
export type Knots = Brand<number, 'Knots'>;
export type CompassDegrees = Brand<number, 'CompassDegrees'>;
export type Mmsi = Brand<string, 'Mmsi'>;
export type ImoNumber = Brand<string, 'ImoNumber'>;
export type VesselId = Brand<string, 'VesselId'>;

const invalid = (what: string, value: unknown): never => {
  throw new RangeError(`Invalid ${what}: ${JSON.stringify(value)}`);
};

export const toLatitude = (value: number): Latitude => {
  if (!Number.isFinite(value) || value < -90 || value > 90) invalid('latitude', value);
  return value as Latitude;
};

export const toLongitude = (value: number): Longitude => {
  if (!Number.isFinite(value) || value < -180 || value > 180) invalid('longitude', value);
  return value as Longitude;
};

export const toKnots = (value: number): Knots => {
  if (!Number.isFinite(value) || value < 0) invalid('speed in knots', value);
  return value as Knots;
};

export const toCompassDegrees = (value: number): CompassDegrees => {
  if (!Number.isFinite(value) || value < 0 || value >= 360) invalid('compass bearing', value);
  return value as CompassDegrees;
};

export const toMmsi = (value: string): Mmsi => {
  if (!/^\d{9}$/.test(value)) invalid('MMSI', value);
  return value as Mmsi;
};

export const toImoNumber = (value: string): ImoNumber => {
  if (!/^IMO\d{7}$/.test(value)) invalid('IMO number', value);
  return value as ImoNumber;
};

export const toVesselId = (value: string): VesselId => {
  if (value.length === 0) invalid('vessel id', value);
  return value as VesselId;
};

export type Kilowatts = Brand<number, 'Kilowatts'>;
export type Rpm = Brand<number, 'Rpm'>;
export type Percent = Brand<number, 'Percent'>;
export type KilogramsPerHour = Brand<number, 'KilogramsPerHour'>;
export type GramsPerKilowattHour = Brand<number, 'GramsPerKilowattHour'>;

export const toKilowatts = (value: number): Kilowatts => {
  if (!Number.isFinite(value) || value < 0) invalid('power in kilowatts', value);
  return value as Kilowatts;
};

export const toRpm = (value: number): Rpm => {
  if (!Number.isFinite(value) || value < 0) invalid('shaft speed in rpm', value);
  return value as Rpm;
};

export const toPercent = (value: number): Percent => {
  if (!Number.isFinite(value) || value < 0 || value > 100) invalid('percentage', value);
  return value as Percent;
};

export const toKilogramsPerHour = (value: number): KilogramsPerHour => {
  if (!Number.isFinite(value) || value < 0) invalid('mass flow in kg/h', value);
  return value as KilogramsPerHour;
};

export const toGramsPerKilowattHour = (value: number): GramsPerKilowattHour => {
  if (!Number.isFinite(value) || value <= 0) invalid('specific consumption in g/kWh', value);
  return value as GramsPerKilowattHour;
};

export type Timestamp = Brand<number, 'Timestamp'>;
export type Milliseconds = Brand<number, 'Milliseconds'>;
export type NauticalMiles = Brand<number, 'NauticalMiles'>;

export const toTimestamp = (value: number): Timestamp => {
  if (!Number.isFinite(value)) invalid('timestamp', value);
  return value as Timestamp;
};

export const parseTimestamp = (value: string): Timestamp => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) invalid('ISO 8601 timestamp', value);
  return toTimestamp(parsed);
};

export const toMilliseconds = (value: number): Milliseconds => {
  if (!Number.isFinite(value) || value < 0) invalid('duration in milliseconds', value);
  return value as Milliseconds;
};

export const toNauticalMiles = (value: number): NauticalMiles => {
  if (!Number.isFinite(value) || value < 0) invalid('distance in nautical miles', value);
  return value as NauticalMiles;
};
