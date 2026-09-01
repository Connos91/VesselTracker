export const SIZE = 200;
export const CENTER = SIZE / 2;
export const RADIANS_PER_DEGREE = Math.PI / 180;

export const FACE_RADIUS = 94;
export const TICK_OUTER = 92;
export const MINOR_TICK_INNER = 86;
export const MAJOR_TICK_INNER = 80;
export const LETTER_RADIUS = 62;
export const COURSE_NEEDLE_RADIUS = 76;
export const WIND_INDEX_OUTER = 93;
export const WIND_INDEX_INNER = 78;
export const WIND_INDEX_SPREAD = 4;

export const ROSE_POINTS = [
  { bearing: 0, label: 'N', cardinal: true },
  { bearing: 45, label: 'NE', cardinal: false },
  { bearing: 90, label: 'E', cardinal: true },
  { bearing: 135, label: 'SE', cardinal: false },
  { bearing: 180, label: 'S', cardinal: true },
  { bearing: 225, label: 'SW', cardinal: false },
  { bearing: 270, label: 'W', cardinal: true },
  { bearing: 315, label: 'NW', cardinal: false },
] as const;

export const TICK_BEARINGS = Array.from({ length: 36 }, (_, index) => index * 10);

export const COURSE_HEAD_ID = 'compass-course-head';
