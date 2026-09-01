import { assertNever } from './assertNever';
import { toMilliseconds, toTimestamp } from './primitives';
import type { Milliseconds, Timestamp } from './primitives';

export const CABIN_ACTIONS = [
  'toilet-flush',
  'toilet-light',
  'cabin-light',
  'wash-basin-tap',
] as const;

export type CabinAction = (typeof CABIN_ACTIONS)[number];

export interface CabinEvent {
  readonly action: CabinAction;
  readonly at: Timestamp;
}

export interface DuressStep {
  readonly action: CabinAction;
  readonly times: number;
}

export type DuressCode = readonly [DuressStep, ...DuressStep[]];

export const DURESS_WINDOW: Milliseconds = toMilliseconds(180_000);

export const expandCode = (code: DuressCode): readonly CabinAction[] => {
  return code.flatMap((step) => Array.from({ length: step.times }, () => step.action));
};

export const codeLength = (code: DuressCode): number => {
  return code.reduce((total, step) => total + step.times, 0);
};

export const codeProgress = (events: readonly CabinEvent[], code: DuressCode): number => {
  const wanted = expandCode(code);
  const actions = events.map((event) => event.action);

  for (let length = Math.min(wanted.length, actions.length); length > 0; length -= 1) {
    const tail = actions.slice(actions.length - length);
    if (tail.every((action, index) => action === wanted[index])) return length;
  }
  return 0;
};

export type DuressWatch =
  | { readonly kind: 'off' }
  | { readonly kind: 'watching'; readonly recent: readonly CabinEvent[] }
  | { readonly kind: 'raised'; readonly at: Timestamp };

export const WATCH_OFF: DuressWatch = { kind: 'off' };

export const armWatch = (watch: DuressWatch): DuressWatch => {
  switch (watch.kind) {
    case 'off':
      return { kind: 'watching', recent: [] };
    case 'watching':
    case 'raised':
      return watch;
    default:
      return assertNever(watch, 'duress watch');
  }
};

export const disarmWatch = (watch: DuressWatch): DuressWatch => {
  switch (watch.kind) {
    case 'watching':
      return WATCH_OFF;
    case 'off':
    case 'raised':
      return watch;
    default:
      return assertNever(watch, 'duress watch');
  }
};

export const acknowledgeWatch = (watch: DuressWatch): DuressWatch => {
  return watch.kind === 'raised' ? { kind: 'watching', recent: [] } : watch;
};

export const recordCabinEvent = (
  watch: DuressWatch,
  event: CabinEvent,
  code: DuressCode,
): DuressWatch => {
  if (watch.kind !== 'watching') return watch;

  const oldest = event.at - DURESS_WINDOW;
  const recent = [...watch.recent.filter((seen) => seen.at >= oldest), event];

  return codeProgress(recent, code) === codeLength(code)
    ? { kind: 'raised', at: event.at }
    : { kind: 'watching', recent };
};

export const cabinEvent = (action: CabinAction, at: number): CabinEvent => {
  return { action, at: toTimestamp(at) };
};
