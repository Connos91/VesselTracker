import { describe, expect, it } from 'vitest';
import {
  createClock,
  DEFAULT_PLAYBACK_RATE,
  elapsedAt,
  isAtEnd,
  isRunning,
  parsePlaybackRate,
  seek,
  start,
  stop,
  toggle,
  withDuration,
  withRate,
} from '../playback';
import type { PlaybackClock } from '../playback';
import { toMilliseconds } from '../primitives';

const DURATION = toMilliseconds(4 * 3_600_000);
const START = 1_000;
const ONE_HOUR = 3_600_000;

const parked = (): PlaybackClock => {
  return createClock(DURATION, 1);
};

describe('createClock', () => {
  it('opens parked on the last fix, where the vessel actually is', () => {
    const clock = parked();
    expect(isRunning(clock)).toBe(false);
    expect(elapsedAt(clock, START)).toBe(DURATION);
    expect(isAtEnd(clock, START)).toBe(true);
  });
});

describe('elapsedAt', () => {
  it('plays voyage time at the chosen multiple of real time', () => {
    const running = start(seek(parked(), 0, START), START);

    expect(elapsedAt(running, START)).toBe(0);
    expect(elapsedAt(running, START + 1_000)).toBe(ONE_HOUR);
    expect(elapsedAt(running, START + 2_500)).toBe(2.5 * ONE_HOUR);
  });

  it('reads the same however many times the frame is missed', () => {
    const running = start(seek(parked(), 0, START), START);
    expect(elapsedAt(running, START + 3_000)).toBe(3 * ONE_HOUR);
  });

  it('scales with the rate', () => {
    const fast = withRate(start(seek(parked(), 0, START), START), 2, START);
    expect(elapsedAt(fast, START + 500)).toBe(ONE_HOUR);
  });

  it('never runs past the end of the passage', () => {
    const running = start(seek(parked(), 0, START), START);
    expect(elapsedAt(running, START + 60_000)).toBe(DURATION);
    expect(isAtEnd(running, START + 60_000)).toBe(true);
  });

  it('treats a reading from before the anchor as no time at all', () => {
    const running = start(seek(parked(), ONE_HOUR, START), START);
    expect(elapsedAt(running, START - 5_000)).toBe(ONE_HOUR);
  });
});

describe('start and stop', () => {
  it('replays from departure when it is parked at the end', () => {
    const running = start(parked(), START);
    expect(elapsedAt(running, START)).toBe(0);
  });

  it('resumes from where it was paused', () => {
    const paused = seek(parked(), 2 * ONE_HOUR, START);
    const running = start(paused, START);
    expect(elapsedAt(running, START + 500)).toBe(2.5 * ONE_HOUR);
  });

  it('stops where the passage had got to', () => {
    const running = start(seek(parked(), 0, START), START);
    const stopped = stop(running, START + 1_500);

    expect(isRunning(stopped)).toBe(false);
    expect(elapsedAt(stopped, START + 90_000)).toBe(1.5 * ONE_HOUR);
  });

  it('toggles between the two', () => {
    const running = toggle(parked(), START);
    expect(isRunning(running)).toBe(true);
    expect(isRunning(toggle(running, START + 1_000))).toBe(false);
  });
});

describe('seek', () => {
  it('moves a paused playhead and leaves it paused', () => {
    const scrubbed = seek(parked(), ONE_HOUR, START);
    expect(isRunning(scrubbed)).toBe(false);
    expect(elapsedAt(scrubbed, START + 10_000)).toBe(ONE_HOUR);
  });

  it('keeps a running playhead running, from the new point', () => {
    const running = start(seek(parked(), 0, START), START);
    const scrubbed = seek(running, 3 * ONE_HOUR, START + 400);

    expect(isRunning(scrubbed)).toBe(true);
    expect(elapsedAt(scrubbed, START + 400)).toBe(3 * ONE_HOUR);
    expect(elapsedAt(scrubbed, START + 900)).toBe(3.5 * ONE_HOUR);
  });

  it('clamps to the ends of the passage', () => {
    expect(elapsedAt(seek(parked(), -1, START), START)).toBe(0);
    expect(elapsedAt(seek(parked(), DURATION + 1, START), START)).toBe(DURATION);
  });
});

describe('withRate', () => {
  it('changes speed without moving the playhead', () => {
    const running = start(seek(parked(), 0, START), START);
    const faster = withRate(running, 3, START + 1_000);

    expect(elapsedAt(faster, START + 1_000)).toBe(ONE_HOUR);
    expect(faster.rate).toBe(3);
    expect(elapsedAt(faster, START + 2_000)).toBe(4 * ONE_HOUR);
  });

  it('leaves a paused clock paused', () => {
    expect(isRunning(withRate(parked(), 2, START))).toBe(false);
  });
});

describe('withDuration', () => {
  it('parks on the end of the new passage but keeps the chosen speed', () => {
    const other = toMilliseconds(9 * 3_600_000);
    const clock = withDuration(withRate(parked(), 2, START), other);

    expect(clock.rate).toBe(2);
    expect(elapsedAt(clock, START)).toBe(other);
  });
});

describe('parsePlaybackRate', () => {
  it('takes an offered speed and falls back for anything else', () => {
    expect(parsePlaybackRate('2')).toBe(2);
    expect(parsePlaybackRate('99')).toBe(DEFAULT_PLAYBACK_RATE);
    expect(parsePlaybackRate('')).toBe(DEFAULT_PLAYBACK_RATE);
  });
});
