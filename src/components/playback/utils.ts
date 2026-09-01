import {
  formatBearing,
  formatDistance,
  formatDuration,
  formatInstant,
  formatSpeed,
} from '../../domain/format';
import type { Voyage, VoyageSample } from '../../domain/voyage';
import type { UseVoyagePlaybackResult } from '../../hooks/useVoyagePlayback';

export interface Reading {
  readonly term: string;
  readonly value: string;
}

export const transportLabel = (playback: UseVoyagePlaybackResult): string => {
  if (playback.isPlaying) return 'Pause';
  if (playback.isAtEnd) return 'Replay';
  return 'Play';
};

export const transportReadings = (voyage: Voyage, sample: VoyageSample): readonly Reading[] => {
  return [
    {
      term: 'Elapsed',
      value: `${formatDuration(sample.elapsed)} of ${formatDuration(voyage.duration)}`,
    },
    { term: 'At', value: formatInstant(sample.at) },
    {
      term: 'Run',
      value: `${formatDistance(sample.distanceRun)} of ${formatDistance(voyage.distance)}`,
    },
    { term: 'Speed made good', value: formatSpeed(sample.speed) },
    { term: 'Course made good', value: formatBearing(sample.course) },
  ];
};

export const timelineValueText = (sample: VoyageSample): string => {
  return `${formatDuration(sample.elapsed)}, ${formatInstant(sample.at)}`;
};
