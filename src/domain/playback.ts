import { assertNever } from './assertNever';
import { toMilliseconds } from './primitives';
import type { Milliseconds } from './primitives';

export const PLAYBACK_RATES = [1, 2, 3] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 3;
const MILLISECONDS_PER_HOUR_PER_SECOND = 3600;

export type PlaybackCursor =
  | { readonly kind: 'paused'; readonly elapsed: Milliseconds }
  | {
      readonly kind: 'running';
      readonly since: number;
      readonly from: Milliseconds;
    };

export interface PlaybackClock {
  readonly duration: Milliseconds;
  readonly rate: PlaybackRate;
  readonly cursor: PlaybackCursor;
}

export const createClock = (duration: Milliseconds, rate: PlaybackRate): PlaybackClock => {
  return { duration, rate, cursor: { kind: 'paused', elapsed: duration } };
};

const clamp = (elapsed: number, duration: Milliseconds): Milliseconds => {
  return toMilliseconds(Math.min(Math.max(elapsed, 0), duration));
};

export const elapsedAt = (clock: PlaybackClock, now: number): Milliseconds => {
  switch (clock.cursor.kind) {
    case 'paused':
      return clock.cursor.elapsed;
    case 'running': {
      const real = Math.max(0, now - clock.cursor.since);
      const played = real * clock.rate * MILLISECONDS_PER_HOUR_PER_SECOND;
      return clamp(clock.cursor.from + played, clock.duration);
    }
    default:
      return assertNever(clock.cursor, 'playback cursor');
  }
};

export const isRunning = (clock: PlaybackClock): boolean => {
  return clock.cursor.kind === 'running';
};

export const isAtEnd = (clock: PlaybackClock, now: number): boolean => {
  return elapsedAt(clock, now) >= clock.duration;
};

export const start = (clock: PlaybackClock, now: number): PlaybackClock => {
  const elapsed = elapsedAt(clock, now);
  const from = elapsed >= clock.duration ? toMilliseconds(0) : elapsed;
  return { ...clock, cursor: { kind: 'running', since: now, from } };
};

export const stop = (clock: PlaybackClock, now: number): PlaybackClock => {
  return { ...clock, cursor: { kind: 'paused', elapsed: elapsedAt(clock, now) } };
};

export const toggle = (clock: PlaybackClock, now: number): PlaybackClock => {
  return isRunning(clock) ? stop(clock, now) : start(clock, now);
};

export const seek = (clock: PlaybackClock, elapsed: number, now: number): PlaybackClock => {
  const to = clamp(elapsed, clock.duration);
  if (clock.cursor.kind === 'running') {
    return { ...clock, cursor: { kind: 'running', since: now, from: to } };
  }
  return { ...clock, cursor: { kind: 'paused', elapsed: to } };
};

export const withRate = (
  clock: PlaybackClock,
  rate: PlaybackRate,
  now: number,
): PlaybackClock => {
  return { ...seek(clock, elapsedAt(clock, now), now), rate };
};

export const withDuration = (clock: PlaybackClock, duration: Milliseconds): PlaybackClock => {
  return createClock(duration, clock.rate);
};

export const parsePlaybackRate = (raw: string): PlaybackRate => {
  return PLAYBACK_RATES.find((rate) => String(rate) === raw) ?? DEFAULT_PLAYBACK_RATE;
};
