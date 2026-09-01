import { useEffect, useState } from 'react';
import {
  createClock,
  DEFAULT_PLAYBACK_RATE,
  elapsedAt,
  isAtEnd,
  isRunning,
  seek,
  stop,
  toggle,
  withDuration,
  withRate,
} from '../domain/playback';
import type { PlaybackRate } from '../domain/playback';
import { sampleVoyage } from '../domain/voyage';
import type { Voyage, VoyageSample } from '../domain/voyage';
import { NO_DURATION } from './constants';
import type { TimelineProps } from './types';
import { timelineStep } from './utils';

export interface UseVoyagePlaybackResult {
  readonly voyage: Voyage | null;
  readonly sample: VoyageSample | null;
  readonly isPlaying: boolean;
  readonly isAtEnd: boolean;
  readonly rate: PlaybackRate;
  readonly togglePlayback: () => void;
  readonly setRate: (rate: PlaybackRate) => void;
  readonly getTimelineProps: () => TimelineProps;
}

export const useVoyagePlayback = (voyage: Voyage | null): UseVoyagePlaybackResult => {
  const duration = voyage?.duration ?? NO_DURATION;
  const [clock, setClock] = useState(() => createClock(duration, DEFAULT_PLAYBACK_RATE));
  const [track, setTrack] = useState(voyage);
  const [now, setNow] = useState(() => performance.now());

  if (track !== voyage) {
    setTrack(voyage);
    setClock(withDuration(clock, duration));
  }

  useEffect(() => {
    if (!isRunning(clock)) return;

    let frame = 0;
    const step = (time: number): void => {
      if (isAtEnd(clock, time)) {
        setClock(stop(clock, time));
        return;
      }
      setNow(time);
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [clock]);

  const elapsed = elapsedAt(clock, now);

  return {
    voyage,
    sample: voyage === null ? null : sampleVoyage(voyage, elapsed),
    isPlaying: isRunning(clock),
    isAtEnd: isAtEnd(clock, now),
    rate: clock.rate,
    togglePlayback: () => setClock(toggle(clock, performance.now())),
    setRate: (rate) => setClock(withRate(clock, rate, performance.now())),
    getTimelineProps: () => ({
      type: 'range',
      min: 0,
      max: duration,
      step: timelineStep(duration),
      value: elapsed,
      onChange: (event) => setClock(seek(clock, Number(event.target.value), performance.now())),
    }),
  };
};
