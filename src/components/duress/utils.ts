import type { DuressCode } from '../../domain/duress';
import { ACTION_LABELS, type LampState } from './constants';

export const describeCode = (code: DuressCode): string => {
  return code
    .map((step) => `${ACTION_LABELS[step.action].toLowerCase()} ×${step.times}`)
    .join(', then ');
};

export const lampState = (isRaised: boolean, isArmed: boolean): LampState => {
  if (isRaised) return 'raised';
  return isArmed ? 'watching' : 'off';
};
